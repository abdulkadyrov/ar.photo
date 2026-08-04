-- Accept private source videos that the authenticated client explicitly marks
-- for authoritative server transcoding. Compatible outputs are still required
-- to be H.264/AAC (or silent) by complete_video_transcode_job.
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
  server_transcode_required boolean;
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
    server_transcode_required := p_metadata -> 'serverTranscodeRequired' = 'true'::jsonb;
    if server_transcode_required then
      if p_metadata ->> 'videoCodec' is distinct from 'source'
        or coalesce(p_metadata ->> 'audioCodec', '') not in ('source', 'aac', 'none')
        or p_metadata #>> '{optimization,strategy}' is distinct from 'server-transcode'
        or coalesce(jsonb_typeof(p_metadata -> 'width'), 'missing') not in ('number', 'null')
        or coalesce(jsonb_typeof(p_metadata -> 'height'), 'missing') not in ('number', 'null')
        or coalesce(jsonb_typeof(p_metadata -> 'durationSeconds'), 'missing') not in ('number', 'null')
      then
        raise exception 'Valid source video metadata is required' using errcode = '22023';
      end if;
      if (p_metadata ->> 'width')::numeric <= 0
        or (p_metadata ->> 'height')::numeric <= 0
        or (p_metadata ->> 'durationSeconds')::numeric <= 0
      then
        raise exception 'Valid source video metadata is required' using errcode = '22023';
      end if;
    else
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
    end if;

    duration_limit := private.effective_limit(target_session.account_id, 'video_duration_limit_seconds');
    if duration_limit is not null
      and jsonb_typeof(p_metadata -> 'durationSeconds') = 'number'
      and (p_metadata ->> 'durationSeconds')::numeric > duration_limit
    then
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
    account_id, project_id, group_id, ar_item_id, kind, storage_bucket, storage_path,
    original_file_name, mime_type, size_bytes, sha256, version, metadata, created_by
  ) values (
    target_session.account_id, target_session.project_id, target_session.group_id,
    target_session.ar_item_id, target_session.kind, target_session.storage_bucket,
    target_session.storage_path, target_session.original_file_name, target_session.mime_type,
    object_size, p_sha256, target_session.version, p_metadata, target_session.created_by
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

-- Unknown source duration is allowed only until FFmpeg has authoritatively
-- inspected/transcoded it. Enforce the account limit before that job commits.
create or replace function private.enforce_video_transcode_duration_limit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  duration_limit bigint;
begin
  if new.type <> 'video_transcode'
    or new.status <> 'succeeded'
    or old.status = 'succeeded'
  then
    return new;
  end if;

  duration_limit := private.effective_limit(new.account_id, 'video_duration_limit_seconds');
  if jsonb_typeof(new.output_metadata -> 'durationSeconds') is distinct from 'number'
    or (new.output_metadata ->> 'durationSeconds')::numeric <= 0
  then
    raise exception 'Valid transcoded video duration is required' using errcode = '22023';
  end if;
  if duration_limit is not null
    and (new.output_metadata ->> 'durationSeconds')::numeric > duration_limit
  then
    raise exception 'Video duration limit reached' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_video_transcode_duration_limit on public.processing_jobs;
create trigger enforce_video_transcode_duration_limit
before update of status, output_metadata on public.processing_jobs
for each row
execute function private.enforce_video_transcode_duration_limit();

revoke all on function private.enforce_video_transcode_duration_limit()
from public, anon, authenticated;
