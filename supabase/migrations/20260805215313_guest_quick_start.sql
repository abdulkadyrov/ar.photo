-- Temporary guest quick-start: isolated anonymous workspaces without visible registration.

insert into public.subscription_plans (
  code,
  name,
  description,
  storage_limit_bytes,
  project_limit,
  group_limit,
  ar_item_limit,
  video_duration_limit_seconds,
  max_video_size_bytes,
  team_limit,
  is_active
)
values (
  'guest_test',
  'Guest test',
  'Short-lived isolated workspace for passwordless product testing',
  268435456,
  1,
  1,
  20,
  120,
  52428800,
  1,
  true
)
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    storage_limit_bytes = excluded.storage_limit_bytes,
    project_limit = excluded.project_limit,
    group_limit = excluded.group_limit,
    ar_item_limit = excluded.ar_item_limit,
    video_duration_limit_seconds = excluded.video_duration_limit_seconds,
    max_video_size_bytes = excluded.max_video_size_bytes,
    team_limit = excluded.team_limit,
    is_active = true;

create or replace function public.bootstrap_guest_account()
returns public.accounts
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  caller auth.users;
  guest_plan_id uuid;
  existing_account public.accounts;
  created_account public.accounts;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select u.* into caller
  from auth.users u
  where u.id = caller_id;

  if not found or not coalesce(caller.is_anonymous, false) then
    raise exception 'Anonymous test session required' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('guest-account:' || caller_id::text, 0)
  );

  select a.* into existing_account
  from public.accounts a
  where a.owner_user_id = caller_id
    and a.status <> 'closed'
  limit 1;
  if found then
    return existing_account;
  end if;

  select p.id into guest_plan_id
  from public.subscription_plans p
  where p.code = 'guest_test'
    and p.is_active;
  if guest_plan_id is null then
    raise exception 'Guest testing is unavailable' using errcode = '55000';
  end if;

  insert into public.accounts (name, slug, owner_user_id)
  values ('Тест AR Photo', 'guest-' || replace(caller_id::text, '-', ''), caller_id)
  returning * into created_account;

  update public.profiles
  set account_id = created_account.id,
      is_active = true,
      full_name = coalesce(full_name, 'Гость')
  where id = caller_id;

  insert into public.account_members (
    account_id,
    user_id,
    role,
    permissions,
    is_active,
    accepted_at
  ) values (
    created_account.id,
    caller_id,
    'owner',
    '{}'::jsonb,
    true,
    statement_timestamp()
  );

  insert into public.subscriptions (
    account_id,
    plan_id,
    status,
    starts_at,
    expires_at,
    grace_period_ends_at
  ) values (
    created_account.id,
    guest_plan_id,
    'trial',
    statement_timestamp(),
    statement_timestamp() + interval '3 days',
    statement_timestamp() + interval '4 days'
  );

  return created_account;
end;
$$;

create or replace function public.bootstrap_quick_start_workspace()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  caller auth.users;
  quick_account public.accounts;
  quick_project public.projects;
  quick_group public.groups;
  quick_project_key constant uuid := 'fe7f735d-dc37-4ba8-9df1-8c2a50d2c101';
  quick_group_key constant uuid := 'fe7f735d-dc37-4ba8-9df1-8c2a50d2c102';
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select u.* into caller
  from auth.users u
  where u.id = caller_id;
  if not found then
    raise exception 'User not found' using errcode = '42501';
  end if;

  if coalesce(caller.is_anonymous, false) then
    quick_account := public.bootstrap_guest_account();
  else
    quick_account := public.bootstrap_self_service_account();
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('quick-start:' || quick_account.id::text, 0)
  );

  select p.* into quick_project
  from public.projects p
  where p.account_id = quick_account.id
    and p.idempotency_key = quick_project_key
    and p.deleted_at is null
  limit 1;

  if not found then
    select p.* into quick_project
    from public.create_project(
      quick_account.id,
      'Быстрый старт',
      'Автоматически создано для простого тестирования AR Photo',
      'other'::public.project_category,
      quick_project_key
    ) p;
  end if;

  select g.* into quick_group
  from public.groups g
  where g.account_id = quick_account.id
    and g.project_id = quick_project.id
    and g.idempotency_key = quick_group_key
    and g.deleted_at is null
  limit 1;

  if not found then
    select g.* into quick_group
    from public.create_group(
      quick_account.id,
      quick_project.id,
      'Оживлённые фото',
      'Автоматически создано для простого тестирования AR Photo',
      quick_group_key
    ) g;
  end if;

  return jsonb_build_object(
    'accountId', quick_account.id,
    'projectId', quick_project.id,
    'groupId', quick_group.id
  );
end;
$$;

revoke all on function public.bootstrap_guest_account() from public, anon, authenticated;
revoke all on function public.bootstrap_quick_start_workspace() from public, anon, authenticated;
grant execute on function public.bootstrap_guest_account() to authenticated;
grant execute on function public.bootstrap_quick_start_workspace() to authenticated;
