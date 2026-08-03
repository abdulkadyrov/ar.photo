begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(42);

select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.publish_ar_item(uuid,uuid,text,timestamptz)', 'EXECUTE'),
  'authenticated users can call the trusted publish boundary'
);
select ok(
  not pg_catalog.has_function_privilege('anon', 'public.publish_ar_item(uuid,uuid,text,timestamptz)', 'EXECUTE'),
  'anonymous users cannot publish AR items'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.unpublish_ar_item(uuid,uuid)', 'EXECUTE'),
  'authenticated users can call the trusted unpublish boundary'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.rotate_ar_item_public_slug(uuid,uuid,text)', 'EXECUTE'),
  'authenticated users can call the trusted slug rotation boundary'
);
select ok(
  not pg_catalog.has_column_privilege('authenticated', 'public.ar_items', 'status', 'UPDATE'),
  'browser clients cannot bypass publication by updating status directly'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.qr_codes', 'INSERT'),
  'browser clients cannot insert arbitrary QR metadata directly'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000012', true);
select throws_ok(
  $$
    select public.publish_ar_item(
      '20000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000001',
      'https://ar.example',
      null
    )
  $$,
  '42501',
  'Account write access required',
  'viewer role cannot publish'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select throws_ok(
  $$
    select public.publish_ar_item(
      '20000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000001',
      'https://ar.example',
      null
    )
  $$,
  '55000',
  'AR item is not ready for publication',
  'ready label alone cannot bypass authoritative asset checks'
);

reset role;
insert into public.media_assets (
  id, account_id, project_id, group_id, kind, storage_bucket, storage_path,
  original_file_name, mime_type, size_bytes, sha256, version, metadata, created_by
)
values
  (
    '87000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001',
    'marker', 'markers-private', 'accounts/alpha/items/publication/marker.jpg',
    'marker.jpg', 'image/jpeg', 2048, repeat('1', 64), 1,
    '{"width":1600,"height":1200,"exifStripped":true}'::jsonb,
    '10000000-0000-4000-8000-000000000010'
  ),
  (
    '87000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001',
    'video', 'videos-private', 'accounts/alpha/items/publication/video.mp4',
    'video.mp4', 'video/mp4', 4096, repeat('2', 64), 1,
    '{"width":1920,"height":1080,"durationSeconds":12,"videoCodec":"h264","audioCodec":"aac"}'::jsonb,
    '10000000-0000-4000-8000-000000000010'
  );

insert into public.ar_items (
  id, account_id, project_id, group_id, title, public_slug, status,
  marker_asset_id, video_asset_id, marker_width, marker_height,
  marker_quality_score, marker_quality_details, video_path, video_thumbnail_path,
  tracking_dataset_path, tracking_status, visibility, version, created_by
)
values (
  '88000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000001',
  'Publication fixture', repeat('c', 36), 'ready',
  '87000000-0000-4000-8000-000000000001',
  '87000000-0000-4000-8000-000000000002',
  1600, 1200, 88, '{"suitable":true}'::jsonb,
  'accounts/alpha/items/publication/video.mp4',
  'accounts/alpha/items/publication/v1/thumbnail/video.webp',
  'accounts/alpha/items/publication/v1/tracking/target.mind',
  'ready', 'private', 1,
  '10000000-0000-4000-8000-000000000010'
);

update public.media_assets
set ar_item_id = '88000000-0000-4000-8000-000000000001'
where id in (
  '87000000-0000-4000-8000-000000000001',
  '87000000-0000-4000-8000-000000000002'
);

insert into public.processing_jobs (
  account_id, ar_item_id, type, status, progress, attempt_count, dedupe_key,
  input_metadata, output_metadata, completed_at
)
select
  '20000000-0000-4000-8000-000000000001',
  '88000000-0000-4000-8000-000000000001',
  job_type,
  'succeeded',
  100,
  1,
  'publication:v1:' || job_type::text,
  '{"revision":1}'::jsonb,
  '{}'::jsonb,
  statement_timestamp()
from unnest(array[
  'marker_analysis'::public.job_type,
  'video_inspection'::public.job_type,
  'marker_compilation'::public.job_type,
  'thumbnail_generation'::public.job_type
]) job_type;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select throws_ok(
  $$
    select public.publish_ar_item(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001',
      'http://insecure.example',
      null
    )
  $$,
  '22023',
  'Invalid public application URL',
  'insecure public origins are rejected'
);
select throws_ok(
  $$
    select public.publish_ar_item(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001',
      'https://ar.example',
      statement_timestamp() + interval '1 minute'
    )
  $$,
  '22023',
  'Publication expiry must be at least five minutes in the future',
  'near-expired publications are rejected'
);
select lives_ok(
  $$
    select public.publish_ar_item(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001',
      'https://ar.example/customer',
      null
    )
  $$,
  'owner publishes a fully processed item'
);
select is(
  (select status from public.ar_items where id = '88000000-0000-4000-8000-000000000001'),
  'published'::public.ar_item_status,
  'published item status is authoritative'
);
select is(
  (select visibility from public.ar_items where id = '88000000-0000-4000-8000-000000000001'),
  'public'::public.content_visibility,
  'published item visibility is public'
);
select ok(
  (select published_at is not null from public.ar_items where id = '88000000-0000-4000-8000-000000000001'),
  'publication timestamp is recorded'
);
select is(
  (select public_url from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  'https://ar.example/customer/ar/' || repeat('c', 36),
  'QR URL is derived from configured base and public slug'
);
select ok(
  position('88000000-0000-4000-8000-000000000001' in (
    select public_url from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001'
  )) = 0,
  'QR URL contains no internal item UUID'
);
select is(
  (select count(*) from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  1::bigint,
  'publication creates exactly one QR metadata row'
);
select lives_ok(
  $$
    select public.publish_ar_item(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001',
      'https://ar.example/customer',
      null
    )
  $$,
  'repeated publication is idempotent'
);
select is(
  (select count(*) from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  1::bigint,
  'repeated publication does not duplicate QR metadata'
);
select is(
  (select version from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  1,
  'repeated publication preserves QR version'
);

reset role;
set local role service_role;
select isnt_empty(
  $$ select * from public.get_public_ar_manifest_source(repeat('c', 36)) $$,
  'published item becomes available to the manifest boundary'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000020', true);
select throws_ok(
  $$
    select public.unpublish_ar_item(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001'
    )
  $$,
  '42501',
  'Account write access required',
  'another account owner cannot unpublish the item'
);
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000012', true);
select throws_ok(
  $$
    select public.unpublish_ar_item(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001'
    )
  $$,
  '42501',
  'Account write access required',
  'viewer cannot unpublish the item'
);
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$
    select public.unpublish_ar_item(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001'
    )
  $$,
  'owner unpublishes the item'
);
select ok(
  (select status = 'ready' and visibility = 'private' and published_at is null
   from public.ar_items where id = '88000000-0000-4000-8000-000000000001'),
  'unpublish restores ready/private consistency'
);

reset role;
set local role service_role;
select is_empty(
  $$ select * from public.get_public_ar_manifest_source(repeat('c', 36)) $$,
  'unpublished item closes immediately at the manifest boundary'
);
reset role;
select is(
  (select count(*) from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  1::bigint,
  'unpublish retains stable QR metadata for republish'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$
    select public.publish_ar_item(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001',
      'https://ar.example/customer',
      null
    )
  $$,
  'owner republishes with the stable URL'
);

reset role;
select set_config('stage7.old_slug', (select public_slug from public.ar_items where id = '88000000-0000-4000-8000-000000000001'), true);
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$
    select public.rotate_ar_item_public_slug(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001',
      'https://ar.example/customer'
    )
  $$,
  'owner explicitly rotates the public slug'
);
select isnt(
  (select public_slug from public.ar_items where id = '88000000-0000-4000-8000-000000000001'),
  current_setting('stage7.old_slug'),
  'slug rotation changes the public capability URL'
);

reset role;
set local role service_role;
select is_empty(
  $$ select * from public.get_public_ar_manifest_source(current_setting('stage7.old_slug')) $$,
  'old slug stops resolving immediately'
);
reset role;
select is(
  (select public_url from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  'https://ar.example/customer/ar/' || (
    select public_slug from public.ar_items where id = '88000000-0000-4000-8000-000000000001'
  ),
  'rotated QR points only to the new public slug'
);
select is(
  (select version from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  2,
  'slug rotation increments QR version'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select throws_ok(
  $$
    select public.update_ar_item_qr_style(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001',
      '{"preset":"white","script":"alert(1)"}'::jsonb
    )
  $$,
  '22023',
  'Invalid QR style',
  'unknown QR style fields are rejected'
);
select throws_ok(
  $$
    select public.update_ar_item_qr_style(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001',
      '{"preset":"brand","foreground":"#6D5DFB","background":"#FFFFFF","quietZone":1,"logo":true,"logoScale":0.12}'::jsonb
    )
  $$,
  '22023',
  'Invalid QR style',
  'unsafe QR quiet zone is rejected'
);
select lives_ok(
  $$
    select public.update_ar_item_qr_style(
      '20000000-0000-4000-8000-000000000001',
      '88000000-0000-4000-8000-000000000001',
      '{"preset":"brand","foreground":"#4B35D2","background":"#FFFFFF","quietZone":4,"logo":true,"logoScale":0.12}'::jsonb
    )
  $$,
  'safe brand QR style is persisted'
);
select is(
  (select style ->> 'preset' from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  'brand',
  'persisted QR style uses an allowlisted preset'
);
select is(
  (select version from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  3,
  'style changes increment QR version'
);
select ok(
  exists (
    select 1 from public.audit_logs
    where account_id = '20000000-0000-4000-8000-000000000001'
      and entity_type = 'qr_codes'
      and entity_id = (select id from public.qr_codes where ar_item_id = '88000000-0000-4000-8000-000000000001')
  ),
  'QR mutations are audit logged'
);
select ok(
  exists (
    select 1 from public.audit_logs
    where account_id = '20000000-0000-4000-8000-000000000001'
      and entity_type = 'ar_items'
      and entity_id = '88000000-0000-4000-8000-000000000001'
      and action = 'ar_items.update'
  ),
  'publication lifecycle is audit logged'
);

reset role;
update public.subscriptions
set status = 'expired', expires_at = statement_timestamp() - interval '1 second'
where account_id = '20000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$ select public.unpublish_ar_item(
    '20000000-0000-4000-8000-000000000001',
    '88000000-0000-4000-8000-000000000001'
  ) $$,
  'owner can safely unpublish after subscription expiry'
);
select throws_ok(
  $$ select public.publish_ar_item(
    '20000000-0000-4000-8000-000000000001',
    '88000000-0000-4000-8000-000000000001',
    'https://ar.example/customer',
    null
  ) $$,
  '42501',
  'Account write access required',
  'expired subscription cannot republish'
);

select * from finish();
rollback;
