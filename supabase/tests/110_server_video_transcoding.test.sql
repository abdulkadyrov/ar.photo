begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(7);

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
  'video/mp4' = any(
    (select allowed_mime_types from storage.buckets where id = 'generated-private')
  ),
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

select * from finish();
rollback;
