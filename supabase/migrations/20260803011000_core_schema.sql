create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  storage_limit_bytes bigint,
  project_limit integer,
  group_limit integer,
  ar_item_limit integer,
  video_duration_limit_seconds integer,
  max_video_size_bytes bigint,
  team_limit integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscription_plans_code_format check (code ~ '^[a-z][a-z0-9_]{1,31}$'),
  constraint subscription_plans_name_length check (char_length(name) between 1 and 80),
  constraint subscription_plans_storage_limit check (storage_limit_bytes is null or storage_limit_bytes >= 0),
  constraint subscription_plans_project_limit check (project_limit is null or project_limit >= 0),
  constraint subscription_plans_group_limit check (group_limit is null or group_limit >= 0),
  constraint subscription_plans_ar_item_limit check (ar_item_limit is null or ar_item_limit >= 0),
  constraint subscription_plans_video_duration check (
    video_duration_limit_seconds is null or video_duration_limit_seconds > 0
  ),
  constraint subscription_plans_video_size check (max_video_size_bytes is null or max_video_size_bytes > 0),
  constraint subscription_plans_team_limit check (team_limit is null or team_limit >= 1)
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  logo_path text,
  status public.account_status not null default 'active',
  timezone text not null default 'Europe/Moscow',
  storage_used_bytes bigint not null default 0,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint accounts_name_length check (char_length(name) between 1 and 120),
  constraint accounts_slug_format check (slug = lower(slug) and slug ~ '^[a-z0-9][a-z0-9-]{2,62}$'),
  constraint accounts_storage_nonnegative check (storage_used_bytes >= 0),
  constraint accounts_settings_object check (jsonb_typeof(settings) = 'object'),
  constraint accounts_closed_at_consistency check ((status = 'closed') = (closed_at is not null))
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email_display text,
  avatar_path text,
  account_id uuid references public.accounts(id) on delete set null,
  role public.profile_role not null default 'account_user',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  constraint profiles_full_name_length check (full_name is null or char_length(full_name) between 1 and 120)
);

create table public.account_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null,
  permissions jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_members_account_user_unique unique (account_id, user_id),
  constraint account_members_permissions_object check (jsonb_typeof(permissions) = 'object'),
  constraint account_members_acceptance check (not is_active or accepted_at is not null)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  status public.subscription_status not null default 'trial',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  grace_period_ends_at timestamptz,
  custom_limits jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_custom_limits_object check (jsonb_typeof(custom_limits) = 'object'),
  constraint subscriptions_period_order check (expires_at is null or expires_at > starts_at),
  constraint subscriptions_grace_order check (
    grace_period_ends_at is null or expires_at is null or grace_period_ends_at >= expires_at
  )
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  description text,
  category public.project_category not null default 'other',
  cover_path text,
  status public.project_status not null default 'draft',
  sort_order integer not null default 0,
  idempotency_key uuid not null default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz,
  constraint projects_id_account_unique unique (id, account_id),
  constraint projects_idempotency_unique unique (account_id, idempotency_key),
  constraint projects_name_length check (char_length(name) between 1 and 160),
  constraint projects_description_length check (description is null or char_length(description) <= 2000),
  constraint projects_archive_consistency check ((status = 'archived') = (archived_at is not null))
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  project_id uuid not null,
  name text not null,
  description text,
  cover_path text,
  sort_order integer not null default 0,
  idempotency_key uuid not null default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz,
  constraint groups_id_account_unique unique (id, account_id),
  constraint groups_id_project_account_unique unique (id, project_id, account_id),
  constraint groups_idempotency_unique unique (project_id, idempotency_key),
  constraint groups_project_account_fkey foreign key (project_id, account_id)
    references public.projects(id, account_id) on delete cascade,
  constraint groups_name_length check (char_length(name) between 1 and 160),
  constraint groups_description_length check (description is null or char_length(description) <= 2000)
);

create table public.ar_items (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  project_id uuid not null,
  group_id uuid not null,
  title text not null,
  description text,
  public_slug text not null default private.new_public_slug() unique,
  status public.ar_item_status not null default 'draft',
  marker_image_path text,
  marker_preview_path text,
  video_path text,
  video_thumbnail_path text,
  video_duration_seconds numeric(10, 3),
  marker_width integer,
  marker_height integer,
  tracking_dataset_path text,
  tracking_status public.tracking_status,
  visibility public.content_visibility not null default 'private',
  autoplay boolean not null default true,
  loop_video boolean not null default true,
  marker_lost_behavior public.marker_lost_behavior not null default 'pause_hide',
  audio_default text not null default 'muted',
  fallback_enabled boolean not null default true,
  version integer not null default 1,
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint ar_items_id_account_unique unique (id, account_id),
  constraint ar_items_group_project_account_fkey foreign key (group_id, project_id, account_id)
    references public.groups(id, project_id, account_id) on delete cascade,
  constraint ar_items_title_length check (char_length(title) between 1 and 160),
  constraint ar_items_description_length check (description is null or char_length(description) <= 4000),
  constraint ar_items_public_slug_format check (public_slug ~ '^[a-f0-9]{36}$'),
  constraint ar_items_video_duration check (video_duration_seconds is null or video_duration_seconds > 0),
  constraint ar_items_marker_dimensions check (
    (marker_width is null and marker_height is null)
    or (marker_width > 0 and marker_height > 0)
  ),
  constraint ar_items_audio_default check (audio_default in ('muted', 'user_enabled')),
  constraint ar_items_version_positive check (version > 0),
  constraint ar_items_publication_consistency check (
    (status = 'published' and visibility = 'public' and published_at is not null)
    or status <> 'published'
  )
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  ar_item_id uuid,
  kind text not null,
  storage_bucket text not null,
  storage_path text not null,
  original_file_name text,
  mime_type text not null,
  size_bytes bigint not null,
  sha256 text,
  version integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint media_assets_item_account_fkey foreign key (ar_item_id, account_id)
    references public.ar_items(id, account_id) on delete cascade,
  constraint media_assets_storage_unique unique (storage_bucket, storage_path),
  constraint media_assets_kind check (kind in ('marker', 'video', 'poster', 'tracking', 'cover', 'avatar', 'qr')),
  constraint media_assets_size_positive check (size_bytes > 0),
  constraint media_assets_sha256_format check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  constraint media_assets_version_positive check (version > 0),
  constraint media_assets_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table public.processing_jobs (
  id bigint generated always as identity primary key,
  account_id uuid not null,
  ar_item_id uuid not null,
  type public.job_type not null,
  status public.job_status not null default 'queued',
  progress smallint not null default 0,
  attempt_count smallint not null default 0,
  max_attempts smallint not null default 3,
  dedupe_key text not null,
  error_code text,
  error_message text,
  input_metadata jsonb not null default '{}'::jsonb,
  output_metadata jsonb not null default '{}'::jsonb,
  locked_at timestamptz,
  locked_by text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint processing_jobs_item_account_fkey foreign key (ar_item_id, account_id)
    references public.ar_items(id, account_id) on delete cascade,
  constraint processing_jobs_dedupe_unique unique (account_id, dedupe_key),
  constraint processing_jobs_progress_range check (progress between 0 and 100),
  constraint processing_jobs_attempts check (attempt_count >= 0 and max_attempts between 1 and 20),
  constraint processing_jobs_metadata_objects check (
    jsonb_typeof(input_metadata) = 'object' and jsonb_typeof(output_metadata) = 'object'
  )
);

create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  ar_item_id uuid not null unique,
  public_url text not null,
  svg_path text,
  png_path text,
  style jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint qr_codes_item_account_fkey foreign key (ar_item_id, account_id)
    references public.ar_items(id, account_id) on delete cascade,
  constraint qr_codes_public_url_https check (public_url ~ '^https://'),
  constraint qr_codes_style_object check (jsonb_typeof(style) = 'object'),
  constraint qr_codes_version_positive check (version > 0)
);

create table public.ar_view_sessions (
  id bigint generated always as identity primary key,
  ar_item_id uuid not null,
  account_id uuid not null,
  session_token_hash text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  marker_detected_at timestamptz,
  playback_started_at timestamptz,
  completed boolean not null default false,
  duration_watched_seconds numeric(12, 3) not null default 0,
  device_type text,
  browser_family text,
  os_family text,
  country_code text,
  referrer_domain text,
  error_code text,
  constraint ar_view_sessions_item_account_fkey foreign key (ar_item_id, account_id)
    references public.ar_items(id, account_id) on delete cascade,
  constraint ar_view_sessions_hash_length check (char_length(session_token_hash) between 32 and 128),
  constraint ar_view_sessions_duration_nonnegative check (duration_watched_seconds >= 0),
  constraint ar_view_sessions_country_code check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint ar_view_sessions_time_order check (ended_at is null or ended_at >= started_at)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  account_id uuid not null references public.accounts(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_length check (char_length(action) between 3 and 100),
  constraint audit_logs_entity_type_length check (char_length(entity_type) between 1 and 80),
  constraint audit_logs_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create unique index accounts_owner_active_idx on public.accounts(owner_user_id) where status <> 'closed';
create index accounts_owner_user_id_idx on public.accounts(owner_user_id);
create index profiles_account_id_idx on public.profiles(account_id) where account_id is not null;
create index account_members_user_id_idx on public.account_members(user_id);
create index account_members_invited_by_idx on public.account_members(invited_by) where invited_by is not null;
create index account_members_user_active_idx on public.account_members(user_id, account_id) where is_active;
create index account_members_account_role_idx on public.account_members(account_id, role) where is_active;
create index subscriptions_plan_id_idx on public.subscriptions(plan_id);
create index subscriptions_status_expiry_idx on public.subscriptions(status, expires_at);
create index projects_account_active_idx on public.projects(account_id, created_at desc, id) where deleted_at is null;
create index projects_account_id_idx on public.projects(account_id);
create index projects_created_by_idx on public.projects(created_by);
create index groups_project_active_idx on public.groups(project_id, sort_order, id) where deleted_at is null;
create index groups_project_account_idx on public.groups(project_id, account_id);
create index groups_account_id_idx on public.groups(account_id);
create index groups_created_by_idx on public.groups(created_by);
create index ar_items_group_active_idx on public.ar_items(group_id, created_at desc, id) where deleted_at is null;
create index ar_items_group_project_account_idx on public.ar_items(group_id, project_id, account_id);
create index ar_items_project_status_idx on public.ar_items(project_id, status, created_at desc) where deleted_at is null;
create index ar_items_account_status_idx on public.ar_items(account_id, status, created_at desc) where deleted_at is null;
create index ar_items_created_by_idx on public.ar_items(created_by);
create index media_assets_account_active_idx on public.media_assets(account_id, created_at desc) where deleted_at is null;
create index media_assets_account_id_idx on public.media_assets(account_id);
create index media_assets_project_id_idx on public.media_assets(project_id) where project_id is not null;
create index media_assets_ar_item_id_idx on public.media_assets(ar_item_id) where ar_item_id is not null;
create index media_assets_item_account_idx on public.media_assets(ar_item_id, account_id) where ar_item_id is not null;
create index media_assets_created_by_idx on public.media_assets(created_by);
create index processing_jobs_item_status_idx on public.processing_jobs(ar_item_id, status, created_at);
create index processing_jobs_item_account_idx on public.processing_jobs(ar_item_id, account_id);
create index processing_jobs_queue_idx on public.processing_jobs(status, created_at) where status = 'queued';
create index qr_codes_account_id_idx on public.qr_codes(account_id);
create index qr_codes_item_account_idx on public.qr_codes(ar_item_id, account_id);
create index ar_view_sessions_item_started_idx on public.ar_view_sessions(ar_item_id, started_at desc, id);
create index ar_view_sessions_item_account_idx on public.ar_view_sessions(ar_item_id, account_id);
create index ar_view_sessions_account_started_idx on public.ar_view_sessions(account_id, started_at desc, id);
create index audit_logs_account_created_idx on public.audit_logs(account_id, created_at desc, id);
create index audit_logs_actor_user_idx on public.audit_logs(actor_user_id) where actor_user_id is not null;

create trigger subscription_plans_set_updated_at before update on public.subscription_plans
for each row execute function private.set_updated_at();
create trigger accounts_set_updated_at before update on public.accounts
for each row execute function private.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger account_members_set_updated_at before update on public.account_members
for each row execute function private.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions
for each row execute function private.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function private.set_updated_at();
create trigger groups_set_updated_at before update on public.groups
for each row execute function private.set_updated_at();
create trigger ar_items_set_updated_at before update on public.ar_items
for each row execute function private.set_updated_at();
create trigger processing_jobs_set_updated_at before update on public.processing_jobs
for each row execute function private.set_updated_at();
create trigger qr_codes_set_updated_at before update on public.qr_codes
for each row execute function private.set_updated_at();
