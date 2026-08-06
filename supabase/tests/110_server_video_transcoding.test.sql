begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(11);

select ok(
  pg_catalog.has_function_privilege(
    'service_role',
    'public.complete_video_transcode_job(bigint,text,jsonb)',
    'EXECUTE'
  ),
  'only the processing boundary can complete a video transcode'
);
select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'public.complete_video_transcode_job(bigint,text,jsonb)',
    'EXECUTE'
  ),
  'browser clients cannot complete a video transcode'
);
select ok(
  array_position(
    (select allowed_mime_types from storage.buckets where id = 'generated-private'),
    'video/mp4'
  ) is not null,
  'generated private storage accepts the compatible MP4 output'
);

insert into public.media_assets (
  id, account_id, project_id, group_id, kind, storage_bucket, storage_path,
  original_file_name, mime_type, size_bytes, sha256, version, metadata, created_by
) values (
  '8a000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000001',
  'video',
  'videos-private',
  'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/uploads/8a000000-0000-4000-8000-000000000001/v1/video.mp4',
  'iphone.source.mp4',
  'video/mp4',
  4096,
  repeat('a', 64),
  1,
  '{"serverTranscodeRequired":true,"optimization":{"strategy":"server-transcode"}}'::jsonb,
  '10000000-0000-4000-8000-000000000010'
);

update public.ar_items
set status = 'processing', tracking_status = 'uploaded'
where id = '70000000-0000-4000-8000-000000000001';

select lives_ok(
  $$
    insert into public.processing_jobs (
      account_id, ar_item_id, type, dedupe_key, input_metadata
    ) values (
      '20000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000001',
      'video_inspection',
      'server-video-test:v1:video_inspection',
      jsonb_build_object(
        'revision', 1,
        'assetId', '8a000000-0000-4000-8000-000000000001',
        'bucket', 'videos-private',
        'path', 'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/uploads/8a000000-0000-4000-8000-000000000001/v1/video.mp4'
      )
    )
  $$,
  'video inspection enqueue accepts a server-transcode source'
);
select is(
  (
    select count(*)
    from public.processing_jobs
    where ar_item_id = '70000000-0000-4000-8000-000000000001'
      and type = 'video_transcode'
      and input_metadata ->> 'revision' = '1'
  ),
  1::bigint,
  'the trigger adds exactly one transcode job'
);
select is(
  (
    select type
    from public.claim_processing_jobs('server-video-test-worker', 1)
    limit 1
  ),
  'video_transcode'::public.job_type,
  'the compatible-video job is claimed before inspection'
);
select is(
  (
    select status
    from public.processing_jobs
    where dedupe_key = 'server-video-test:v1:video_inspection'
  ),
  'queued'::public.job_status,
  'inspection waits for the transcode to succeed'
);

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name, metadata)
    values (
      'generated-private',
      'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/items/70000000-0000-4000-8000-000000000001/v1/video/video.mp4',
      '{"mimetype":"video/mp4","size":2048}'::jsonb
    )
  $$,
  'worker uploads the compatible generated video'
);

select lives_ok(
  $$
    select public.complete_video_transcode_job(
      (
        select id
        from public.processing_jobs
        where ar_item_id = '70000000-0000-4000-8000-000000000001'
          and type = 'video_transcode'
          and status = 'running'
          and locked_by = 'server-video-test-worker'
      ),
      'server-video-test-worker',
      jsonb_build_object(
        'storageBucket', 'generated-private',
        'storagePath', 'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/items/70000000-0000-4000-8000-000000000001/v1/video/video.mp4',
        'sha256', repeat('b', 64),
        'videoCodec', 'h264',
        'audioCodec', 'aac',
        'durationSeconds', 12,
        'width', 720,
        'height', 960
      )
    )
  $$,
  'worker can finalize a generated video beside its source upload'
);

select is(
  (
    select count(*)
    from public.media_assets
    where account_id = '20000000-0000-4000-8000-000000000001'
      and group_id = '60000000-0000-4000-8000-000000000001'
      and kind = 'video'
      and version = 1
      and deleted_at is null
  ),
  2::bigint,
  'the source and generated video assets coexist at one revision'
);

select is(
  (
    select video_path
    from public.ar_items
    where id = '70000000-0000-4000-8000-000000000001'
  ),
  'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/items/70000000-0000-4000-8000-000000000001/v1/video/video.mp4'::text,
  'the AR item points at the compatible generated video'
);

select * from finish();
rollback;
