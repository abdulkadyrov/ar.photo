create type public.media_upload_status as enum (
  'pending',
  'uploading',
  'failed',
  'finalized',
  'aborted',
  'expired'
);

alter table public.media_assets
add column group_id uuid;

alter table public.media_assets
add constraint media_assets_group_project_account_fkey
foreign key (group_id, project_id, account_id)
references public.groups(id, project_id, account_id)
on update cascade
on delete cascade;

create index media_assets_group_project_account_idx
on public.media_assets(group_id, project_id, account_id)
where group_id is not null;

create unique index media_assets_group_kind_version_idx
on public.media_assets(account_id, group_id, kind, version)
where group_id is not null and deleted_at is null and kind in ('marker', 'video');

create table public.upload_sessions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  project_id uuid not null,
  group_id uuid not null,
  ar_item_id uuid,
  kind text not null,
  status public.media_upload_status not null default 'pending',
  storage_bucket text not null,
  storage_path text not null,
  original_file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  bytes_uploaded bigint not null default 0,
  version integer not null,
  idempotency_key uuid not null,
  asset_id uuid references public.media_assets(id) on delete set null,
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  completed_at timestamptz,
  constraint upload_sessions_group_project_account_fkey
    foreign key (group_id, project_id, account_id)
    references public.groups(id, project_id, account_id) on update cascade on delete cascade,
  constraint upload_sessions_item_account_fkey
    foreign key (ar_item_id, account_id)
    references public.ar_items(id, account_id) on delete cascade,
  constraint upload_sessions_idempotency_unique unique (account_id, idempotency_key),
  constraint upload_sessions_storage_unique unique (storage_bucket, storage_path),
  constraint upload_sessions_kind check (kind in ('marker', 'video')),
  constraint upload_sessions_file_name_length check (char_length(original_file_name) between 1 and 255),
  constraint upload_sessions_size_positive check (size_bytes > 0),
  constraint upload_sessions_progress_range check (bytes_uploaded between 0 and size_bytes),
  constraint upload_sessions_version_positive check (version > 0),
  constraint upload_sessions_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint upload_sessions_completion_consistency check (
    (status = 'finalized' and completed_at is not null and asset_id is not null)
    or (status <> 'finalized' and completed_at is null)
  )
);

create index upload_sessions_account_status_idx
on public.upload_sessions(account_id, status, expires_at);
create index upload_sessions_project_id_idx on public.upload_sessions(project_id);
create index upload_sessions_group_project_account_idx
on public.upload_sessions(group_id, project_id, account_id);
create index upload_sessions_ar_item_account_idx
on public.upload_sessions(ar_item_id, account_id)
where ar_item_id is not null;
create index upload_sessions_asset_id_idx
on public.upload_sessions(asset_id)
where asset_id is not null;
create index upload_sessions_created_by_idx on public.upload_sessions(created_by);
create index upload_sessions_cleanup_idx
on public.upload_sessions(expires_at, created_at)
where status in ('pending', 'uploading', 'failed');

create trigger upload_sessions_set_updated_at
before update on public.upload_sessions
for each row execute function private.set_updated_at();

create trigger upload_sessions_audit
after insert or update or delete on public.upload_sessions
for each row execute function private.write_audit_log();

create trigger media_assets_audit
after insert or update or delete on public.media_assets
for each row execute function private.write_audit_log();

alter table public.upload_sessions enable row level security;
alter table public.upload_sessions force row level security;

create policy upload_sessions_read on public.upload_sessions
for select to authenticated
using ((select private.has_account_access(account_id)));

revoke all on table public.upload_sessions from anon, authenticated;
grant select on table public.upload_sessions to authenticated;

create or replace function public.begin_media_upload(
  p_target_account_id uuid,
  p_target_project_id uuid,
  p_target_group_id uuid,
  p_kind text,
  p_original_file_name text,
  p_mime_type text,
  p_size_bytes bigint,
  p_request_id uuid
)
returns public.upload_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_session public.upload_sessions;
  created_session public.upload_sessions;
  session_id uuid := extensions.gen_random_uuid();
  target_bucket text;
  target_extension text;
  next_version integer;
  storage_limit bigint;
  media_limit bigint;
  reserved_bytes bigint;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.groups g
    join public.projects p
      on p.id = g.project_id and p.account_id = g.account_id
    where g.id = p_target_group_id
      and g.project_id = p_target_project_id
      and g.account_id = p_target_account_id
      and g.deleted_at is null
      and g.archived_at is null
      and p.deleted_at is null
      and p.status <> 'archived'
  ) then
    raise exception 'Active project group not found' using errcode = '23503';
  end if;

  if p_size_bytes is null or p_size_bytes <= 0 then
    raise exception 'File size must be positive' using errcode = '22023';
  end if;
  if char_length(trim(coalesce(p_original_file_name, ''))) not between 1 and 255 then
    raise exception 'File name must contain 1 to 255 characters' using errcode = '22023';
  end if;

  if p_kind = 'marker' and p_mime_type = 'image/jpeg' then
    target_bucket := 'markers-private';
    target_extension := 'jpg';
    media_limit := 26214400;
  elsif p_kind = 'marker' and p_mime_type = 'image/png' then
    target_bucket := 'markers-private';
    target_extension := 'png';
    media_limit := 26214400;
  elsif p_kind = 'marker' and p_mime_type = 'image/webp' then
    target_bucket := 'markers-private';
    target_extension := 'webp';
    media_limit := 26214400;
  elsif p_kind = 'video' and p_mime_type = 'video/mp4' then
    target_bucket := 'videos-private';
    target_extension := 'mp4';
    media_limit := least(
      524288000::bigint,
      coalesce((select private.effective_limit(p_target_account_id, 'max_video_size_bytes')), 524288000::bigint)
    );
  else
    raise exception 'Unsupported media kind or MIME type' using errcode = '22023';
  end if;

  if p_size_bytes > media_limit then
    raise exception 'Media file limit reached' using errcode = '23514';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('media-quota:' || p_target_account_id::text, 0)
  );

  select u.* into existing_session
  from public.upload_sessions u
  where u.account_id = p_target_account_id
    and u.idempotency_key = p_request_id;
  if found then
    return existing_session;
  end if;

  storage_limit := private.effective_limit(p_target_account_id, 'storage_limit_bytes');
  select coalesce(sum(u.size_bytes), 0)::bigint into reserved_bytes
  from public.upload_sessions u
  where u.account_id = p_target_account_id
    and u.status in ('pending', 'uploading', 'failed')
    and u.expires_at > statement_timestamp();

  if storage_limit is not null and (
    select a.storage_used_bytes + reserved_bytes + p_size_bytes
    from public.accounts a
    where a.id = p_target_account_id
  ) > storage_limit then
    raise exception 'Storage limit reached' using errcode = '23514';
  end if;

  select coalesce(max(candidate.version), 0) + 1 into next_version
  from (
    select m.version
    from public.media_assets m
    where m.account_id = p_target_account_id
      and m.group_id = p_target_group_id
      and m.kind = p_kind
      and m.deleted_at is null
    union all
    select u.version
    from public.upload_sessions u
    where u.account_id = p_target_account_id
      and u.group_id = p_target_group_id
      and u.kind = p_kind
      and u.status in ('pending', 'uploading', 'failed')
      and u.expires_at > statement_timestamp()
  ) candidate;

  insert into public.upload_sessions (
    id,
    account_id,
    project_id,
    group_id,
    kind,
    storage_bucket,
    storage_path,
    original_file_name,
    mime_type,
    size_bytes,
    version,
    idempotency_key,
    created_by
  ) values (
    session_id,
    p_target_account_id,
    p_target_project_id,
    p_target_group_id,
    p_kind,
    target_bucket,
    'accounts/' || p_target_account_id::text
      || '/projects/' || p_target_project_id::text
      || '/groups/' || p_target_group_id::text
      || '/uploads/' || session_id::text
      || '/v' || next_version::text
      || '/' || p_kind || '.' || target_extension,
    trim(p_original_file_name),
    p_mime_type,
    p_size_bytes,
    next_version,
    p_request_id,
    (select auth.uid())
  )
  returning * into created_session;

  return created_session;
end;
$$;

create or replace function public.start_media_upload(p_session_id uuid)
returns public.upload_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session public.upload_sessions;
begin
  select u.* into target_session
  from public.upload_sessions u
  where u.id = p_session_id
  for update;
  if not found then
    raise exception 'Upload session not found' using errcode = '23503';
  end if;
  if not (select private.can_write_account(target_session.account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if target_session.expires_at <= statement_timestamp() then
    update public.upload_sessions set status = 'expired' where id = p_session_id returning * into target_session;
    return target_session;
  end if;
  if target_session.status not in ('pending', 'uploading', 'failed') then
    raise exception 'Upload session cannot be started' using errcode = '55000';
  end if;

  update public.upload_sessions
  set status = 'uploading', error_code = null
  where id = p_session_id
  returning * into target_session;
  return target_session;
end;
$$;

create or replace function public.fail_media_upload(p_session_id uuid, p_error_code text)
returns public.upload_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session public.upload_sessions;
begin
  select u.* into target_session
  from public.upload_sessions u
  where u.id = p_session_id
  for update;
  if not found then
    raise exception 'Upload session not found' using errcode = '23503';
  end if;
  if not (select private.can_write_account(target_session.account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if target_session.status not in ('pending', 'uploading', 'failed') then
    return target_session;
  end if;

  update public.upload_sessions
  set status = 'failed', error_code = left(nullif(trim(p_error_code), ''), 80)
  where id = p_session_id
  returning * into target_session;
  return target_session;
end;
$$;

create or replace function public.finalize_media_upload(
  p_session_id uuid,
  p_sha256 text,
  p_metadata jsonb
)
returns public.media_assets
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session public.upload_sessions;
  existing_asset public.media_assets;
  created_asset public.media_assets;
  object_size bigint;
  object_mime text;
  storage_limit bigint;
begin
  select u.* into target_session
  from public.upload_sessions u
  where u.id = p_session_id
  for update;
  if not found then
    raise exception 'Upload session not found' using errcode = '23503';
  end if;
  if not (select private.can_write_account(target_session.account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if target_session.status = 'finalized' then
    select m.* into existing_asset from public.media_assets m where m.id = target_session.asset_id;
    return existing_asset;
  end if;
  if target_session.status <> 'uploading' or target_session.expires_at <= statement_timestamp() then
    raise exception 'Upload session is not ready to finalize' using errcode = '55000';
  end if;
  if p_sha256 is null or p_sha256 !~ '^[a-f0-9]{64}$' then
    raise exception 'Valid SHA-256 is required' using errcode = '22023';
  end if;
  if p_metadata is null or jsonb_typeof(p_metadata) <> 'object' then
    raise exception 'Media metadata must be an object' using errcode = '22023';
  end if;

  select
    nullif(o.metadata ->> 'size', '')::bigint,
    coalesce(nullif(o.metadata ->> 'mimetype', ''), nullif(o.metadata ->> 'mime_type', ''))
  into object_size, object_mime
  from storage.objects o
  where o.bucket_id = target_session.storage_bucket
    and o.name = target_session.storage_path;
  if not found then
    raise exception 'Uploaded Storage object not found' using errcode = '23503';
  end if;
  if object_size is null or object_size <> target_session.size_bytes then
    raise exception 'Uploaded object size mismatch' using errcode = '22000';
  end if;
  if object_mime is not null and object_mime <> target_session.mime_type then
    raise exception 'Uploaded object MIME mismatch' using errcode = '22000';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('media-quota:' || target_session.account_id::text, 0)
  );
  storage_limit := private.effective_limit(target_session.account_id, 'storage_limit_bytes');
  if storage_limit is not null and (
    select a.storage_used_bytes + object_size
    from public.accounts a
    where a.id = target_session.account_id
  ) > storage_limit then
    raise exception 'Storage limit reached' using errcode = '23514';
  end if;

  insert into public.media_assets (
    account_id,
    project_id,
    group_id,
    ar_item_id,
    kind,
    storage_bucket,
    storage_path,
    original_file_name,
    mime_type,
    size_bytes,
    sha256,
    version,
    metadata,
    created_by
  ) values (
    target_session.account_id,
    target_session.project_id,
    target_session.group_id,
    target_session.ar_item_id,
    target_session.kind,
    target_session.storage_bucket,
    target_session.storage_path,
    target_session.original_file_name,
    target_session.mime_type,
    object_size,
    p_sha256,
    target_session.version,
    p_metadata,
    target_session.created_by
  )
  returning * into created_asset;

  update public.accounts
  set storage_used_bytes = storage_used_bytes + object_size
  where id = target_session.account_id;

  update public.upload_sessions
  set status = 'finalized',
      bytes_uploaded = object_size,
      asset_id = created_asset.id,
      metadata = p_metadata,
      error_code = null,
      completed_at = statement_timestamp()
  where id = p_session_id;

  return created_asset;
end;
$$;

create or replace function public.abort_media_upload(p_session_id uuid)
returns public.upload_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session public.upload_sessions;
begin
  select u.* into target_session
  from public.upload_sessions u
  where u.id = p_session_id
  for update;
  if not found then
    raise exception 'Upload session not found' using errcode = '23503';
  end if;
  if not (select private.can_write_account(target_session.account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if target_session.status = 'finalized' then
    raise exception 'Finalized upload cannot be aborted' using errcode = '55000';
  end if;
  if target_session.status in ('aborted', 'expired') then
    return target_session;
  end if;

  update public.upload_sessions
  set status = 'aborted', error_code = null
  where id = p_session_id
  returning * into target_session;
  return target_session;
end;
$$;

create or replace function public.expire_stale_uploads(p_limit integer default 100)
returns setof public.upload_sessions
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit is null or p_limit not between 1 and 1000 then
    raise exception 'Cleanup limit must be between 1 and 1000' using errcode = '22023';
  end if;

  return query
  with stale as (
    select u.id
    from public.upload_sessions u
    where u.status in ('pending', 'uploading', 'failed')
      and u.expires_at <= statement_timestamp()
    order by u.expires_at, u.created_at
    for update skip locked
    limit p_limit
  )
  update public.upload_sessions u
  set status = 'expired', error_code = 'upload_expired'
  from stale
  where u.id = stale.id
  returning u.*;
end;
$$;

revoke all on function public.begin_media_upload(uuid, uuid, uuid, text, text, text, bigint, uuid)
from public, anon, authenticated;
revoke all on function public.start_media_upload(uuid) from public, anon, authenticated;
revoke all on function public.fail_media_upload(uuid, text) from public, anon, authenticated;
revoke all on function public.finalize_media_upload(uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.abort_media_upload(uuid) from public, anon, authenticated;
revoke all on function public.expire_stale_uploads(integer) from public, anon, authenticated;

grant execute on function public.begin_media_upload(uuid, uuid, uuid, text, text, text, bigint, uuid)
to authenticated;
grant execute on function public.start_media_upload(uuid) to authenticated;
grant execute on function public.fail_media_upload(uuid, text) to authenticated;
grant execute on function public.finalize_media_upload(uuid, text, jsonb) to authenticated;
grant execute on function public.abort_media_upload(uuid) to authenticated;
grant execute on function public.expire_stale_uploads(integer) to service_role;
