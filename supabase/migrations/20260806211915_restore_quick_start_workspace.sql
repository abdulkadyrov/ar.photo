-- Quick Start owns a deterministic project and group per account. Users can
-- still manage those records from the catalog, so bootstrap must heal a soft
-- delete/archive instead of returning stale ids that create_ar_item_draft
-- rejects as inactive.
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
  limit 1;

  if found then
    update public.projects
    set deleted_at = null,
        archived_at = null,
        status = 'draft'::public.project_status
    where id = quick_project.id
    returning * into quick_project;
  else
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
  limit 1;

  if found then
    update public.groups
    set deleted_at = null,
        archived_at = null
    where id = quick_group.id
    returning * into quick_group;
  else
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

revoke all on function public.bootstrap_quick_start_workspace()
from public, anon, authenticated;
grant execute on function public.bootstrap_quick_start_workspace() to authenticated;
