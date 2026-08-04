begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(44);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$
    select public.create_ar_item_draft(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      'Stage five item',
      'Processing fixture',
      '84000000-0000-4000-8000-000000000001'
    )
  $$,
  'owner creates an idempotent AR item draft'
);

select lives_ok(
  $$
    select public.create_ar_item_draft(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      'Stage five item',
      'Processing fixture',
      '84000000-0000-4000-8000-000000000001'
    )
  $$,
  'repeating draft creation returns the same item'
);

select is(
  (select count(*) from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
  1::bigint,
  'one item exists for the idempotency key'
);

select is(
  (select version from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
  1,
  'new draft starts at processing revision one'
);

reset role;
insert into public.media_assets (
  id, account_id, project_id, group_id, kind, storage_bucket, storage_path,
  original_file_name, mime_type, size_bytes, sha256, version, metadata, created_by
)
values
  (
    '83000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001',
    'marker',
    'markers-private',
    'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/uploads/83000000-0000-4000-8000-000000000001/v1/marker.jpg',
    'marker.jpg',
    'image/jpeg',
    2048,
    repeat('c', 64),
    1,
    '{"width":1600,"height":1200,"exifStripped":true}'::jsonb,
    '10000000-0000-4000-8000-000000000010'
  ),
  (
    '83000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001',
    'video',
    'videos-private',
    'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/uploads/83000000-0000-4000-8000-000000000002/v1/video.mp4',
    'video.mp4',
    'video/mp4',
    4096,
    repeat('d', 64),
    1,
    '{"width":1920,"height":1080,"durationSeconds":600,"videoCodec":"h264","audioCodec":"aac"}'::jsonb,
    '10000000-0000-4000-8000-000000000010'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$
    select public.prepare_ar_item_processing(
      '20000000-0000-4000-8000-000000000001',
      (select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
      '83000000-0000-4000-8000-000000000001',
      '83000000-0000-4000-8000-000000000002',
      true,
      true,
      'pause_hide',
      'muted',
      true
    )
  $$,
  'owner attaches verified marker and video assets'
);

select is(
  (select version from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
  1,
  'first media attachment keeps revision one'
);

select is(
  (
    select count(*) from public.processing_jobs
    where ar_item_id = (select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001')
  ),
  4::bigint,
  'one job exists for every processing stage'
);

select lives_ok(
  $$
    select public.prepare_ar_item_processing(
      '20000000-0000-4000-8000-000000000001',
      (select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
      '83000000-0000-4000-8000-000000000001',
      '83000000-0000-4000-8000-000000000002',
      true,
      true,
      'pause_hide',
      'muted',
      true
    )
  $$,
  'repeating media preparation is idempotent'
);

select is(
  (
    select count(*) from public.processing_jobs
    where ar_item_id = (select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001')
  ),
  4::bigint,
  'repeated preparation does not duplicate jobs'
);

select lives_ok(
  $$
    select public.override_marker_quality(
      '20000000-0000-4000-8000-000000000001',
      (select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
      'Клиент подтвердил риск слабого маркера до серверного анализа'
    )
  $$,
  'owner can persist a confirmed marker risk before server analysis finishes'
);

select ok(
  (select marker_quality_overridden_at is not null from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
  'pre-analysis marker risk is attributed and timestamped'
);

reset role;
update public.ar_items
set marker_quality_overridden_at = null,
    marker_quality_overridden_by = null,
    marker_quality_override_reason = null
where idempotency_key = '84000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);

select is(
  (select count(*) from public.media_assets where ar_item_id = (
    select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'
  )),
  2::bigint,
  'both original assets are attached to the item'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000012', true);
select throws_ok(
  $$
    select public.prepare_ar_item_processing(
      '20000000-0000-4000-8000-000000000001',
      (select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
      '83000000-0000-4000-8000-000000000001',
      '83000000-0000-4000-8000-000000000002',
      true,
      true,
      'pause_hide',
      'muted',
      true
    )
  $$,
  '42501',
  'Account write access required',
  'viewer cannot start processing'
);

select ok(
  not pg_catalog.has_function_privilege('authenticated', 'public.claim_processing_jobs(text,integer)', 'EXECUTE'),
  'browser clients cannot claim worker jobs'
);

reset role;
set local role service_role;
select lives_ok(
  $$ select public.claim_processing_jobs('worker-stage-five', 10) $$,
  'service worker atomically claims ready root jobs'
);

reset role;
select is(
  (
    select count(*) from public.processing_jobs
    where status = 'running' and locked_by = 'worker-stage-five'
      and type in ('marker_analysis', 'video_inspection')
  ),
  2::bigint,
  'only marker analysis and video inspection run before prerequisites'
);

select lives_ok(
  $$
    select public.report_processing_progress(
      (select id from public.processing_jobs where type = 'marker_analysis' and input_metadata ->> 'revision' = '1'),
      'worker-stage-five',
      40
    )
  $$,
  'worker reports monotonic progress'
);

reset role;
select is(
  (select progress from public.processing_jobs where type = 'marker_analysis' and input_metadata ->> 'revision' = '1'),
  40::smallint,
  'reported progress is visible to the account'
);

select lives_ok(
  $$
    select public.complete_processing_job(
      (select id from public.processing_jobs where type = 'marker_analysis' and input_metadata ->> 'revision' = '1'),
      'worker-stage-five',
      '{"score":48,"suitable":false,"metrics":{"sharpness":42,"contrast":51},"reasons":["low_detail"]}'::jsonb
    )
  $$,
  'worker records an unsuitable marker analysis'
);

select lives_ok(
  $$
    select public.complete_processing_job(
      (select id from public.processing_jobs where type = 'video_inspection' and input_metadata ->> 'revision' = '1'),
      'worker-stage-five',
      '{"width":1920,"height":1080,"durationSeconds":600,"videoCodec":"h264","audioCodec":"aac"}'::jsonb
    )
  $$,
  'worker records authoritative video inspection'
);

select lives_ok(
  $$ select public.claim_processing_jobs('worker-stage-five', 10) $$,
  'worker claims only processing stages with satisfied prerequisites'
);

reset role;
select is(
  (select status from public.processing_jobs where type = 'thumbnail_generation' and input_metadata ->> 'revision' = '1'),
  'running'::public.job_status,
  'thumbnail waits for successful video inspection'
);

select is(
  (select status from public.processing_jobs where type = 'marker_compilation' and input_metadata ->> 'revision' = '1'),
  'queued'::public.job_status,
  'unsuitable marker blocks compilation without override'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$
    select public.override_marker_quality(
      '20000000-0000-4000-8000-000000000001',
      (select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
      'Клиент подтвердил печать после ручной проверки оригинала'
    )
  $$,
  'owner explicitly overrides an unsuitable marker with a reason'
);

select ok(
  (select marker_quality_overridden_at is not null from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
  'quality override is attributed and timestamped'
);

reset role;
select lives_ok(
  $$ select public.claim_processing_jobs('worker-stage-five', 10) $$,
  'quality override releases marker compilation'
);

reset role;
insert into storage.objects (bucket_id, name, metadata)
values
  (
    'generated-private',
    'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/items/'
      || (select id::text from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001')
      || '/v1/tracking/target.mind',
    '{"mimetype":"application/octet-stream","size":300}'::jsonb
  ),
  (
    'generated-private',
    'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/items/'
      || (select id::text from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001')
      || '/v1/thumbnail/video.webp',
    '{"mimetype":"image/webp","size":400}'::jsonb
  );

select lives_ok(
  $$
    select public.complete_processing_job(
      (select id from public.processing_jobs where type = 'marker_compilation' and input_metadata ->> 'revision' = '1'),
      'worker-stage-five',
      jsonb_build_object(
        'storageBucket', 'generated-private',
        'storagePath', 'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/items/'
          || (select id::text from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001')
          || '/v1/tracking/target.mind',
        'sha256', repeat('e', 64)
      )
    )
  $$,
  'worker finalizes one compiled tracking asset'
);

select lives_ok(
  $$
    select public.complete_processing_job(
      (select id from public.processing_jobs where type = 'thumbnail_generation' and input_metadata ->> 'revision' = '1'),
      'worker-stage-five',
      jsonb_build_object(
        'storageBucket', 'generated-private',
        'storagePath', 'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/items/'
          || (select id::text from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001')
          || '/v1/thumbnail/video.webp',
        'sha256', repeat('f', 64)
      )
    )
  $$,
  'worker finalizes one video thumbnail asset'
);

reset role;
select is(
  (select status from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
  'ready'::public.ar_item_status,
  'item becomes ready only after every required job succeeds'
);

select is(
  (select count(*) from public.media_assets where kind in ('tracking', 'poster') and ar_item_id = (
    select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'
  )),
  2::bigint,
  'generated assets are immutable records attached to the item'
);

select is(
  (select storage_used_bytes from public.accounts where id = '20000000-0000-4000-8000-000000000001'),
  700::bigint,
  'generated assets are counted once against storage quota'
);

select is(
  (select count(*) from public.processing_jobs where status = 'succeeded' and ar_item_id = (
    select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'
  )),
  4::bigint,
  'all four revision jobs succeeded'
);

insert into public.media_assets (
  id, account_id, project_id, group_id, kind, storage_bucket, storage_path,
  original_file_name, mime_type, size_bytes, sha256, version, metadata, created_by
)
values (
  '83000000-0000-4000-8000-000000000003',
  '20000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000001',
  'marker',
  'markers-private',
  'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/uploads/83000000-0000-4000-8000-000000000003/v2/marker.jpg',
  'replacement.jpg',
  'image/jpeg',
  3072,
  repeat('1', 64),
  2,
  '{"width":1800,"height":1200,"exifStripped":true}'::jsonb,
  '10000000-0000-4000-8000-000000000010'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$
    select public.prepare_ar_item_processing(
      '20000000-0000-4000-8000-000000000001',
      (select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
      '83000000-0000-4000-8000-000000000003',
      '83000000-0000-4000-8000-000000000002',
      true,
      true,
      'pause_hide',
      'muted',
      true
    )
  $$,
  'replacing a marker starts one new processing revision'
);

select is(
  (select version from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'),
  2,
  'replacement increments the item revision'
);

select is(
  (select count(*) from public.processing_jobs where ar_item_id = (
    select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'
  )),
  8::bigint,
  'replacement creates one deduplicated job set for revision two'
);

reset role;
update public.processing_jobs
set max_attempts = 1
where type = 'marker_analysis' and input_metadata ->> 'revision' = '2';

set local role service_role;
select lives_ok(
  $$ select public.claim_processing_jobs('worker-stage-five-retry', 2) $$,
  'worker claims replacement root jobs'
);

reset role;
select lives_ok(
  $$
    select public.fail_processing_job(
      (select id from public.processing_jobs where type = 'marker_analysis' and input_metadata ->> 'revision' = '2'),
      'worker-stage-five-retry',
      'compiler/crash details are redacted'
    )
  $$,
  'worker records a safe terminal failure'
);

reset role;
select is(
  (select status from public.processing_jobs where type = 'marker_analysis' and input_metadata ->> 'revision' = '2'),
  'failed'::public.job_status,
  'max-attempt job becomes failed'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$
    select public.retry_ar_item_processing(
      '20000000-0000-4000-8000-000000000001',
      (select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001')
    )
  $$,
  'owner retries the same failed job record'
);

reset role;
select is(
  (select count(*) from public.processing_jobs where ar_item_id = (
    select id from public.ar_items where idempotency_key = '84000000-0000-4000-8000-000000000001'
  )),
  8::bigint,
  'retry does not create duplicate jobs or assets'
);

select is(
  (select status from public.processing_jobs where type = 'marker_analysis' and input_metadata ->> 'revision' = '2'),
  'queued'::public.job_status,
  'failed job returns to the queue with reset attempts'
);

select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'public.complete_processing_job(bigint,text,jsonb)',
    'EXECUTE'
  ),
  'browser clients cannot forge processing completion'
);

update public.processing_jobs
set locked_at = statement_timestamp() - interval '21 minutes'
where type = 'video_inspection'
  and status = 'running'
  and input_metadata ->> 'revision' = '2';

set local role service_role;
select lives_ok(
  $$ select public.claim_processing_jobs('worker-stage-five-recovered', 2) $$,
  'worker reclaims an expired processing lease'
);

reset role;
select is(
  (
    select locked_by from public.processing_jobs
    where type = 'video_inspection' and input_metadata ->> 'revision' = '2'
  ),
  'worker-stage-five-recovered',
  'reclaimed jobs are locked by the replacement worker'
);

select * from finish();
rollback;
