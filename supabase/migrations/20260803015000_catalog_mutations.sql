alter table public.ar_items
drop constraint ar_items_group_project_account_fkey;

alter table public.ar_items
add constraint ar_items_group_project_account_fkey
foreign key (group_id, project_id, account_id)
references public.groups(id, project_id, account_id)
on update cascade
on delete cascade;

create or replace function public.reorder_groups(
  p_target_account_id uuid,
  p_target_project_id uuid,
  p_ordered_group_ids uuid[]
)
returns setof public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  expected_group_count integer;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.projects p
    where p.id = p_target_project_id
      and p.account_id = p_target_account_id
      and p.deleted_at is null
      and p.status <> 'archived'
  ) then
    raise exception 'Active project not found' using errcode = '23503';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('group-order:' || p_target_project_id::text, 0)
  );

  select count(*)::integer into expected_group_count
  from public.groups g
  where g.account_id = p_target_account_id
    and g.project_id = p_target_project_id
    and g.deleted_at is null;

  if p_ordered_group_ids is null
    or cardinality(p_ordered_group_ids) <> expected_group_count
    or (select count(distinct group_id) from unnest(p_ordered_group_ids) as input(group_id)) <> expected_group_count
    or exists (
      select g.id
      from public.groups g
      where g.account_id = p_target_account_id
        and g.project_id = p_target_project_id
        and g.deleted_at is null
      except
      select input.group_id from unnest(p_ordered_group_ids) as input(group_id)
    )
  then
    raise exception 'Ordered group ids must exactly match active project groups' using errcode = '22023';
  end if;

  update public.groups g
  set sort_order = input.ordinality::integer - 1
  from unnest(p_ordered_group_ids) with ordinality as input(group_id, ordinality)
  where g.id = input.group_id
    and g.account_id = p_target_account_id
    and g.project_id = p_target_project_id
    and g.deleted_at is null;

  return query
  select g.*
  from public.groups g
  where g.account_id = p_target_account_id
    and g.project_id = p_target_project_id
    and g.deleted_at is null
  order by g.sort_order, g.id;
end;
$$;

create or replace function public.move_group(
  p_target_account_id uuid,
  p_target_group_id uuid,
  p_destination_project_id uuid
)
returns public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_group public.groups;
  moved_group public.groups;
  first_lock_key text;
  second_lock_key text;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;

  select g.* into source_group
  from public.groups g
  where g.id = p_target_group_id
    and g.account_id = p_target_account_id
    and g.deleted_at is null
  for update;
  if not found then
    raise exception 'Group not found' using errcode = '23503';
  end if;
  if not exists (
    select 1 from public.projects p
    where p.id = p_destination_project_id
      and p.account_id = p_target_account_id
      and p.deleted_at is null
      and p.status <> 'archived'
  ) then
    raise exception 'Active destination project not found' using errcode = '23503';
  end if;
  if source_group.project_id = p_destination_project_id then
    return source_group;
  end if;

  first_lock_key := least(source_group.project_id::text, p_destination_project_id::text);
  second_lock_key := greatest(source_group.project_id::text, p_destination_project_id::text);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('group-order:' || first_lock_key, 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('group-order:' || second_lock_key, 0));

  update public.groups g
  set project_id = p_destination_project_id,
      sort_order = (
        select coalesce(max(destination.sort_order) + 1, 0)
        from public.groups destination
        where destination.account_id = p_target_account_id
          and destination.project_id = p_destination_project_id
          and destination.deleted_at is null
      )
  where g.id = p_target_group_id
    and g.account_id = p_target_account_id
  returning * into moved_group;

  update public.media_assets m
  set project_id = p_destination_project_id
  where m.account_id = p_target_account_id
    and m.ar_item_id in (
      select item.id from public.ar_items item
      where item.account_id = p_target_account_id
        and item.group_id = p_target_group_id
    );

  return moved_group;
end;
$$;

revoke all on function public.reorder_groups(uuid, uuid, uuid[]) from public, anon, authenticated;
revoke all on function public.move_group(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.reorder_groups(uuid, uuid, uuid[]) to authenticated;
grant execute on function public.move_group(uuid, uuid, uuid) to authenticated;
