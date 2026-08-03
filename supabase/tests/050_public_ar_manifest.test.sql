begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(21);

select ok(
  not pg_catalog.has_function_privilege('anon', 'public.get_public_ar_manifest_source(text)', 'EXECUTE'),
  'anonymous clients cannot resolve internal manifest sources'
);
select ok(
  not pg_catalog.has_function_privilege('authenticated', 'public.get_public_ar_manifest_source(text)', 'EXECUTE'),
  'authenticated browsers cannot resolve internal manifest sources'
);
select ok(
  pg_catalog.has_function_privilege('service_role', 'public.get_public_ar_manifest_source(text)', 'EXECUTE'),
  'only the service boundary can resolve manifest sources'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'private.public_manifest_rate_limits', 'SELECT'),
  'anonymous clients cannot inspect rate limit buckets'
);
select ok(
  not pg_catalog.has_function_privilege('authenticated', 'public.consume_public_manifest_rate_limit(text,integer,integer)', 'EXECUTE'),
  'browser clients cannot consume trusted rate limit buckets'
);

set local role service_role;
select ok(
  public.consume_public_manifest_rate_limit('ip:' || repeat('a', 64), 2, 60),
  'first request is inside the rate limit'
);
select ok(
  public.consume_public_manifest_rate_limit('ip:' || repeat('a', 64), 2, 60),
  'second request is inside the rate limit'
);
select ok(
  not public.consume_public_manifest_rate_limit('ip:' || repeat('a', 64), 2, 60),
  'request above the rate limit is rejected'
);
select throws_ok(
  $$ select public.consume_public_manifest_rate_limit('ip:raw-address', 2, 60) $$,
  '22023',
  'Invalid public manifest rate limit bucket',
  'raw network identifiers are rejected'
);

reset role;
update private.public_manifest_rate_limits
set window_started_at = statement_timestamp() - interval '61 seconds'
where bucket_key = 'ip:' || repeat('a', 64);
set local role service_role;
select ok(
  public.consume_public_manifest_rate_limit('ip:' || repeat('a', 64), 2, 60),
  'expired rate limit window resets atomically'
);

reset role;
insert into public.media_assets (
  id, account_id, project_id, group_id, kind, storage_bucket, storage_path,
  original_file_name, mime_type, size_bytes, sha256, version, metadata, created_by
)
values (
  '85000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000001',
  'video',
  'videos-private',
  'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/uploads/85000000-0000-4000-8000-000000000001/v1/video.mp4',
  'public-video.mp4',
  'video/mp4',
  4096,
  repeat('e', 64),
  1,
  '{"width":1920,"height":1080,"durationSeconds":12,"videoCodec":"h264","audioCodec":"aac"}'::jsonb,
  '10000000-0000-4000-8000-000000000010'
);

insert into public.ar_items (
  id, account_id, project_id, group_id, title, public_slug, status,
  marker_width, marker_height, video_asset_id, video_path, video_thumbnail_path,
  tracking_dataset_path, tracking_status, visibility, published_at, created_by
)
values (
  '86000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000001',
  'Public AR fixture',
  repeat('b', 36),
  'published',
  1600,
  1200,
  '85000000-0000-4000-8000-000000000001',
  'accounts/private/video.mp4',
  'accounts/private/items/fixture/v1/thumbnail/video.webp',
  'accounts/private/items/fixture/v1/tracking/target.mind',
  'ready',
  'public',
  statement_timestamp(),
  '10000000-0000-4000-8000-000000000010'
);

set local role service_role;
select is(
  (select title from public.get_public_ar_manifest_source(repeat('b', 36))),
  'Public AR fixture',
  'published ready item resolves through the service boundary'
);
select is(
  (select video_bucket from public.get_public_ar_manifest_source(repeat('b', 36))),
  'videos-private',
  'manifest source uses the authoritative attached video bucket'
);
select is(
  (select tracking_bucket from public.get_public_ar_manifest_source(repeat('b', 36))),
  'generated-private',
  'tracking dataset remains in private generated Storage'
);
select ok(
  not (to_jsonb(source) ? 'account_id')
    and not (to_jsonb(source) ? 'id')
    and not (to_jsonb(source) ? 'public_slug'),
  'service manifest contract omits tenant and internal identifiers'
)
from public.get_public_ar_manifest_source(repeat('b', 36)) source;
select is_empty(
  $$ select * from public.get_public_ar_manifest_source('invalid-slug') $$,
  'invalid public slug does not resolve'
);

reset role;
update public.ar_items set status = 'ready', visibility = 'private', published_at = null
where id = '86000000-0000-4000-8000-000000000001';
set local role service_role;
select is_empty(
  $$ select * from public.get_public_ar_manifest_source(repeat('b', 36)) $$,
  'unpublished item is unavailable'
);

reset role;
update public.ar_items
set status = 'published', visibility = 'public', published_at = statement_timestamp(),
    expires_at = statement_timestamp() - interval '1 second'
where id = '86000000-0000-4000-8000-000000000001';
set local role service_role;
select is_empty(
  $$ select * from public.get_public_ar_manifest_source(repeat('b', 36)) $$,
  'expired item is unavailable'
);

reset role;
update public.ar_items set expires_at = null where id = '86000000-0000-4000-8000-000000000001';
update public.accounts set status = 'suspended' where id = '20000000-0000-4000-8000-000000000001';
set local role service_role;
select is_empty(
  $$ select * from public.get_public_ar_manifest_source(repeat('b', 36)) $$,
  'suspended account is unavailable'
);

reset role;
update public.accounts set status = 'active' where id = '20000000-0000-4000-8000-000000000001';
update public.subscriptions set status = 'expired' where account_id = '20000000-0000-4000-8000-000000000001';
set local role service_role;
select is_empty(
  $$ select * from public.get_public_ar_manifest_source(repeat('b', 36)) $$,
  'expired subscription is unavailable'
);

reset role;
update public.subscriptions
set status = 'grace_period',
    grace_period_ends_at = coalesce(expires_at, statement_timestamp()) + interval '1 day'
where account_id = '20000000-0000-4000-8000-000000000001';
set local role service_role;
select isnt_empty(
  $$ select * from public.get_public_ar_manifest_source(repeat('b', 36)) $$,
  'active grace period keeps published content available'
);

reset role;
update public.ar_items set tracking_status = 'failed' where id = '86000000-0000-4000-8000-000000000001';
set local role service_role;
select is_empty(
  $$ select * from public.get_public_ar_manifest_source(repeat('b', 36)) $$,
  'failed tracking dataset is unavailable'
);

select * from finish();
rollback;
