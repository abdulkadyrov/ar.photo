begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(41);

select ok(
  (select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.ar_view_events'::regclass),
  'raw analytics events use forced RLS'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.ar_view_sessions', 'SELECT'),
  'authenticated clients cannot read raw analytics sessions'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.ar_view_events', 'SELECT'),
  'authenticated clients cannot read raw analytics events'
);
select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.record_public_ar_event(text,text,public.ar_event_type,numeric,text,text,text,text,text)',
    'EXECUTE'
  ),
  'anonymous Data API clients cannot bypass public analytics ingestion'
);
select ok(
  pg_catalog.has_function_privilege(
    'service_role',
    'public.record_public_ar_event(text,text,public.ar_event_type,numeric,text,text,text,text,text)',
    'EXECUTE'
  ),
  'the Edge service boundary can record minimized events'
);
select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.get_analytics_summary(uuid,text,uuid,timestamptz,timestamptz)',
    'EXECUTE'
  ),
  'authenticated members can call the protected aggregate boundary'
);
select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'public.purge_analytics_before(timestamptz,integer)',
    'EXECUTE'
  ),
  'browser clients cannot invoke retention cleanup'
);

set local role service_role;
select ok(
  public.consume_public_analytics_rate_limit('analytics-ip:' || repeat('a', 64), 2, 60),
  'first analytics request is inside the rate limit'
);
select ok(
  public.consume_public_analytics_rate_limit('analytics-ip:' || repeat('a', 64), 2, 60),
  'second analytics request is inside the rate limit'
);
select ok(
  not public.consume_public_analytics_rate_limit('analytics-ip:' || repeat('a', 64), 2, 60),
  'analytics spam above the rate limit is rejected'
);
select throws_ok(
  $$ select public.consume_public_analytics_rate_limit('analytics-ip:203.0.113.10', 2, 60) $$,
  '22023',
  'Invalid public analytics rate limit bucket',
  'raw network identifiers cannot enter rate-limit storage'
);

reset role;
insert into public.media_assets (
  id, account_id, project_id, group_id, kind, storage_bucket, storage_path,
  original_file_name, mime_type, size_bytes, sha256, version, metadata, created_by
)
values (
  '87000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000001',
  'video',
  'videos-private',
  'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/uploads/87000000-0000-4000-8000-000000000001/v1/video.mp4',
  'analytics-video.mp4',
  'video/mp4',
  4096,
  repeat('f', 64),
  1,
  '{"width":1920,"height":1080,"durationSeconds":90,"videoCodec":"h264","audioCodec":"aac"}'::jsonb,
  '10000000-0000-4000-8000-000000000010'
);

insert into public.ar_items (
  id, account_id, project_id, group_id, title, public_slug, status,
  marker_width, marker_height, video_asset_id, video_path, video_thumbnail_path,
  tracking_dataset_path, tracking_status, visibility, published_at, created_by
)
values (
  '88000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000001',
  'Analytics fixture',
  repeat('c', 36),
  'published',
  1600,
  1200,
  '87000000-0000-4000-8000-000000000001',
  'accounts/private/video.mp4',
  'accounts/private/items/analytics/v1/thumbnail/video.webp',
  'accounts/private/items/analytics/v1/tracking/target.mind',
  'ready',
  'public',
  statement_timestamp(),
  '10000000-0000-4000-8000-000000000010'
);

set local role service_role;
select is(
  public.record_public_ar_event(
    repeat('c', 36), repeat('1', 64), 'page_open', null,
    'mobile', 'safari', 'ios', 'school.example', null
  ) ->> 'accepted',
  'true',
  'the first milestone is accepted'
);
select is(
  public.record_public_ar_event(
    repeat('c', 36), repeat('1', 64), 'page_open', null,
    'mobile', 'safari', 'ios', 'school.example', null
  ) ->> 'duplicate',
  'true',
  'a repeated milestone is idempotent'
);
select lives_ok(
  $$ select public.record_public_ar_event(
    repeat('c', 36), repeat('1', 64), 'marker_detected', 1.5,
    'mobile', 'safari', 'ios', 'school.example', null
  ) $$,
  'marker detection is recorded'
);
select lives_ok(
  $$ select public.record_public_ar_event(
    repeat('c', 36), repeat('1', 64), 'playback_started', 2.0,
    'mobile', 'safari', 'ios', 'school.example', null
  ) $$,
  'playback start is recorded'
);
select lives_ok(
  $$ select public.record_public_ar_event(
    repeat('c', 36), repeat('1', 64), 'completed', 12.5,
    'mobile', 'safari', 'ios', 'school.example', null
  ) $$,
  'completion records the bounded watch duration'
);
select lives_ok(
  $$ select public.record_public_ar_event(
    repeat('c', 36), repeat('1', 64), 'error', null,
    'mobile', 'safari', 'ios', 'school.example', 'playback_failed'
  ) $$,
  'a normalized error code is recorded'
);
select throws_ok(
  $$ select public.record_public_ar_event(
    repeat('c', 36), 'raw-session-token', 'page_open', null,
    'mobile', 'safari', 'ios', null, null
  ) $$,
  '22023',
  'Invalid public analytics event',
  'the database rejects an unhashed session token'
);
select throws_ok(
  $$ select public.record_public_ar_event(
    repeat('c', 36), repeat('2', 64), 'page_open', null,
    'mobile', 'safari', 'ios', 'https://school.example/path', null
  ) $$,
  '22023',
  'Invalid public analytics event',
  'the database rejects a full referrer URL'
);

reset role;
select is(
  (select count(*) from public.ar_view_sessions where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  1::bigint,
  'idempotent milestones reuse one session'
);
select is(
  (select count(*) from public.ar_view_events where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  5::bigint,
  'only unique milestones are stored'
);
select is(
  (select session_token_hash from public.ar_view_sessions where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  repeat('1', 64),
  'only the one-way session hash is persisted'
);
select ok(
  (select completed and ended_at is not null from public.ar_view_sessions where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  'completion updates the session lifecycle'
);
select is(
  (select duration_watched_seconds from public.ar_view_sessions where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  12.500::numeric,
  'session duration retains the greatest reported value'
);

insert into public.ar_view_sessions (
  ar_item_id, account_id, session_token_hash, started_at, completed,
  duration_watched_seconds, device_type, browser_family, os_family, error_code
)
values
  (
    '88000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
    repeat('2', 64), statement_timestamp() - interval '1 day', true,
    60, 'desktop', 'chrome', 'windows', null
  ),
  (
    '88000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
    repeat('3', 64), statement_timestamp() - interval '2 days', false,
    20, 'mobile', 'firefox', 'android', 'tracking_failed'
  ),
  (
    '88000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
    repeat('4', 64), statement_timestamp() - interval '3 days', false,
    0, 'other', 'other', 'other', null
  );

insert into public.ar_view_events (session_id, ar_item_id, account_id, event_type, occurred_at, error_code)
select s.id, s.ar_item_id, s.account_id, e.event_type, s.started_at + e.offset_value, e.error_code
from public.ar_view_sessions s
cross join lateral (
  select * from (values
    ('page_open'::public.ar_event_type, interval '0 seconds', null::text),
    ('camera_started'::public.ar_event_type, interval '1 second', null::text),
    ('marker_detected'::public.ar_event_type, interval '2 seconds', null::text),
    ('playback_started'::public.ar_event_type, interval '3 seconds', null::text),
    ('completed'::public.ar_event_type, interval '60 seconds', null::text)
  ) as fixture(event_type, offset_value, error_code)
) e
where s.session_token_hash = repeat('2', 64);

insert into public.ar_view_events (session_id, ar_item_id, account_id, event_type, occurred_at, error_code)
select s.id, s.ar_item_id, s.account_id, e.event_type, s.started_at + e.offset_value, e.error_code
from public.ar_view_sessions s
cross join lateral (
  select * from (values
    ('page_open'::public.ar_event_type, interval '0 seconds', null::text),
    ('camera_started'::public.ar_event_type, interval '1 second', null::text),
    ('marker_detected'::public.ar_event_type, interval '2 seconds', null::text),
    ('playback_started'::public.ar_event_type, interval '3 seconds', null::text),
    ('error'::public.ar_event_type, interval '4 seconds', 'tracking_failed'::text)
  ) as fixture(event_type, offset_value, error_code)
) e
where s.session_token_hash = repeat('3', 64);

insert into public.ar_view_events (session_id, ar_item_id, account_id, event_type, occurred_at, error_code)
select s.id, s.ar_item_id, s.account_id, 'page_open', s.started_at, null
from public.ar_view_sessions s
where s.session_token_hash = repeat('4', 64);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000012', true);
select throws_ok(
  $$ select public.get_analytics_summary(
    '20000000-0000-4000-8000-000000000001', 'account', null,
    statement_timestamp() - interval '7 days', statement_timestamp() + interval '1 minute'
  ) $$,
  '42501',
  'Analytics access required',
  'a member without analytics permission cannot read aggregates'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select set_config(
  'stage9.analytics',
  public.get_analytics_summary(
    '20000000-0000-4000-8000-000000000001', 'account', null,
    statement_timestamp() - interval '7 days', statement_timestamp() + interval '1 minute'
  )::text,
  true
);
select is((current_setting('stage9.analytics')::jsonb -> 'summary' ->> 'uniqueSessions')::integer, 4, 'aggregate counts unique sessions');
select is((current_setting('stage9.analytics')::jsonb -> 'summary' ->> 'pageOpens')::integer, 4, 'aggregate counts page opens');
select is((current_setting('stage9.analytics')::jsonb -> 'summary' ->> 'cameraStarts')::integer, 2, 'aggregate counts camera starts');
select is((current_setting('stage9.analytics')::jsonb -> 'summary' ->> 'markerDetections')::integer, 3, 'aggregate counts marker detections');
select is((current_setting('stage9.analytics')::jsonb -> 'summary' ->> 'playbackStarts')::integer, 3, 'aggregate counts playback starts');
select is((current_setting('stage9.analytics')::jsonb -> 'summary' ->> 'completions')::integer, 2, 'aggregate counts completions');
select is((current_setting('stage9.analytics')::jsonb -> 'summary' ->> 'errors')::integer, 2, 'aggregate counts errors');
select is((current_setting('stage9.analytics')::jsonb -> 'summary' ->> 'averageWatchSeconds')::numeric, 23.125::numeric, 'average watch duration is exact');
select is(jsonb_array_length(current_setting('stage9.analytics')::jsonb -> 'series'), 8, 'seven-day custom range returns inclusive UTC day buckets');
select is(
  (select (entry ->> 'count')::integer from jsonb_array_elements(current_setting('stage9.analytics')::jsonb -> 'devices') entry where entry ->> 'name' = 'mobile'),
  2,
  'device breakdown is accurate'
);
select is(
  (select (entry ->> 'count')::integer from jsonb_array_elements(current_setting('stage9.analytics')::jsonb -> 'errors') entry where entry ->> 'code' = 'tracking_failed'),
  1,
  'error breakdown is accurate'
);
select is(
  public.get_analytics_summary(
    '20000000-0000-4000-8000-000000000001', 'item', '88000000-0000-4000-8000-000000000001',
    statement_timestamp() - interval '7 days', statement_timestamp() + interval '1 minute'
  ) -> 'scope' ->> 'name',
  'Analytics fixture',
  'item scope resolves inside the account'
);
select throws_ok(
  $$ select public.get_analytics_summary(
    '20000000-0000-4000-8000-000000000001', 'account', null,
    statement_timestamp() - interval '400 days', statement_timestamp()
  ) $$,
  '22023',
  'Invalid analytics query',
  'custom analytics ranges are bounded'
);

reset role;
insert into public.ar_view_sessions (
  ar_item_id, account_id, session_token_hash, started_at, duration_watched_seconds
)
values (
  '88000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  repeat('9', 64),
  statement_timestamp() - interval '400 days',
  1
);
set local role service_role;
select is(
  public.purge_analytics_before(statement_timestamp() - interval '365 days', 100),
  1,
  'retention cleanup deletes only expired sessions in a bounded batch'
);
select throws_ok(
  $$ select public.purge_analytics_before(statement_timestamp() - interval '1 day', 100) $$,
  '22023',
  'Invalid analytics retention request',
  'retention cleanup cannot delete recent analytics'
);
reset role;
select is(
  (select count(*) from public.ar_view_sessions where ar_item_id = '88000000-0000-4000-8000-000000000001'),
  4::bigint,
  'retention preserves sessions inside the configured window'
);

select * from finish();
rollback;
