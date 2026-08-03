-- Harden media finalization metadata and make stale Storage cleanup retryable.
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
  duration_limit bigint;
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

  if target_session.kind = 'marker' then
    if jsonb_typeof(p_metadata -> 'width') is distinct from 'number'
      or jsonb_typeof(p_metadata -> 'height') is distinct from 'number'
      or p_metadata -> 'exifStripped' is distinct from 'true'::jsonb
    then
      raise exception 'Valid normalized marker metadata is required' using errcode = '22023';
    end if;
    if (p_metadata ->> 'width')::numeric not between 1 and 12000
      or (p_metadata ->> 'height')::numeric not between 1 and 12000
    then
      raise exception 'Valid normalized marker metadata is required' using errcode = '22023';
    end if;
  elsif target_session.kind = 'video' then
    if jsonb_typeof(p_metadata -> 'width') is distinct from 'number'
      or jsonb_typeof(p_metadata -> 'height') is distinct from 'number'
      or jsonb_typeof(p_metadata -> 'durationSeconds') is distinct from 'number'
      or p_metadata ->> 'videoCodec' is distinct from 'h264'
      or coalesce(p_metadata ->> 'audioCodec', '') not in ('aac', 'none')
    then
      raise exception 'Valid H.264 video metadata is required' using errcode = '22023';
    end if;
    if (p_metadata ->> 'width')::numeric <= 0
      or (p_metadata ->> 'height')::numeric <= 0
      or (p_metadata ->> 'durationSeconds')::numeric <= 0
    then
      raise exception 'Valid H.264 video metadata is required' using errcode = '22023';
    end if;

    duration_limit := private.effective_limit(target_session.account_id, 'video_duration_limit_seconds');
    if duration_limit is not null and (p_metadata ->> 'durationSeconds')::numeric > duration_limit then
      raise exception 'Video duration limit reached' using errcode = '23514';
    end if;
  else
    raise exception 'Unsupported media kind' using errcode = '22023';
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
    where (
        u.status in ('pending', 'uploading', 'failed')
        and u.expires_at <= statement_timestamp()
      )
      or (
        u.status = 'expired'
        and (
          u.error_code = 'cleanup_failed'
          or (u.error_code = 'cleanup_in_progress' and u.updated_at <= statement_timestamp() - interval '15 minutes')
        )
      )
    order by u.expires_at, u.created_at
    for update skip locked
    limit p_limit
  )
  update public.upload_sessions u
  set status = 'expired', error_code = 'cleanup_in_progress'
  from stale
  where u.id = stale.id
  returning u.*;
end;
$$;

create or replace function public.complete_upload_cleanup(
  p_session_ids uuid[],
  p_succeeded boolean
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer;
begin
  if p_session_ids is null
    or cardinality(p_session_ids) not between 1 and 1000
    or p_succeeded is null
  then
    raise exception 'Valid cleanup result is required' using errcode = '22023';
  end if;

  update public.upload_sessions u
  set error_code = case when p_succeeded then 'upload_expired_cleaned' else 'cleanup_failed' end
  where u.id = any(p_session_ids)
    and u.status = 'expired'
    and u.error_code = 'cleanup_in_progress';
  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.complete_upload_cleanup(uuid[], boolean) from public, anon, authenticated;
grant execute on function public.complete_upload_cleanup(uuid[], boolean) to service_role;
