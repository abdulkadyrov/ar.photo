-- Stage 9: privacy-minimized AR analytics, trusted aggregates and bounded retention.

drop policy if exists ar_view_sessions_read on public.ar_view_sessions;
revoke select on table public.ar_view_sessions from authenticated;

alter table public.ar_view_sessions
  drop constraint ar_view_sessions_hash_length,
  add constraint ar_view_sessions_hash_format
    check (session_token_hash ~ '^[a-f0-9]{64}$'),
  add constraint ar_view_sessions_device_type
    check (device_type is null or device_type in ('mobile', 'tablet', 'desktop', 'other')),
  add constraint ar_view_sessions_browser_family
    check (browser_family is null or browser_family in ('chrome', 'safari', 'edge', 'firefox', 'other')),
  add constraint ar_view_sessions_os_family
    check (os_family is null or os_family in ('ios', 'android', 'macos', 'windows', 'linux', 'other')),
  add constraint ar_view_sessions_referrer_domain
    check (
      referrer_domain is null
      or (
        char_length(referrer_domain) between 1 and 253
        and referrer_domain ~ '^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$'
      )
    ),
  add constraint ar_view_sessions_error_code
    check (error_code is null or error_code ~ '^[a-z][a-z0-9_]{0,63}$'),
  add constraint ar_view_sessions_item_token_key unique (ar_item_id, session_token_hash),
  add constraint ar_view_sessions_identity_scope_key unique (id, ar_item_id, account_id);

create table public.ar_view_events (
  id bigint generated always as identity primary key,
  session_id bigint not null,
  ar_item_id uuid not null,
  account_id uuid not null,
  event_type public.ar_event_type not null,
  occurred_at timestamptz not null default now(),
  value_numeric numeric(12, 3),
  error_code text,
  constraint ar_view_events_session_scope_fkey
    foreign key (session_id, ar_item_id, account_id)
    references public.ar_view_sessions(id, ar_item_id, account_id) on delete cascade,
  constraint ar_view_events_session_milestone_key unique (session_id, event_type),
  constraint ar_view_events_value_range
    check (value_numeric is null or value_numeric between 0 and 86400),
  constraint ar_view_events_error_code
    check (error_code is null or error_code ~ '^[a-z][a-z0-9_]{0,63}$'),
  constraint ar_view_events_error_contract
    check (
      (event_type = 'error'::public.ar_event_type and error_code is not null)
      or (event_type <> 'error'::public.ar_event_type and error_code is null)
    )
);

create index ar_view_events_item_occurred_idx
on public.ar_view_events(ar_item_id, occurred_at desc, id);
create index ar_view_events_account_occurred_idx
on public.ar_view_events(account_id, occurred_at desc, id);

alter table public.ar_view_events enable row level security;
alter table public.ar_view_events force row level security;
revoke all on table public.ar_view_events from public, anon, authenticated;
revoke all on sequence public.ar_view_events_id_seq from public, anon, authenticated;

create table private.public_analytics_rate_limits (
  bucket_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null,
  updated_at timestamptz not null default now(),
  constraint public_analytics_rate_limits_key_format check (
    bucket_key ~ '^analytics-(ip|session):[a-f0-9]{64}$'
  ),
  constraint public_analytics_rate_limits_count_positive check (request_count > 0)
);

revoke all on table private.public_analytics_rate_limits from public, anon, authenticated;

create or replace function public.consume_public_analytics_rate_limit(
  p_bucket_key text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_count integer;
  request_window interval;
begin
  if p_bucket_key !~ '^analytics-(ip|session):[a-f0-9]{64}$'
    or p_max_requests not between 1 and 10000
    or p_window_seconds not between 1 and 86400
  then
    raise exception 'Invalid public analytics rate limit bucket' using errcode = '22023';
  end if;

  request_window := pg_catalog.make_interval(secs => p_window_seconds);
  insert into private.public_analytics_rate_limits (
    bucket_key,
    window_started_at,
    request_count,
    updated_at
  )
  values (p_bucket_key, statement_timestamp(), 1, statement_timestamp())
  on conflict (bucket_key) do update
  set window_started_at = case
        when private.public_analytics_rate_limits.window_started_at
          <= statement_timestamp() - request_window
        then statement_timestamp()
        else private.public_analytics_rate_limits.window_started_at
      end,
      request_count = case
        when private.public_analytics_rate_limits.window_started_at
          <= statement_timestamp() - request_window
        then 1
        else private.public_analytics_rate_limits.request_count + 1
      end,
      updated_at = statement_timestamp()
  returning request_count into next_count;

  return next_count <= p_max_requests;
end;
$$;

create or replace function public.record_public_ar_event(
  p_public_slug text,
  p_session_token_hash text,
  p_event_type public.ar_event_type,
  p_value_numeric numeric default null,
  p_device_type text default 'other',
  p_browser_family text default 'other',
  p_os_family text default 'other',
  p_referrer_domain text default null,
  p_error_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item record;
  target_session_id bigint;
  inserted_event_id bigint;
  event_time timestamptz := statement_timestamp();
  normalized_device text := coalesce(p_device_type, 'other');
  normalized_browser text := coalesce(p_browser_family, 'other');
  normalized_os text := coalesce(p_os_family, 'other');
  normalized_referrer text := nullif(lower(trim(trailing '.' from btrim(p_referrer_domain))), '');
begin
  if p_event_type is null
    or p_public_slug !~ '^[a-f0-9]{36}$'
    or p_session_token_hash !~ '^[a-f0-9]{64}$'
    or normalized_device not in ('mobile', 'tablet', 'desktop', 'other')
    or normalized_browser not in ('chrome', 'safari', 'edge', 'firefox', 'other')
    or normalized_os not in ('ios', 'android', 'macos', 'windows', 'linux', 'other')
    or (
      normalized_referrer is not null
      and (
        char_length(normalized_referrer) > 253
        or normalized_referrer !~ '^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$'
      )
    )
    or p_value_numeric < 0
    or p_value_numeric > 86400
    or (
      p_event_type = 'error'::public.ar_event_type
      and (p_error_code is null or p_error_code !~ '^[a-z][a-z0-9_]{0,63}$')
    )
    or (p_event_type <> 'error'::public.ar_event_type and p_error_code is not null)
  then
    raise exception 'Invalid public analytics event' using errcode = '22023';
  end if;

  select i.id, i.account_id
  into target_item
  from public.ar_items i
  join public.accounts a on a.id = i.account_id
  join public.subscriptions s on s.account_id = i.account_id
  join public.media_assets video
    on video.id = i.video_asset_id
   and video.account_id = i.account_id
   and video.kind = 'video'
   and video.deleted_at is null
  where i.public_slug = p_public_slug
    and i.status = 'published'
    and i.visibility = 'public'
    and i.published_at is not null
    and i.deleted_at is null
    and (i.expires_at is null or i.expires_at > event_time)
    and i.tracking_status = 'ready'
    and i.tracking_dataset_path is not null
    and i.video_thumbnail_path is not null
    and i.marker_width > 0
    and i.marker_height > 0
    and a.status = 'active'
    and (
      (s.status in ('trial', 'active') and (s.expires_at is null or s.expires_at > event_time))
      or (s.status = 'grace_period' and s.grace_period_ends_at > event_time)
    )
  limit 1;

  if not found then
    raise exception 'Public AR item not found' using errcode = 'P0002';
  end if;

  insert into public.ar_view_sessions (
    ar_item_id,
    account_id,
    session_token_hash,
    started_at,
    duration_watched_seconds,
    device_type,
    browser_family,
    os_family,
    referrer_domain
  )
  values (
    target_item.id,
    target_item.account_id,
    p_session_token_hash,
    event_time,
    coalesce(p_value_numeric, 0),
    normalized_device,
    normalized_browser,
    normalized_os,
    normalized_referrer
  )
  on conflict (ar_item_id, session_token_hash) do update
  set duration_watched_seconds = greatest(
        public.ar_view_sessions.duration_watched_seconds,
        coalesce(excluded.duration_watched_seconds, 0)
      ),
      device_type = coalesce(public.ar_view_sessions.device_type, excluded.device_type),
      browser_family = coalesce(public.ar_view_sessions.browser_family, excluded.browser_family),
      os_family = coalesce(public.ar_view_sessions.os_family, excluded.os_family),
      referrer_domain = coalesce(public.ar_view_sessions.referrer_domain, excluded.referrer_domain)
  returning id into target_session_id;

  insert into public.ar_view_events (
    session_id,
    ar_item_id,
    account_id,
    event_type,
    occurred_at,
    value_numeric,
    error_code
  )
  values (
    target_session_id,
    target_item.id,
    target_item.account_id,
    p_event_type,
    event_time,
    p_value_numeric,
    p_error_code
  )
  on conflict (session_id, event_type) do nothing
  returning id into inserted_event_id;

  update public.ar_view_sessions
  set marker_detected_at = case
        when p_event_type = 'marker_detected'::public.ar_event_type
        then coalesce(marker_detected_at, event_time)
        else marker_detected_at
      end,
      playback_started_at = case
        when p_event_type = 'playback_started'::public.ar_event_type
        then coalesce(playback_started_at, event_time)
        else playback_started_at
      end,
      completed = completed or p_event_type = 'completed'::public.ar_event_type,
      ended_at = case
        when p_event_type = 'completed'::public.ar_event_type then coalesce(ended_at, event_time)
        else ended_at
      end,
      duration_watched_seconds = greatest(duration_watched_seconds, coalesce(p_value_numeric, 0)),
      error_code = case
        when p_event_type = 'error'::public.ar_event_type then coalesce(error_code, p_error_code)
        else error_code
      end
  where id = target_session_id;

  return jsonb_build_object(
    'accepted', inserted_event_id is not null,
    'duplicate', inserted_event_id is null
  );
end;
$$;

create or replace function public.get_analytics_summary(
  p_target_account_id uuid,
  p_scope_type text,
  p_scope_id uuid,
  p_from timestamptz,
  p_to timestamptz
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  scope_name text;
  analytics_result jsonb;
begin
  if (select auth.uid()) is null
    or not (select private.member_has_permission(p_target_account_id, 'analytics'))
  then
    raise exception 'Analytics access required' using errcode = '42501';
  end if;

  if p_scope_type not in ('account', 'project', 'group', 'item')
    or p_from is null
    or p_to is null
    or p_from >= p_to
    or p_to - p_from > interval '366 days'
  then
    raise exception 'Invalid analytics query' using errcode = '22023';
  end if;

  if p_scope_type = 'account' then
    if p_scope_id is not null and p_scope_id <> p_target_account_id then
      raise exception 'Invalid analytics scope' using errcode = '22023';
    end if;
    select a.name into scope_name
    from public.accounts a
    where a.id = p_target_account_id;
  elsif p_scope_type = 'project' then
    select p.name into scope_name
    from public.projects p
    where p.id = p_scope_id and p.account_id = p_target_account_id and p.deleted_at is null;
  elsif p_scope_type = 'group' then
    select g.name into scope_name
    from public.groups g
    where g.id = p_scope_id and g.account_id = p_target_account_id and g.deleted_at is null;
  else
    select i.title into scope_name
    from public.ar_items i
    where i.id = p_scope_id and i.account_id = p_target_account_id and i.deleted_at is null;
  end if;

  if scope_name is null then
    raise exception 'Invalid analytics scope' using errcode = '22023';
  end if;

  with scoped_sessions as materialized (
    select s.*
    from public.ar_view_sessions s
    join public.ar_items i on i.id = s.ar_item_id and i.account_id = s.account_id
    where s.account_id = p_target_account_id
      and s.started_at >= p_from
      and s.started_at < p_to
      and case p_scope_type
        when 'account' then true
        when 'project' then i.project_id = p_scope_id
        when 'group' then i.group_id = p_scope_id
        when 'item' then i.id = p_scope_id
        else false
      end
  ),
  scoped_events as materialized (
    select e.*
    from public.ar_view_events e
    join scoped_sessions s on s.id = e.session_id
    where e.occurred_at >= p_from and e.occurred_at < p_to
  ),
  totals as (
    select
      (select count(*) from scoped_sessions) as unique_sessions,
      coalesce((select round(avg(s.duration_watched_seconds), 3) from scoped_sessions s), 0) as average_watch_seconds,
      (select count(*) from scoped_events e where e.event_type = 'page_open') as page_opens,
      (select count(*) from scoped_events e where e.event_type = 'camera_started') as camera_starts,
      (select count(*) from scoped_events e where e.event_type = 'marker_detected') as marker_detections,
      (select count(*) from scoped_events e where e.event_type = 'playback_started') as playback_starts,
      (select count(*) from scoped_events e where e.event_type = 'completed') as completions,
      (select count(*) from scoped_events e where e.event_type = 'error') as errors
  ),
  days as (
    select generate_series(
      date_trunc('day', p_from),
      date_trunc('day', p_to - interval '1 millisecond'),
      interval '1 day'
    ) as day
  ),
  daily_sessions as (
    select date_trunc('day', s.started_at) as day, count(*) as sessions
    from scoped_sessions s
    group by 1
  ),
  daily_events as (
    select
      date_trunc('day', e.occurred_at) as day,
      count(*) filter (where e.event_type = 'marker_detected') as detections,
      count(*) filter (where e.event_type = 'playback_started') as playbacks,
      count(*) filter (where e.event_type = 'completed') as completions,
      count(*) filter (where e.event_type = 'error') as errors
    from scoped_events e
    group by 1
  ),
  device_rows as (
    select coalesce(s.device_type, 'other') as name, count(*) as count
    from scoped_sessions s group by 1
  ),
  browser_rows as (
    select coalesce(s.browser_family, 'other') as name, count(*) as count
    from scoped_sessions s group by 1
  ),
  os_rows as (
    select coalesce(s.os_family, 'other') as name, count(*) as count
    from scoped_sessions s group by 1
  ),
  error_rows as (
    select coalesce(e.error_code, 'unknown') as code, count(*) as count
    from scoped_events e
    where e.event_type = 'error'
    group by 1
  )
  select jsonb_build_object(
    'scope', jsonb_build_object(
      'type', p_scope_type,
      'id', case when p_scope_type = 'account' then p_target_account_id else p_scope_id end,
      'name', scope_name
    ),
    'range', jsonb_build_object('from', p_from, 'to', p_to),
    'summary', jsonb_build_object(
      'uniqueSessions', t.unique_sessions,
      'pageOpens', t.page_opens,
      'cameraStarts', t.camera_starts,
      'markerDetections', t.marker_detections,
      'playbackStarts', t.playback_starts,
      'completions', t.completions,
      'errors', t.errors,
      'averageWatchSeconds', t.average_watch_seconds,
      'detectionRate', coalesce(round(100.0 * t.marker_detections / nullif(t.page_opens, 0), 1), 0),
      'playbackRate', coalesce(round(100.0 * t.playback_starts / nullif(t.marker_detections, 0), 1), 0),
      'completionRate', coalesce(round(100.0 * t.completions / nullif(t.playback_starts, 0), 1), 0)
    ),
    'series', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'date', to_char(d.day, 'YYYY-MM-DD'),
          'sessions', coalesce(ds.sessions, 0),
          'detections', coalesce(de.detections, 0),
          'playbacks', coalesce(de.playbacks, 0),
          'completions', coalesce(de.completions, 0),
          'errors', coalesce(de.errors, 0)
        ) order by d.day
      )
      from days d
      left join daily_sessions ds on ds.day = d.day
      left join daily_events de on de.day = d.day
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('name', d.name, 'count', d.count) order by d.count desc, d.name)
      from device_rows d
    ), '[]'::jsonb),
    'browsers', coalesce((
      select jsonb_agg(jsonb_build_object('name', b.name, 'count', b.count) order by b.count desc, b.name)
      from browser_rows b
    ), '[]'::jsonb),
    'operatingSystems', coalesce((
      select jsonb_agg(jsonb_build_object('name', o.name, 'count', o.count) order by o.count desc, o.name)
      from os_rows o
    ), '[]'::jsonb),
    'errors', coalesce((
      select jsonb_agg(jsonb_build_object('code', e.code, 'count', e.count) order by e.count desc, e.code)
      from error_rows e
    ), '[]'::jsonb)
  )
  into analytics_result
  from totals t;

  return analytics_result;
end;
$$;

create or replace function public.purge_analytics_before(
  p_cutoff timestamptz,
  p_batch_limit integer default 5000
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  if p_cutoff is null
    or p_cutoff > statement_timestamp() - interval '30 days'
    or p_batch_limit not between 1 and 10000
  then
    raise exception 'Invalid analytics retention request' using errcode = '22023';
  end if;

  delete from public.ar_view_sessions s
  where s.id in (
    select candidate.id
    from public.ar_view_sessions candidate
    where candidate.started_at < p_cutoff
    order by candidate.started_at, candidate.id
    limit p_batch_limit
    for update skip locked
  );
  get diagnostics deleted_count = row_count;

  delete from private.public_analytics_rate_limits bucket
  where bucket.updated_at < statement_timestamp() - interval '2 days';

  return deleted_count;
end;
$$;

revoke all on function public.consume_public_analytics_rate_limit(text, integer, integer)
from public, anon, authenticated;
revoke all on function public.record_public_ar_event(
  text, text, public.ar_event_type, numeric, text, text, text, text, text
) from public, anon, authenticated;
revoke all on function public.get_analytics_summary(uuid, text, uuid, timestamptz, timestamptz)
from public, anon;
revoke all on function public.purge_analytics_before(timestamptz, integer)
from public, anon, authenticated;

grant execute on function public.consume_public_analytics_rate_limit(text, integer, integer) to service_role;
grant execute on function public.record_public_ar_event(
  text, text, public.ar_event_type, numeric, text, text, text, text, text
) to service_role;
grant execute on function public.get_analytics_summary(uuid, text, uuid, timestamptz, timestamptz)
to authenticated;
grant execute on function public.purge_analytics_before(timestamptz, integer) to service_role;
