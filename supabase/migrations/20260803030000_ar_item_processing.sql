-- Stage 5: idempotent AR item drafts, media attachment and service-only processing queue.
alter table public.ar_items
  add column idempotency_key uuid default gen_random_uuid(),
  add column marker_asset_id uuid,
  add column video_asset_id uuid,
  add column marker_quality_score smallint,
  add column marker_quality_details jsonb not null default '{}'::jsonb,
  add column marker_quality_overridden_at timestamptz,
  add column marker_quality_overridden_by uuid references auth.users(id) on delete set null,
  add column marker_quality_override_reason text;

alter table public.ar_items
  alter column idempotency_key set not null,
  add constraint ar_items_account_idempotency_unique unique (account_id, idempotency_key),
  add constraint ar_items_marker_quality_score_range check (
    marker_quality_score is null or marker_quality_score between 0 and 100
  ),
  add constraint ar_items_marker_quality_details_object check (jsonb_typeof(marker_quality_details) = 'object'),
  add constraint ar_items_marker_quality_override_consistency check (
    (
      marker_quality_overridden_at is null
      and marker_quality_overridden_by is null
      and marker_quality_override_reason is null
    )
    or (
      marker_quality_overridden_at is not null
      and marker_quality_overridden_by is not null
      and char_length(marker_quality_override_reason) between 10 and 500
    )
  );

alter table public.media_assets
  add constraint media_assets_id_account_unique unique (id, account_id);

alter table public.ar_items
  add constraint ar_items_marker_asset_account_fkey
    foreign key (marker_asset_id, account_id)
    references public.media_assets(id, account_id) on delete set null (marker_asset_id),
  add constraint ar_items_video_asset_account_fkey
    foreign key (video_asset_id, account_id)
    references public.media_assets(id, account_id) on delete set null (video_asset_id);

create index ar_items_marker_asset_account_idx on public.ar_items(marker_asset_id, account_id);
create index ar_items_video_asset_account_idx on public.ar_items(video_asset_id, account_id);
create index ar_items_quality_override_user_idx
  on public.ar_items(marker_quality_overridden_by)
  where marker_quality_overridden_by is not null;
create index media_assets_item_kind_version_idx
  on public.media_assets(ar_item_id, kind, version)
  where ar_item_id is not null and deleted_at is null;

create or replace function public.create_ar_item_draft(
  p_target_account_id uuid,
  p_target_project_id uuid,
  p_target_group_id uuid,
  p_title text,
  p_description text,
  p_request_id uuid
)
returns public.ar_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  item_limit bigint;
  existing_item public.ar_items;
  created_item public.ar_items;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if char_length(trim(coalesce(p_title, ''))) not between 1 and 160
    or char_length(coalesce(p_description, '')) > 4000
  then
    raise exception 'Invalid AR item title or description' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.groups g
    join public.projects p on p.id = g.project_id and p.account_id = g.account_id
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

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('ar-item-quota:' || p_target_account_id::text, 0)
  );
  select i.* into existing_item
  from public.ar_items i
  where i.account_id = p_target_account_id and i.idempotency_key = p_request_id;
  if found then
    return existing_item;
  end if;

  item_limit := private.effective_limit(p_target_account_id, 'ar_item_limit');
  if item_limit is not null and (
    select count(*) from public.ar_items i
    where i.account_id = p_target_account_id and i.deleted_at is null
  ) >= item_limit then
    raise exception 'AR item limit reached' using errcode = '23514';
  end if;

  insert into public.ar_items (
    account_id,
    project_id,
    group_id,
    title,
    description,
    idempotency_key,
    created_by
  ) values (
    p_target_account_id,
    p_target_project_id,
    p_target_group_id,
    trim(p_title),
    nullif(trim(p_description), ''),
    p_request_id,
    (select auth.uid())
  )
  returning * into created_item;
  return created_item;
end;
$$;

create or replace function public.prepare_ar_item_processing(
  p_target_account_id uuid,
  p_item_id uuid,
  p_marker_asset_id uuid,
  p_video_asset_id uuid,
  p_autoplay boolean,
  p_loop_video boolean,
  p_marker_lost_behavior public.marker_lost_behavior,
  p_audio_default text,
  p_fallback_enabled boolean
)
returns public.ar_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item public.ar_items;
  marker_asset public.media_assets;
  video_asset public.media_assets;
  next_revision integer;
  media_changed boolean;
begin
  if not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if p_audio_default not in ('muted', 'user_enabled') then
    raise exception 'Unsupported audio behavior' using errcode = '22023';
  end if;

  select i.* into target_item
  from public.ar_items i
  where i.id = p_item_id
    and i.account_id = p_target_account_id
    and i.deleted_at is null
  for update;
  if not found then
    raise exception 'AR item not found' using errcode = '23503';
  end if;
  if target_item.status = 'published' then
    raise exception 'Published AR item must be unpublished before replacement' using errcode = '55000';
  end if;

  select m.* into marker_asset
  from public.media_assets m
  where m.id = p_marker_asset_id
    and m.account_id = target_item.account_id
    and m.project_id = target_item.project_id
    and m.group_id = target_item.group_id
    and m.kind = 'marker'
    and m.deleted_at is null
  for update;
  if not found or (marker_asset.ar_item_id is not null and marker_asset.ar_item_id <> target_item.id) then
    raise exception 'Available marker asset not found' using errcode = '23503';
  end if;

  select m.* into video_asset
  from public.media_assets m
  where m.id = p_video_asset_id
    and m.account_id = target_item.account_id
    and m.project_id = target_item.project_id
    and m.group_id = target_item.group_id
    and m.kind = 'video'
    and m.deleted_at is null
  for update;
  if not found or (video_asset.ar_item_id is not null and video_asset.ar_item_id <> target_item.id) then
    raise exception 'Available video asset not found' using errcode = '23503';
  end if;

  media_changed := target_item.marker_asset_id is distinct from marker_asset.id
    or target_item.video_asset_id is distinct from video_asset.id;
  next_revision := case
    when target_item.marker_asset_id is null and target_item.video_asset_id is null then target_item.version
    when media_changed then target_item.version + 1
    else target_item.version
  end;

  if media_changed then
    update public.processing_jobs
    set status = 'cancelled', completed_at = statement_timestamp(), locked_at = null, locked_by = null
    where ar_item_id = target_item.id and status in ('queued', 'running');

    update public.media_assets
    set ar_item_id = null
    where ar_item_id = target_item.id
      and kind in ('marker', 'video')
      and id not in (marker_asset.id, video_asset.id);
  end if;

  update public.media_assets
  set ar_item_id = target_item.id
  where id in (marker_asset.id, video_asset.id);

  update public.ar_items
  set marker_asset_id = marker_asset.id,
      video_asset_id = video_asset.id,
      marker_image_path = marker_asset.storage_path,
      video_path = video_asset.storage_path,
      marker_width = (marker_asset.metadata ->> 'width')::integer,
      marker_height = (marker_asset.metadata ->> 'height')::integer,
      video_duration_seconds = (video_asset.metadata ->> 'durationSeconds')::numeric,
      autoplay = p_autoplay,
      loop_video = p_loop_video,
      marker_lost_behavior = p_marker_lost_behavior,
      audio_default = p_audio_default,
      fallback_enabled = p_fallback_enabled,
      version = next_revision,
      status = 'processing',
      tracking_status = 'uploaded',
      tracking_dataset_path = case when media_changed then null else tracking_dataset_path end,
      video_thumbnail_path = case when media_changed then null else video_thumbnail_path end,
      marker_quality_score = case when media_changed then null else marker_quality_score end,
      marker_quality_details = case when media_changed then '{}'::jsonb else marker_quality_details end,
      marker_quality_overridden_at = case when media_changed then null else marker_quality_overridden_at end,
      marker_quality_overridden_by = case when media_changed then null else marker_quality_overridden_by end,
      marker_quality_override_reason = case when media_changed then null else marker_quality_override_reason end
  where id = target_item.id
  returning * into target_item;

  insert into public.processing_jobs (account_id, ar_item_id, type, dedupe_key, input_metadata)
  values
    (
      target_item.account_id,
      target_item.id,
      'marker_analysis',
      target_item.id::text || ':v' || next_revision::text || ':marker_analysis',
      jsonb_build_object(
        'revision', next_revision,
        'assetId', marker_asset.id,
        'bucket', marker_asset.storage_bucket,
        'path', marker_asset.storage_path
      )
    ),
    (
      target_item.account_id,
      target_item.id,
      'video_inspection',
      target_item.id::text || ':v' || next_revision::text || ':video_inspection',
      jsonb_build_object(
        'revision', next_revision,
        'assetId', video_asset.id,
        'bucket', video_asset.storage_bucket,
        'path', video_asset.storage_path
      )
    ),
    (
      target_item.account_id,
      target_item.id,
      'marker_compilation',
      target_item.id::text || ':v' || next_revision::text || ':marker_compilation',
      jsonb_build_object(
        'revision', next_revision,
        'assetId', marker_asset.id,
        'bucket', marker_asset.storage_bucket,
        'path', marker_asset.storage_path
      )
    ),
    (
      target_item.account_id,
      target_item.id,
      'thumbnail_generation',
      target_item.id::text || ':v' || next_revision::text || ':thumbnail_generation',
      jsonb_build_object(
        'revision', next_revision,
        'assetId', video_asset.id,
        'bucket', video_asset.storage_bucket,
        'path', video_asset.storage_path
      )
    )
  on conflict (account_id, dedupe_key) do nothing;

  return target_item;
end;
$$;

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

  return query
  with candidates as (
    select j.id
    from public.processing_jobs j
    join public.ar_items i on i.id = j.ar_item_id and i.account_id = j.account_id
    where j.status = 'queued'
      and j.attempt_count < j.max_attempts
      and i.deleted_at is null
      and (j.input_metadata ->> 'revision')::integer = i.version
      and (
        j.type in ('marker_analysis', 'video_inspection')
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
    order by j.created_at, j.id
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

create or replace function public.report_processing_progress(
  p_job_id bigint,
  p_worker_id text,
  p_progress integer
)
returns public.processing_jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_job public.processing_jobs;
begin
  if p_progress not between 0 and 99 then
    raise exception 'Progress must be between 0 and 99' using errcode = '22023';
  end if;
  update public.processing_jobs
  set progress = greatest(progress, p_progress)
  where id = p_job_id and status = 'running' and locked_by = p_worker_id
  returning * into target_job;
  if not found then
    raise exception 'Running processing job not found' using errcode = '23503';
  end if;
  return target_job;
end;
$$;

create or replace function public.complete_processing_job(
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
  revision integer;
  generated_path text;
  generated_bucket text;
  generated_kind text;
  object_size bigint;
  object_mime text;
  generated_inserted boolean := false;
  duration_limit bigint;
  storage_limit bigint;
begin
  if p_output_metadata is null or jsonb_typeof(p_output_metadata) <> 'object' then
    raise exception 'Processing output must be an object' using errcode = '22023';
  end if;
  select j.* into target_job
  from public.processing_jobs j
  where j.id = p_job_id
  for update;
  if not found or target_job.status <> 'running' or target_job.locked_by <> p_worker_id then
    raise exception 'Running processing job not found' using errcode = '23503';
  end if;
  revision := (target_job.input_metadata ->> 'revision')::integer;
  select i.* into target_item from public.ar_items i where i.id = target_job.ar_item_id for update;

  if target_job.type = 'marker_analysis' then
    if jsonb_typeof(p_output_metadata -> 'score') is distinct from 'number'
      or jsonb_typeof(p_output_metadata -> 'suitable') is distinct from 'boolean'
      or (p_output_metadata ->> 'score')::integer not between 0 and 100
    then
      raise exception 'Invalid marker analysis output' using errcode = '22023';
    end if;
    if target_item.version = revision then
      update public.ar_items
      set marker_quality_score = (p_output_metadata ->> 'score')::integer,
          marker_quality_details = p_output_metadata,
          tracking_status = case
            when (p_output_metadata ->> 'suitable')::boolean then 'analyzing'::public.tracking_status
            else 'unsuitable'::public.tracking_status
          end
      where id = target_item.id;
    end if;
  elsif target_job.type = 'video_inspection' then
    if jsonb_typeof(p_output_metadata -> 'durationSeconds') is distinct from 'number'
      or jsonb_typeof(p_output_metadata -> 'width') is distinct from 'number'
      or jsonb_typeof(p_output_metadata -> 'height') is distinct from 'number'
      or p_output_metadata ->> 'videoCodec' is distinct from 'h264'
      or coalesce(p_output_metadata ->> 'audioCodec', '') not in ('aac', 'none')
    then
      raise exception 'Invalid video inspection output' using errcode = '22023';
    end if;
    duration_limit := private.effective_limit(target_job.account_id, 'video_duration_limit_seconds');
    if (p_output_metadata ->> 'durationSeconds')::numeric <= 0
      or (p_output_metadata ->> 'width')::numeric <= 0
      or (p_output_metadata ->> 'height')::numeric <= 0
      or (duration_limit is not null and (p_output_metadata ->> 'durationSeconds')::numeric > duration_limit)
    then
      raise exception 'Video duration limit reached' using errcode = '23514';
    end if;
    if target_item.version = revision then
      update public.ar_items
      set video_duration_seconds = (p_output_metadata ->> 'durationSeconds')::numeric
      where id = target_item.id;
    end if;
  elsif target_job.type in ('marker_compilation', 'thumbnail_generation') then
    generated_path := nullif(p_output_metadata ->> 'storagePath', '');
    generated_bucket := p_output_metadata ->> 'storageBucket';
    generated_kind := case when target_job.type = 'marker_compilation' then 'tracking' else 'poster' end;
    if generated_bucket <> 'generated-private'
      or generated_path is null
      or generated_path <> (
        'accounts/' || target_job.account_id::text || '/projects/' || target_item.project_id::text
        || '/groups/' || target_item.group_id::text || '/items/' || target_item.id::text
        || '/v' || revision::text
        || case when generated_kind = 'tracking' then '/tracking/target.mind' else '/thumbnail/video.webp' end
      )
      or coalesce(p_output_metadata ->> 'sha256', '') !~ '^[a-f0-9]{64}$'
    then
      raise exception 'Invalid generated asset output' using errcode = '22023';
    end if;
    select
      nullif(o.metadata ->> 'size', '')::bigint,
      coalesce(nullif(o.metadata ->> 'mimetype', ''), nullif(o.metadata ->> 'mime_type', ''))
    into object_size, object_mime
    from storage.objects o
    where o.bucket_id = generated_bucket and o.name = generated_path;
    if not found or object_size is null or object_size <= 0 then
      raise exception 'Generated Storage object not found' using errcode = '23503';
    end if;
    if object_mime is not null and object_mime <> case
      when generated_kind = 'tracking' then 'application/octet-stream'
      else 'image/webp'
    end then
      raise exception 'Generated Storage object MIME mismatch' using errcode = '22000';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('media-quota:' || target_job.account_id::text, 0)
    );
    if not exists (
      select 1 from public.media_assets m
      where m.storage_bucket = generated_bucket and m.storage_path = generated_path
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
      generated_kind,
      generated_bucket,
      generated_path,
      null,
      case when generated_kind = 'tracking' then 'application/octet-stream' else 'image/webp' end,
      object_size,
      p_output_metadata ->> 'sha256',
      revision,
      p_output_metadata,
      target_item.created_by
    )
    on conflict (storage_bucket, storage_path) do nothing;
    generated_inserted := found;

    if generated_inserted then
      update public.accounts set storage_used_bytes = storage_used_bytes + object_size
      where id = target_job.account_id;
    end if;
    if target_item.version = revision then
      if generated_kind = 'tracking' then
        update public.ar_items
        set tracking_dataset_path = generated_path, tracking_status = 'ready'
        where id = target_item.id;
      else
        update public.ar_items set video_thumbnail_path = generated_path where id = target_item.id;
      end if;
    end if;
  else
    raise exception 'Unsupported processing job type' using errcode = '22023';
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

  if target_item.version = revision and not exists (
    select 1
    from unnest(array[
      'marker_analysis'::public.job_type,
      'video_inspection'::public.job_type,
      'marker_compilation'::public.job_type,
      'thumbnail_generation'::public.job_type
    ]) required(type)
    where not exists (
      select 1 from public.processing_jobs j
      where j.ar_item_id = target_item.id
        and j.type = required.type
        and j.status = 'succeeded'
        and (j.input_metadata ->> 'revision')::integer = revision
    )
  ) then
    update public.ar_items set status = 'ready', tracking_status = 'ready' where id = target_item.id;
  end if;

  return target_job;
end;
$$;

create or replace function public.fail_processing_job(
  p_job_id bigint,
  p_worker_id text,
  p_error_code text
)
returns public.processing_jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_job public.processing_jobs;
  terminal boolean;
  revision integer;
begin
  select j.* into target_job
  from public.processing_jobs j
  where j.id = p_job_id
  for update;
  if not found or target_job.status <> 'running' or target_job.locked_by <> p_worker_id then
    raise exception 'Running processing job not found' using errcode = '23503';
  end if;
  terminal := target_job.attempt_count >= target_job.max_attempts;
  revision := (target_job.input_metadata ->> 'revision')::integer;

  update public.processing_jobs
  set status = case when terminal then 'failed'::public.job_status else 'queued'::public.job_status end,
      progress = 0,
      error_code = left(regexp_replace(coalesce(p_error_code, 'processing_failed'), '[^a-zA-Z0-9_-]', '_', 'g'), 80),
      error_message = 'Обработка не завершена. Повторите попытку позже.',
      completed_at = case when terminal then statement_timestamp() else null end,
      locked_at = null,
      locked_by = null
  where id = target_job.id
  returning * into target_job;

  if terminal then
    update public.ar_items
    set status = 'failed',
        tracking_status = case
          when target_job.type in ('marker_analysis', 'marker_compilation') then 'failed'::public.tracking_status
          else tracking_status
        end
    where id = target_job.ar_item_id and version = revision;
  end if;
  return target_job;
end;
$$;

create or replace function public.retry_ar_item_processing(
  p_target_account_id uuid,
  p_item_id uuid
)
returns setof public.processing_jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item public.ar_items;
begin
  if not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  select i.* into target_item
  from public.ar_items i
  where i.id = p_item_id and i.account_id = p_target_account_id and i.deleted_at is null
  for update;
  if not found then raise exception 'AR item not found' using errcode = '23503'; end if;

  update public.ar_items
  set status = 'processing',
      tracking_status = case when tracking_status = 'failed' then 'analyzing' else tracking_status end
  where id = target_item.id;

  return query
  update public.processing_jobs j
  set status = 'queued',
      progress = 0,
      attempt_count = 0,
      error_code = null,
      error_message = null,
      started_at = null,
      completed_at = null,
      locked_at = null,
      locked_by = null
  where j.ar_item_id = target_item.id
    and j.status = 'failed'
    and (j.input_metadata ->> 'revision')::integer = target_item.version
  returning j.*;
end;
$$;

create or replace function public.override_marker_quality(
  p_target_account_id uuid,
  p_item_id uuid,
  p_reason text
)
returns public.ar_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item public.ar_items;
begin
  if not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if char_length(trim(coalesce(p_reason, ''))) not between 10 and 500 then
    raise exception 'Override reason must contain 10 to 500 characters' using errcode = '22023';
  end if;
  select i.* into target_item
  from public.ar_items i
  where i.id = p_item_id and i.account_id = p_target_account_id and i.deleted_at is null
  for update;
  if not found then raise exception 'AR item not found' using errcode = '23503'; end if;
  if target_item.marker_quality_score is null or target_item.marker_quality_score >= 60 then
    raise exception 'Marker quality override is not required' using errcode = '55000';
  end if;

  update public.ar_items
  set marker_quality_overridden_at = statement_timestamp(),
      marker_quality_overridden_by = (select auth.uid()),
      marker_quality_override_reason = trim(p_reason),
      status = 'processing',
      tracking_status = 'analyzing'
  where id = target_item.id
  returning * into target_item;
  return target_item;
end;
$$;

revoke all on function public.create_ar_item_draft(uuid, uuid, uuid, text, text, uuid)
from public, anon, authenticated;
revoke all on function public.prepare_ar_item_processing(
  uuid, uuid, uuid, uuid, boolean, boolean, public.marker_lost_behavior, text, boolean
) from public, anon, authenticated;
revoke all on function public.claim_processing_jobs(text, integer) from public, anon, authenticated;
revoke all on function public.report_processing_progress(bigint, text, integer) from public, anon, authenticated;
revoke all on function public.complete_processing_job(bigint, text, jsonb) from public, anon, authenticated;
revoke all on function public.fail_processing_job(bigint, text, text) from public, anon, authenticated;
revoke all on function public.retry_ar_item_processing(uuid, uuid) from public, anon, authenticated;
revoke all on function public.override_marker_quality(uuid, uuid, text) from public, anon, authenticated;

grant execute on function public.create_ar_item_draft(uuid, uuid, uuid, text, text, uuid) to authenticated;
grant execute on function public.prepare_ar_item_processing(
  uuid, uuid, uuid, uuid, boolean, boolean, public.marker_lost_behavior, text, boolean
) to authenticated;
grant execute on function public.retry_ar_item_processing(uuid, uuid) to authenticated;
grant execute on function public.override_marker_quality(uuid, uuid, text) to authenticated;
grant execute on function public.claim_processing_jobs(text, integer) to service_role;
grant execute on function public.report_processing_progress(bigint, text, integer) to service_role;
grant execute on function public.complete_processing_job(bigint, text, jsonb) to service_role;
grant execute on function public.fail_processing_job(bigint, text, text) to service_role;
