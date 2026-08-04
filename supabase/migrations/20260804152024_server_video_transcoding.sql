-- Mobile Safari cannot reliably encode or even remux every audio track through
-- WebCodecs. Keep arbitrary sources private and make compatibility a server
-- responsibility whenever the client marks an asset for transcoding.

update storage.buckets
set file_size_limit = 524288000,
    allowed_mime_types = array[
      'application/octet-stream',
      'image/png',
      'image/svg+xml',
      'image/webp',
      'video/mp4'
    ]
where id = 'generated-private';

create or replace function private.enqueue_video_transcode()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_asset public.media_assets;
  revision integer;
begin
  if new.type <> 'video_inspection' then
    return new;
  end if;

  select m.* into source_asset
  from public.media_assets m
  where m.id = (new.input_metadata ->> 'assetId')::uuid
    and m.account_id = new.account_id
    and m.deleted_at is null;

  if not found or source_asset.metadata ->> 'serverTranscodeRequired' <> 'true' then
    return new;
  end if;

  revision := (new.input_metadata ->> 'revision')::integer;
  insert into public.processing_jobs (
    account_id,
    ar_item_id,
    type,
    dedupe_key,
    input_metadata
  ) values (
    new.account_id,
    new.ar_item_id,
    'video_transcode',
    new.ar_item_id::text || ':v' || revision::text || ':video_transcode',
    new.input_metadata
  )
  on conflict (account_id, dedupe_key) do nothing;

  return new;
end;
$$;

drop trigger if exists enqueue_video_transcode_after_inspection on public.processing_jobs;
create trigger enqueue_video_transcode_after_inspection
after insert on public.processing_jobs
for each row
when (new.type = 'video_inspection')
execute function private.enqueue_video_transcode();

create or replace function public.claim_processing_jobs(
  p_worker_id text,
  p_limit integer default 1
)
returns setof public.processing_jobs
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(trim(coalesce(p_worker_id, ''))) not between 3 and 120
    or p_limit is null or p_limit not between 1 and 20
  then
    raise exception 'Valid worker claim is required' using errcode = '22023';
  end if;

  update public.processing_jobs
  set status = 'failed',
      progress = 0,
      error_code = 'worker_lease_expired',
      error_message = 'Обработка не завершена. Повторите попытку позже.',
      completed_at = statement_timestamp(),
      locked_at = null,
      locked_by = null
  where status = 'running'
    and locked_at < statement_timestamp() - interval '20 minutes'
    and attempt_count >= max_attempts;

  update public.ar_items i
  set status = 'failed',
      tracking_status = case
        when exists (
          select 1 from public.processing_jobs failed_job
          where failed_job.ar_item_id = i.id
            and failed_job.status = 'failed'
            and failed_job.error_code = 'worker_lease_expired'
            and failed_job.type in ('marker_analysis', 'marker_compilation')
            and (failed_job.input_metadata ->> 'revision')::integer = i.version
        ) then 'failed'::public.tracking_status
        else i.tracking_status
      end
  where exists (
    select 1 from public.processing_jobs failed_job
    where failed_job.ar_item_id = i.id
      and failed_job.status = 'failed'
      and failed_job.error_code = 'worker_lease_expired'
      and (failed_job.input_metadata ->> 'revision')::integer = i.version
  );

  update public.processing_jobs
  set status = 'queued',
      progress = 0,
      error_code = 'worker_lease_expired',
      error_message = null,
      locked_at = null,
      locked_by = null
  where status = 'running'
    and locked_at < statement_timestamp() - interval '20 minutes'
    and attempt_count < max_attempts;

  return query
  with candidates as (
    select j.id
    from public.processing_jobs j
    join public.ar_items i on i.id = j.ar_item_id and i.account_id = j.account_id
    where j.status = 'queued'
      and j.attempt_count < j.max_attempts
      and i.deleted_at is null
      and i.status = 'processing'
      and (j.input_metadata ->> 'revision')::integer = i.version
      and (
        j.type in ('marker_analysis', 'video_transcode')
        or (
          j.type = 'video_inspection'
          and not exists (
            select 1 from public.processing_jobs transcode
            where transcode.ar_item_id = j.ar_item_id
              and transcode.type = 'video_transcode'
              and transcode.status <> 'succeeded'
              and transcode.input_metadata ->> 'revision' = j.input_metadata ->> 'revision'
          )
        )
        or (
          j.type = 'marker_compilation'
          and exists (
            select 1 from public.processing_jobs prerequisite
            where prerequisite.ar_item_id = j.ar_item_id
              and prerequisite.type = 'marker_analysis'
              and prerequisite.status = 'succeeded'
              and prerequisite.input_metadata ->> 'revision' = j.input_metadata ->> 'revision'
              and (
                prerequisite.output_metadata ->> 'suitable' = 'true'
                or i.marker_quality_overridden_at is not null
              )
          )
        )
        or (
          j.type = 'thumbnail_generation'
          and exists (
            select 1 from public.processing_jobs prerequisite
            where prerequisite.ar_item_id = j.ar_item_id
              and prerequisite.type = 'video_inspection'
              and prerequisite.status = 'succeeded'
              and prerequisite.input_metadata ->> 'revision' = j.input_metadata ->> 'revision'
          )
        )
      )
    order by
      case when j.type = 'video_transcode' then 0 else 1 end,
      j.created_at,
      j.id
    for update of j skip locked
    limit p_limit
  )
  update public.processing_jobs j
  set status = 'running',
      progress = 0,
      attempt_count = attempt_count + 1,
      locked_at = statement_timestamp(),
      locked_by = trim(p_worker_id),
      started_at = coalesce(started_at, statement_timestamp()),
      error_code = null,
      error_message = null
  from candidates
  where j.id = candidates.id
  returning j.*;
end;
$$;

create or replace function public.complete_video_transcode_job(
  p_job_id bigint,
  p_worker_id text,
  p_output_metadata jsonb
)
returns public.processing_jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_job public.processing_jobs;
  target_item public.ar_items;
  generated_asset public.media_assets;
  revision integer;
  generated_path text;
  object_size bigint;
  object_mime text;
  storage_limit bigint;
  generated_inserted boolean := false;
begin
  if p_output_metadata is null or jsonb_typeof(p_output_metadata) <> 'object' then
    raise exception 'Processing output must be an object' using errcode = '22023';
  end if;

  select j.* into target_job
  from public.processing_jobs j
  where j.id = p_job_id
  for update;
  if not found
    or target_job.type <> 'video_transcode'
    or target_job.status <> 'running'
    or target_job.locked_by <> p_worker_id
  then
    raise exception 'Running video transcode job not found' using errcode = '23503';
  end if;

  revision := (target_job.input_metadata ->> 'revision')::integer;
  select i.* into target_item
  from public.ar_items i
  where i.id = target_job.ar_item_id
  for update;

  generated_path := nullif(p_output_metadata ->> 'storagePath', '');
  if p_output_metadata ->> 'storageBucket' <> 'generated-private'
    or generated_path is null
    or generated_path <> (
      'accounts/' || target_job.account_id::text || '/projects/' || target_item.project_id::text
      || '/groups/' || target_item.group_id::text || '/items/' || target_item.id::text
      || '/v' || revision::text || '/video/video.mp4'
    )
    or coalesce(p_output_metadata ->> 'sha256', '') !~ '^[a-f0-9]{64}$'
    or p_output_metadata ->> 'videoCodec' is distinct from 'h264'
    or coalesce(p_output_metadata ->> 'audioCodec', '') not in ('aac', 'none')
    or jsonb_typeof(p_output_metadata -> 'durationSeconds') is distinct from 'number'
    or jsonb_typeof(p_output_metadata -> 'width') is distinct from 'number'
    or jsonb_typeof(p_output_metadata -> 'height') is distinct from 'number'
    or (p_output_metadata ->> 'durationSeconds')::numeric <= 0
    or (p_output_metadata ->> 'width')::integer <= 0
    or (p_output_metadata ->> 'height')::integer <= 0
  then
    raise exception 'Invalid transcoded video output' using errcode = '22023';
  end if;

  select
    nullif(o.metadata ->> 'size', '')::bigint,
    coalesce(nullif(o.metadata ->> 'mimetype', ''), nullif(o.metadata ->> 'mime_type', ''))
  into object_size, object_mime
  from storage.objects o
  where o.bucket_id = 'generated-private' and o.name = generated_path;
  if not found or object_size is null or object_size <= 0 then
    raise exception 'Generated Storage object not found' using errcode = '23503';
  end if;
  if object_mime is not null and object_mime <> 'video/mp4' then
    raise exception 'Generated Storage object MIME mismatch' using errcode = '22000';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('media-quota:' || target_job.account_id::text, 0)
  );
  if not exists (
    select 1 from public.media_assets m
    where m.storage_bucket = 'generated-private' and m.storage_path = generated_path
  ) then
    storage_limit := private.effective_limit(target_job.account_id, 'storage_limit_bytes');
    if storage_limit is not null and (
      select a.storage_used_bytes + object_size from public.accounts a where a.id = target_job.account_id
    ) > storage_limit then
      raise exception 'Storage limit reached' using errcode = '23514';
    end if;
  end if;

  insert into public.media_assets (
    account_id, project_id, group_id, ar_item_id, kind, storage_bucket, storage_path,
    original_file_name, mime_type, size_bytes, sha256, version, metadata, created_by
  ) values (
    target_job.account_id,
    target_item.project_id,
    target_item.group_id,
    target_item.id,
    'video',
    'generated-private',
    generated_path,
    'video.mp4',
    'video/mp4',
    object_size,
    p_output_metadata ->> 'sha256',
    revision,
    p_output_metadata || jsonb_build_object(
      'serverTranscodeRequired', false,
      'optimization', jsonb_build_object('strategy', 'server-ffmpeg', 'optimized', true)
    ),
    target_item.created_by
  )
  on conflict (storage_bucket, storage_path) do nothing
  returning * into generated_asset;
  generated_inserted := found;

  if not generated_inserted then
    select m.* into generated_asset
    from public.media_assets m
    where m.storage_bucket = 'generated-private' and m.storage_path = generated_path;
  else
    update public.accounts
    set storage_used_bytes = storage_used_bytes + object_size
    where id = target_job.account_id;
  end if;

  if target_item.version = revision then
    update public.ar_items
    set video_asset_id = generated_asset.id,
        video_path = generated_path,
        video_duration_seconds = (p_output_metadata ->> 'durationSeconds')::numeric
    where id = target_item.id;

    update public.processing_jobs
    set input_metadata = jsonb_set(
      jsonb_set(
        jsonb_set(input_metadata, '{assetId}', to_jsonb(generated_asset.id::text)),
        '{bucket}',
        to_jsonb('generated-private'::text)
      ),
      '{path}',
      to_jsonb(generated_path)
    )
    where ar_item_id = target_item.id
      and type in ('video_inspection', 'thumbnail_generation')
      and input_metadata ->> 'revision' = revision::text
      and status = 'queued';
  end if;

  update public.processing_jobs
  set status = 'succeeded',
      progress = 100,
      output_metadata = p_output_metadata,
      completed_at = statement_timestamp(),
      locked_at = null,
      locked_by = null,
      error_code = null,
      error_message = null
  where id = target_job.id
  returning * into target_job;

  return target_job;
end;
$$;

revoke all on function private.enqueue_video_transcode() from public, anon, authenticated;
revoke all on function public.complete_video_transcode_job(bigint, text, jsonb)
from public, anon, authenticated;
revoke all on function public.claim_processing_jobs(text, integer)
from public, anon, authenticated;

grant execute on function public.complete_video_transcode_job(bigint, text, jsonb) to service_role;
grant execute on function public.claim_processing_jobs(text, integer) to service_role;
