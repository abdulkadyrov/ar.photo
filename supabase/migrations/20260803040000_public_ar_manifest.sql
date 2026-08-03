-- Stage 6: service-only public manifest source and durable privacy-preserving rate buckets.
create table private.public_manifest_rate_limits (
  bucket_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null,
  updated_at timestamptz not null default now(),
  constraint public_manifest_rate_limits_key_format check (
    bucket_key ~ '^(ip|slug):[a-f0-9]{64}$'
  ),
  constraint public_manifest_rate_limits_count_positive check (request_count > 0)
);

revoke all on table private.public_manifest_rate_limits from public, anon, authenticated;

create or replace function public.consume_public_manifest_rate_limit(
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
  if p_bucket_key !~ '^(ip|slug):[a-f0-9]{64}$'
    or p_max_requests not between 1 and 10000
    or p_window_seconds not between 1 and 86400
  then
    raise exception 'Invalid public manifest rate limit bucket' using errcode = '22023';
  end if;

  request_window := pg_catalog.make_interval(secs => p_window_seconds);
  insert into private.public_manifest_rate_limits (
    bucket_key,
    window_started_at,
    request_count,
    updated_at
  )
  values (p_bucket_key, statement_timestamp(), 1, statement_timestamp())
  on conflict (bucket_key) do update
  set window_started_at = case
        when private.public_manifest_rate_limits.window_started_at
          <= statement_timestamp() - request_window
        then statement_timestamp()
        else private.public_manifest_rate_limits.window_started_at
      end,
      request_count = case
        when private.public_manifest_rate_limits.window_started_at
          <= statement_timestamp() - request_window
        then 1
        else private.public_manifest_rate_limits.request_count + 1
      end,
      updated_at = statement_timestamp()
  returning request_count into next_count;

  return next_count <= p_max_requests;
end;
$$;

create or replace function public.get_public_ar_manifest_source(p_public_slug text)
returns table (
  title text,
  marker_width integer,
  marker_height integer,
  autoplay boolean,
  loop_video boolean,
  marker_lost_behavior public.marker_lost_behavior,
  audio_default text,
  fallback_enabled boolean,
  tracking_bucket text,
  tracking_path text,
  video_bucket text,
  video_path text,
  poster_bucket text,
  poster_path text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    i.title,
    i.marker_width,
    i.marker_height,
    i.autoplay,
    i.loop_video,
    i.marker_lost_behavior,
    i.audio_default,
    i.fallback_enabled,
    'generated-private'::text as tracking_bucket,
    i.tracking_dataset_path as tracking_path,
    video.storage_bucket as video_bucket,
    video.storage_path as video_path,
    'generated-private'::text as poster_bucket,
    i.video_thumbnail_path as poster_path
  from public.ar_items i
  join public.accounts a on a.id = i.account_id
  join public.subscriptions s on s.account_id = i.account_id
  join public.media_assets video
    on video.id = i.video_asset_id
   and video.account_id = i.account_id
   and video.kind = 'video'
   and video.deleted_at is null
  where p_public_slug ~ '^[a-f0-9]{36}$'
    and i.public_slug = p_public_slug
    and i.status = 'published'
    and i.visibility = 'public'
    and i.published_at is not null
    and i.deleted_at is null
    and (i.expires_at is null or i.expires_at > statement_timestamp())
    and i.tracking_status = 'ready'
    and i.tracking_dataset_path is not null
    and i.video_thumbnail_path is not null
    and i.marker_width > 0
    and i.marker_height > 0
    and a.status = 'active'
    and (
      (
        s.status in ('trial', 'active')
        and (s.expires_at is null or s.expires_at > statement_timestamp())
      )
      or (
        s.status = 'grace_period'
        and s.grace_period_ends_at > statement_timestamp()
      )
    )
  limit 1;
$$;

revoke all on function public.consume_public_manifest_rate_limit(text, integer, integer)
from public, anon, authenticated;
revoke all on function public.get_public_ar_manifest_source(text)
from public, anon, authenticated;

grant execute on function public.consume_public_manifest_rate_limit(text, integer, integer) to service_role;
grant execute on function public.get_public_ar_manifest_source(text) to service_role;
