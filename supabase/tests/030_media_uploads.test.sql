begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(33);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$
    select public.begin_media_upload(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      'marker',
      'marker.jpg',
      'image/jpeg',
      2048,
      '82000000-0000-4000-8000-000000000001'
    )
  $$,
  'owner reserves a marker upload'
);

select lives_ok(
  $$
    select public.begin_media_upload(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      'marker',
      'marker.jpg',
      'image/jpeg',
      2048,
      '82000000-0000-4000-8000-000000000001'
    )
  $$,
  'repeating the same upload reservation is idempotent'
);

select is(
  (select count(*) from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000001'),
  1::bigint,
  'one upload session exists for an idempotency key'
);

select ok(
  (
    select storage_path ~ '^accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/uploads/[a-f0-9-]+/v1/marker\.jpg$'
    from public.upload_sessions
    where idempotency_key = '82000000-0000-4000-8000-000000000001'
  ),
  'upload path is immutable, tenant-scoped and versioned'
);

select throws_ok(
  $$
    select public.begin_media_upload(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      'video',
      'spoofed.mov',
      'video/quicktime',
      2048,
      '82000000-0000-4000-8000-000000000002'
    )
  $$,
  '22023',
  'Unsupported media kind or MIME type',
  'server rejects media outside the MVP allowlist'
);

select lives_ok(
  $$
    select public.start_media_upload(
      (select id from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000001')
    )
  $$,
  'owner starts the reserved upload'
);

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name, metadata)
    select storage_bucket, storage_path, '{"mimetype":"image/jpeg","size":2048}'::jsonb
    from public.upload_sessions
    where idempotency_key = '82000000-0000-4000-8000-000000000001'
  $$,
  'owner writes the reserved object to private Storage'
);

select lives_ok(
  $$
    select public.finalize_media_upload(
      (select id from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000001'),
      repeat('a', 64),
      '{"width":1600,"height":1200,"exifStripped":true}'::jsonb
    )
  $$,
  'owner finalizes an uploaded marker'
);

select is(
  (select count(*) from public.media_assets where sha256 = repeat('a', 64)),
  1::bigint,
  'finalization creates one immutable media asset'
);

select is(
  (select group_id from public.media_assets where sha256 = repeat('a', 64)),
  '60000000-0000-4000-8000-000000000001'::uuid,
  'media asset remains scoped to its project group'
);

select is(
  (select storage_used_bytes from public.accounts where id = '20000000-0000-4000-8000-000000000001'),
  2048::bigint,
  'finalization atomically accounts for stored bytes'
);

select lives_ok(
  $$
    select public.finalize_media_upload(
      (select id from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000001'),
      repeat('a', 64),
      '{}'::jsonb
    )
  $$,
  'repeating finalization returns the existing asset'
);

select is(
  (select count(*) from public.media_assets where sha256 = repeat('a', 64)),
  1::bigint,
  'repeated finalization does not double-account or duplicate assets'
);

select lives_ok(
  $$
    select public.begin_media_upload(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      'video',
      'stage-four.mp4',
      'video/mp4',
      4096,
      '82000000-0000-4000-8000-000000000006'
    )
  $$,
  'owner reserves an allowlisted MP4 upload'
);

select lives_ok(
  $$
    select public.start_media_upload(
      (select id from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000006')
    )
  $$,
  'owner starts the MP4 upload'
);

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name, metadata)
    select storage_bucket, storage_path, '{"mimetype":"video/mp4","size":4096}'::jsonb
    from public.upload_sessions
    where idempotency_key = '82000000-0000-4000-8000-000000000006'
  $$,
  'owner writes the MP4 object to private Storage'
);

select throws_ok(
  $$
    select public.finalize_media_upload(
      (select id from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000006'),
      repeat('b', 64),
      '{"width":1920,"height":1080,"durationSeconds":601,"videoCodec":"h264","audioCodec":"aac"}'::jsonb
    )
  $$,
  '23514',
  'Video duration limit reached',
  'server rejects video beyond the effective plan duration'
);

select lives_ok(
  $$
    select public.finalize_media_upload(
      (select id from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000006'),
      repeat('b', 64),
      '{"width":1920,"height":1080,"durationSeconds":600,"videoCodec":"h264","audioCodec":"aac"}'::jsonb
    )
  $$,
  'server accepts verified H.264 metadata within the plan duration'
);

select is(
  (select metadata ->> 'videoCodec' from public.media_assets where sha256 = repeat('b', 64)),
  'h264',
  'finalized video keeps inspected codec metadata'
);

select lives_ok(
  $$
    select public.begin_media_upload(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      'video',
      'iphone.source.mp4',
      'video/mp4',
      8192,
      '82000000-0000-4000-8000-000000000007'
    )
  $$,
  'owner reserves an iPhone source video upload'
);

select lives_ok(
  $$
    select public.start_media_upload(
      (select id from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000007')
    )
  $$,
  'owner starts the source video upload'
);

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name, metadata)
    select storage_bucket, storage_path, '{"mimetype":"video/mp4","size":8192}'::jsonb
    from public.upload_sessions
    where idempotency_key = '82000000-0000-4000-8000-000000000007'
  $$,
  'owner writes the source video to private Storage'
);

select lives_ok(
  $$
    select public.finalize_media_upload(
      (select id from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000007'),
      repeat('c', 64),
      '{"width":1920,"height":1080,"durationSeconds":12,"videoCodec":"source","audioCodec":"source","serverTranscodeRequired":true,"optimization":{"strategy":"server-transcode","optimized":false}}'::jsonb
    )
  $$,
  'server-transcode source metadata can finalize before authoritative inspection'
);

select is(
  (select metadata ->> 'serverTranscodeRequired' from public.media_assets where sha256 = repeat('c', 64)),
  'true',
  'finalized source remains explicitly queued for server transcoding'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000012', true);
select throws_ok(
  $$
    select public.begin_media_upload(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      'marker',
      'viewer.jpg',
      'image/jpeg',
      2048,
      '82000000-0000-4000-8000-000000000003'
    )
  $$,
  '42501',
  'Account write access required',
  'viewer cannot reserve uploads'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000020', true);
select throws_ok(
  $$
    select public.begin_media_upload(
      '20000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000002',
      '60000000-0000-4000-8000-000000000002',
      'video',
      'expired.mp4',
      'video/mp4',
      4096,
      '82000000-0000-4000-8000-000000000004'
    )
  $$,
  '42501',
  'Account write access required',
  'expired subscription cannot reserve uploads'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$
    select public.begin_media_upload(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      'marker',
      'stale.png',
      'image/png',
      1024,
      '82000000-0000-4000-8000-000000000005'
    )
  $$,
  'owner creates a second pending upload'
);

reset role;
update public.upload_sessions
set expires_at = statement_timestamp() - interval '1 minute'
where idempotency_key = '82000000-0000-4000-8000-000000000005';

set local role service_role;
select lives_ok(
  $$ select public.expire_stale_uploads(10) $$,
  'service cleanup expires stale reservations'
);

reset role;
select is(
  (select status from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000005'),
  'expired'::public.media_upload_status,
  'stale upload no longer reserves quota'
);

select is(
  (select error_code from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000005'),
  'cleanup_in_progress',
  'stale object is leased to one cleanup worker'
);

select lives_ok(
  $$
    select public.complete_upload_cleanup(
      array[(select id from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000005')],
      true
    )
  $$,
  'service worker acknowledges successful Storage cleanup'
);

reset role;
select is(
  (select error_code from public.upload_sessions where idempotency_key = '82000000-0000-4000-8000-000000000005'),
  'upload_expired_cleaned',
  'completed cleanup is not leased again'
);

select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'public.complete_upload_cleanup(uuid[],boolean)',
    'EXECUTE'
  ),
  'browser clients cannot acknowledge cleanup jobs'
);

select * from finish();
rollback;
