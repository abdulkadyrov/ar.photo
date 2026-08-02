create or replace function public.admin_create_account(
  p_owner_user_id uuid,
  p_account_name text,
  p_account_slug text,
  p_subscription_plan_id uuid,
  p_subscription_status public.subscription_status,
  p_subscription_starts_at timestamptz,
  p_subscription_expires_at timestamptz,
  p_subscription_grace_ends_at timestamptz,
  p_custom_limits jsonb default '{}'::jsonb
)
returns public.accounts
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_account public.accounts;
  created_account public.accounts;
begin
  if (select auth.uid()) is null or not (select private.is_superadmin()) then
    raise exception 'Superadmin access required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_custom_limits) <> 'object' then
    raise exception 'custom_limits must be an object' using errcode = '22023';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_owner_user_id) then
    raise exception 'Owner user does not exist' using errcode = '23503';
  end if;
  if not exists (select 1 from public.subscription_plans p where p.id = p_subscription_plan_id and p.is_active) then
    raise exception 'Subscription plan is not active' using errcode = '23503';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('account-owner:' || p_owner_user_id::text, 0));

  select a.* into existing_account
  from public.accounts a
  where a.owner_user_id = p_owner_user_id and a.status <> 'closed'
  limit 1;
  if found then
    return existing_account;
  end if;

  insert into public.accounts (name, slug, owner_user_id)
  values (trim(p_account_name), lower(trim(p_account_slug)), p_owner_user_id)
  returning * into created_account;

  update public.profiles
  set account_id = created_account.id,
      is_active = true
  where id = p_owner_user_id;

  insert into public.account_members (account_id, user_id, role, is_active, invited_by, accepted_at)
  values (created_account.id, p_owner_user_id, 'owner', true, (select auth.uid()), statement_timestamp());

  insert into public.subscriptions (
    account_id,
    plan_id,
    status,
    starts_at,
    expires_at,
    grace_period_ends_at,
    custom_limits
  ) values (
    created_account.id,
    p_subscription_plan_id,
    p_subscription_status,
    p_subscription_starts_at,
    p_subscription_expires_at,
    p_subscription_grace_ends_at,
    p_custom_limits
  );

  return created_account;
end;
$$;

create or replace function public.create_project(
  target_account_id uuid,
  project_name text,
  project_description text,
  project_category public.project_category,
  request_id uuid
)
returns public.projects
language plpgsql
security definer
set search_path = ''
as $$
declare
  project_limit bigint;
  existing_project public.projects;
  created_project public.projects;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('project-quota:' || target_account_id::text, 0));

  select p.* into existing_project
  from public.projects p
  where p.account_id = target_account_id and p.idempotency_key = request_id;
  if found then
    return existing_project;
  end if;

  project_limit := private.effective_limit(target_account_id, 'project_limit');
  if project_limit is not null and (
    select count(*) from public.projects p
    where p.account_id = target_account_id and p.deleted_at is null
  ) >= project_limit then
    raise exception 'Project limit reached' using errcode = '23514';
  end if;

  insert into public.projects (
    account_id,
    name,
    description,
    category,
    idempotency_key,
    created_by
  ) values (
    target_account_id,
    trim(project_name),
    nullif(trim(project_description), ''),
    project_category,
    request_id,
    (select auth.uid())
  )
  returning * into created_project;

  return created_project;
end;
$$;

create or replace function public.create_group(
  target_account_id uuid,
  target_project_id uuid,
  group_name text,
  group_description text,
  request_id uuid
)
returns public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  group_limit bigint;
  existing_group public.groups;
  created_group public.groups;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.projects p
    where p.id = target_project_id
      and p.account_id = target_account_id
      and p.deleted_at is null
      and p.status <> 'archived'
  ) then
    raise exception 'Active project not found' using errcode = '23503';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('group-quota:' || target_account_id::text, 0));

  select g.* into existing_group
  from public.groups g
  where g.project_id = target_project_id and g.idempotency_key = request_id;
  if found then
    return existing_group;
  end if;

  group_limit := private.effective_limit(target_account_id, 'group_limit');
  if group_limit is not null and (
    select count(*) from public.groups g
    where g.account_id = target_account_id and g.deleted_at is null
  ) >= group_limit then
    raise exception 'Group limit reached' using errcode = '23514';
  end if;

  insert into public.groups (
    account_id,
    project_id,
    name,
    description,
    idempotency_key,
    created_by
  ) values (
    target_account_id,
    target_project_id,
    trim(group_name),
    nullif(trim(group_description), ''),
    request_id,
    (select auth.uid())
  )
  returning * into created_group;

  return created_group;
end;
$$;

create or replace function public.create_ar_item(
  target_account_id uuid,
  target_project_id uuid,
  target_group_id uuid,
  item_title text,
  item_description text
)
returns public.ar_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  item_limit bigint;
  created_item public.ar_items;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.groups g
    where g.id = target_group_id
      and g.project_id = target_project_id
      and g.account_id = target_account_id
      and g.deleted_at is null
  ) then
    raise exception 'Active group not found' using errcode = '23503';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('ar-item-quota:' || target_account_id::text, 0));
  item_limit := private.effective_limit(target_account_id, 'ar_item_limit');
  if item_limit is not null and (
    select count(*) from public.ar_items i
    where i.account_id = target_account_id and i.deleted_at is null
  ) >= item_limit then
    raise exception 'AR item limit reached' using errcode = '23514';
  end if;

  insert into public.ar_items (
    account_id,
    project_id,
    group_id,
    title,
    description,
    created_by
  ) values (
    target_account_id,
    target_project_id,
    target_group_id,
    trim(item_title),
    nullif(trim(item_description), ''),
    (select auth.uid())
  )
  returning * into created_item;

  return created_item;
end;
$$;

revoke all on function public.admin_create_account(
  uuid,
  text,
  text,
  uuid,
  public.subscription_status,
  timestamptz,
  timestamptz,
  timestamptz,
  jsonb
) from public, anon, authenticated;
revoke all on function public.create_project(
  uuid,
  text,
  text,
  public.project_category,
  uuid
) from public, anon, authenticated;
revoke all on function public.create_group(uuid, uuid, text, text, uuid) from public, anon, authenticated;
revoke all on function public.create_ar_item(uuid, uuid, uuid, text, text) from public, anon, authenticated;

grant execute on function public.admin_create_account(
  uuid,
  text,
  text,
  uuid,
  public.subscription_status,
  timestamptz,
  timestamptz,
  timestamptz,
  jsonb
) to authenticated;
grant execute on function public.create_project(
  uuid,
  text,
  text,
  public.project_category,
  uuid
) to authenticated;
grant execute on function public.create_group(uuid, uuid, text, text, uuid) to authenticated;
grant execute on function public.create_ar_item(uuid, uuid, uuid, text, text) to authenticated;
