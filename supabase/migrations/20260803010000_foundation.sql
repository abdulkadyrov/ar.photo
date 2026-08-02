create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.account_status as enum ('active', 'suspended', 'closed');
create type public.member_role as enum ('owner', 'manager', 'editor', 'viewer');
create type public.profile_role as enum ('superadmin', 'account_user');
create type public.subscription_status as enum (
  'trial',
  'active',
  'grace_period',
  'expired',
  'suspended',
  'cancelled'
);
create type public.project_status as enum ('draft', 'active', 'archived');
create type public.project_category as enum (
  'graduation',
  'wedding',
  'family',
  'birthday',
  'travel',
  'advertising',
  'museum',
  'other'
);
create type public.ar_item_status as enum (
  'draft',
  'processing',
  'ready',
  'published',
  'failed',
  'suspended',
  'archived'
);
create type public.tracking_status as enum (
  'uploaded',
  'analyzing',
  'unsuitable',
  'compiling',
  'ready',
  'failed'
);
create type public.content_visibility as enum ('private', 'public');
create type public.marker_lost_behavior as enum ('pause_hide', 'continue_audio_hide', 'stop_reset');
create type public.job_type as enum (
  'marker_analysis',
  'marker_compilation',
  'video_inspection',
  'video_transcode',
  'thumbnail_generation',
  'qr_generation',
  'storage_cleanup'
);
create type public.job_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled');
create type public.ar_event_type as enum (
  'page_open',
  'camera_started',
  'marker_detected',
  'playback_started',
  'progress_25',
  'progress_50',
  'progress_75',
  'completed',
  'error'
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create or replace function private.new_public_slug()
returns text
language sql
volatile
set search_path = ''
as $$
  select encode(extensions.gen_random_bytes(18), 'hex');
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated;
revoke execute on function private.new_public_slug() from public, anon, authenticated;
