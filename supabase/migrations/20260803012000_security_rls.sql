create or replace function private.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'superadmin'
      and p.is_active
  );
$$;

create or replace function private.has_account_access(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_superadmin())
    or exists (
      select 1
      from public.account_members m
      join public.profiles p on p.id = m.user_id
      where m.account_id = target_account_id
        and m.user_id = (select auth.uid())
        and m.is_active
        and m.accepted_at is not null
        and p.is_active
    );
$$;

create or replace function private.has_account_role(
  target_account_id uuid,
  allowed_roles public.member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_superadmin())
    or exists (
      select 1
      from public.account_members m
      join public.profiles p on p.id = m.user_id
      where m.account_id = target_account_id
        and m.user_id = (select auth.uid())
        and m.role = any(allowed_roles)
        and m.is_active
        and m.accepted_at is not null
        and p.is_active
    );
$$;

create or replace function private.shares_account(other_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_superadmin())
    or exists (
      select 1
      from public.account_members mine
      join public.account_members theirs on theirs.account_id = mine.account_id
      where mine.user_id = (select auth.uid())
        and theirs.user_id = other_user_id
        and mine.is_active
        and theirs.is_active
        and mine.accepted_at is not null
        and theirs.accepted_at is not null
    );
$$;

create or replace function private.subscription_allows_write(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.accounts a
    join public.subscriptions s on s.account_id = a.id
    where a.id = target_account_id
      and a.status = 'active'
      and (
        (s.status in ('trial', 'active') and (s.expires_at is null or s.expires_at > statement_timestamp()))
        or (s.status = 'grace_period' and s.grace_period_ends_at > statement_timestamp())
      )
  );
$$;

create or replace function private.can_write_account(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.has_account_role(
      target_account_id,
      array['owner'::public.member_role, 'manager'::public.member_role, 'editor'::public.member_role]
    ))
    and (select private.subscription_allows_write(target_account_id));
$$;

create or replace function private.effective_limit(target_account_id uuid, limit_name text)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    case
      when s.custom_limits ? limit_name
        and jsonb_typeof(s.custom_limits -> limit_name) = 'number'
      then greatest(0, (s.custom_limits ->> limit_name)::bigint)
    end,
    case limit_name
      when 'storage_limit_bytes' then p.storage_limit_bytes
      when 'project_limit' then p.project_limit::bigint
      when 'group_limit' then p.group_limit::bigint
      when 'ar_item_limit' then p.ar_item_limit::bigint
      when 'video_duration_limit_seconds' then p.video_duration_limit_seconds::bigint
      when 'max_video_size_bytes' then p.max_video_size_bytes
      when 'team_limit' then p.team_limit::bigint
    end
  )
  from public.subscriptions s
  join public.subscription_plans p on p.id = s.plan_id
  where s.account_id = target_account_id;
$$;

create or replace function private.storage_account_id(object_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
declare
  segments text[];
begin
  segments := string_to_array(object_name, '/');
  if array_length(segments, 1) < 3 or segments[1] <> 'accounts' then
    return null;
  end if;
  return segments[2]::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

create or replace function private.has_storage_access(object_name text, require_write boolean)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when (select private.storage_account_id(object_name)) is null then false
    when require_write then (select private.can_write_account(private.storage_account_id(object_name)))
    else (select private.has_account_access(private.storage_account_id(object_name)))
  end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email_display)
  values (
    new.id,
    nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120), ''),
    new.email
  )
  on conflict (id) do update
  set email_display = excluded.email_display,
      updated_at = statement_timestamp();
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb;
  previous_data jsonb;
  target_account_id uuid;
  target_entity_id uuid;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  previous_data := case when tg_op = 'UPDATE' then to_jsonb(old) else null end;
  target_account_id := case
    when tg_table_name = 'accounts' then (row_data ->> 'id')::uuid
    else (row_data ->> 'account_id')::uuid
  end;
  target_entity_id := nullif(row_data ->> 'id', '')::uuid;

  insert into public.audit_logs (account_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (
    target_account_id,
    (select auth.uid()),
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    target_entity_id,
    jsonb_strip_nulls(jsonb_build_object('before', previous_data, 'after', case when tg_op = 'DELETE' then null else row_data end))
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger accounts_audit after insert or update or delete on public.accounts
for each row execute function private.write_audit_log();
create trigger account_members_audit after insert or update or delete on public.account_members
for each row execute function private.write_audit_log();
create trigger subscriptions_audit after insert or update or delete on public.subscriptions
for each row execute function private.write_audit_log();
create trigger projects_audit after insert or update or delete on public.projects
for each row execute function private.write_audit_log();
create trigger groups_audit after insert or update or delete on public.groups
for each row execute function private.write_audit_log();
create trigger ar_items_audit after insert or update or delete on public.ar_items
for each row execute function private.write_audit_log();

revoke execute on function private.is_superadmin() from public, anon;
revoke execute on function private.has_account_access(uuid) from public, anon;
revoke execute on function private.has_account_role(uuid, public.member_role[]) from public, anon;
revoke execute on function private.shares_account(uuid) from public, anon;
revoke execute on function private.subscription_allows_write(uuid) from public, anon;
revoke execute on function private.can_write_account(uuid) from public, anon;
revoke execute on function private.effective_limit(uuid, text) from public, anon;
revoke execute on function private.storage_account_id(text) from public, anon;
revoke execute on function private.has_storage_access(text, boolean) from public, anon;
revoke execute on function private.handle_new_user() from public, anon, authenticated;
revoke execute on function private.write_audit_log() from public, anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_superadmin() to authenticated;
grant execute on function private.has_account_access(uuid) to authenticated;
grant execute on function private.has_account_role(uuid, public.member_role[]) to authenticated;
grant execute on function private.shares_account(uuid) to authenticated;
grant execute on function private.subscription_allows_write(uuid) to authenticated;
grant execute on function private.can_write_account(uuid) to authenticated;
grant execute on function private.effective_limit(uuid, text) to authenticated;
grant execute on function private.storage_account_id(text) to authenticated;
grant execute on function private.has_storage_access(text, boolean) to authenticated;

alter table public.subscription_plans enable row level security;
alter table public.subscription_plans force row level security;
alter table public.accounts enable row level security;
alter table public.accounts force row level security;
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.account_members enable row level security;
alter table public.account_members force row level security;
alter table public.subscriptions enable row level security;
alter table public.subscriptions force row level security;
alter table public.projects enable row level security;
alter table public.projects force row level security;
alter table public.groups enable row level security;
alter table public.groups force row level security;
alter table public.ar_items enable row level security;
alter table public.ar_items force row level security;
alter table public.media_assets enable row level security;
alter table public.media_assets force row level security;
alter table public.processing_jobs enable row level security;
alter table public.processing_jobs force row level security;
alter table public.qr_codes enable row level security;
alter table public.qr_codes force row level security;
alter table public.ar_view_sessions enable row level security;
alter table public.ar_view_sessions force row level security;
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;

create policy subscription_plans_read on public.subscription_plans
for select to authenticated
using (is_active or (select private.is_superadmin()));

create policy accounts_read on public.accounts
for select to authenticated
using ((select private.has_account_access(id)));
create policy accounts_update on public.accounts
for update to authenticated
using ((select private.has_account_role(id, array['owner'::public.member_role, 'manager'::public.member_role]))
  and (select private.subscription_allows_write(id)))
with check ((select private.has_account_role(id, array['owner'::public.member_role, 'manager'::public.member_role]))
  and (select private.subscription_allows_write(id)));

create policy profiles_read on public.profiles
for select to authenticated
using (id = (select auth.uid()) or (select private.shares_account(id)));
create policy profiles_update_self on public.profiles
for update to authenticated
using (id = (select auth.uid()) and is_active)
with check (id = (select auth.uid()) and is_active);

create policy account_members_read on public.account_members
for select to authenticated
using ((select private.has_account_access(account_id)));

create policy subscriptions_read on public.subscriptions
for select to authenticated
using ((select private.has_account_access(account_id)));

create policy projects_read on public.projects
for select to authenticated
using ((select private.has_account_access(account_id)));
create policy projects_update on public.projects
for update to authenticated
using ((select private.can_write_account(account_id)))
with check ((select private.can_write_account(account_id)));

create policy groups_read on public.groups
for select to authenticated
using ((select private.has_account_access(account_id)));
create policy groups_update on public.groups
for update to authenticated
using ((select private.can_write_account(account_id)))
with check ((select private.can_write_account(account_id)));

create policy ar_items_read on public.ar_items
for select to authenticated
using ((select private.has_account_access(account_id)));
create policy ar_items_update on public.ar_items
for update to authenticated
using ((select private.can_write_account(account_id)))
with check ((select private.can_write_account(account_id)));

create policy media_assets_read on public.media_assets
for select to authenticated
using ((select private.has_account_access(account_id)));

create policy processing_jobs_read on public.processing_jobs
for select to authenticated
using ((select private.has_account_access(account_id)));

create policy qr_codes_read on public.qr_codes
for select to authenticated
using ((select private.has_account_access(account_id)));

create policy ar_view_sessions_read on public.ar_view_sessions
for select to authenticated
using ((select private.has_account_access(account_id)));

create policy audit_logs_read on public.audit_logs
for select to authenticated
using ((select private.has_account_role(
  account_id,
  array['owner'::public.member_role, 'manager'::public.member_role]
)));

revoke all on table public.subscription_plans from anon, authenticated;
revoke all on table public.accounts from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.account_members from anon, authenticated;
revoke all on table public.subscriptions from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.groups from anon, authenticated;
revoke all on table public.ar_items from anon, authenticated;
revoke all on table public.media_assets from anon, authenticated;
revoke all on table public.processing_jobs from anon, authenticated;
revoke all on table public.qr_codes from anon, authenticated;
revoke all on table public.ar_view_sessions from anon, authenticated;
revoke all on table public.audit_logs from anon, authenticated;

grant select on table public.subscription_plans to authenticated;
grant select on table public.accounts to authenticated;
grant update (name, slug, logo_path, timezone, settings) on table public.accounts to authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, avatar_path) on table public.profiles to authenticated;
grant select on table public.account_members to authenticated;
grant select on table public.subscriptions to authenticated;
grant select on table public.projects to authenticated;
grant update (name, description, category, cover_path, status, sort_order, archived_at, deleted_at)
  on table public.projects to authenticated;
grant select on table public.groups to authenticated;
grant update (name, description, cover_path, sort_order, archived_at, deleted_at)
  on table public.groups to authenticated;
grant select on table public.ar_items to authenticated;
grant update (
  title,
  description,
  status,
  marker_image_path,
  marker_preview_path,
  video_path,
  video_thumbnail_path,
  video_duration_seconds,
  marker_width,
  marker_height,
  tracking_dataset_path,
  tracking_status,
  visibility,
  autoplay,
  loop_video,
  marker_lost_behavior,
  audio_default,
  fallback_enabled,
  version,
  published_at,
  expires_at,
  deleted_at
) on table public.ar_items to authenticated;
grant select on table public.media_assets to authenticated;
grant select on table public.processing_jobs to authenticated;
grant select on table public.qr_codes to authenticated;
grant select on table public.ar_view_sessions to authenticated;
grant select on table public.audit_logs to authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
