-- Stage 8: effective entitlements, granular member permissions and team lifecycle.
create or replace function private.default_member_permissions(p_role public.member_role)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case p_role
    when 'owner'::public.member_role then
      '{"upload":true,"edit":true,"publish":true,"delete":true,"analytics":true,"manage_groups":true,"manage_team":true}'::jsonb
    when 'manager'::public.member_role then
      '{"upload":true,"edit":true,"publish":true,"delete":true,"analytics":true,"manage_groups":true,"manage_team":true}'::jsonb
    when 'editor'::public.member_role then
      '{"upload":true,"edit":true,"publish":true,"delete":false,"analytics":true,"manage_groups":true,"manage_team":false}'::jsonb
    else
      '{"upload":false,"edit":false,"publish":false,"delete":false,"analytics":false,"manage_groups":false,"manage_team":false}'::jsonb
  end;
$$;

create or replace function private.normalize_member_permissions(
  p_role public.member_role,
  p_permissions jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized jsonb := coalesce(p_permissions, '{}'::jsonb);
  effective jsonb;
  permission_key text;
  permission_value jsonb;
begin
  if jsonb_typeof(normalized) <> 'object'
    or normalized - 'upload' - 'edit' - 'publish' - 'delete' - 'analytics' - 'manage_groups' - 'manage_team' <> '{}'::jsonb
  then
    raise exception 'Invalid member permissions' using errcode = '22023';
  end if;

  for permission_key, permission_value in
    select entry.key, entry.value from jsonb_each(normalized) as entry
  loop
    if jsonb_typeof(permission_value) <> 'boolean' then
      raise exception 'Invalid member permissions' using errcode = '22023';
    end if;
  end loop;

  effective := private.default_member_permissions(p_role) || normalized;
  if p_role = 'editor'::public.member_role and coalesce((effective ->> 'manage_team')::boolean, false) then
    raise exception 'Invalid member permissions' using errcode = '22023';
  end if;
  if p_role = 'viewer'::public.member_role and (
    coalesce((effective ->> 'upload')::boolean, false)
    or coalesce((effective ->> 'edit')::boolean, false)
    or coalesce((effective ->> 'publish')::boolean, false)
    or coalesce((effective ->> 'delete')::boolean, false)
    or coalesce((effective ->> 'manage_groups')::boolean, false)
    or coalesce((effective ->> 'manage_team')::boolean, false)
  ) then
    raise exception 'Invalid member permissions' using errcode = '22023';
  end if;

  return effective;
end;
$$;

create or replace function private.member_permissions_are_valid(
  p_role public.member_role,
  p_permissions jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
begin
  perform private.normalize_member_permissions(p_role, p_permissions);
  return true;
exception when others then
  return false;
end;
$$;

create or replace function private.normalize_custom_limits(p_limits jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized jsonb := coalesce(p_limits, '{}'::jsonb);
  limit_key text;
  limit_value jsonb;
  numeric_value numeric;
begin
  if jsonb_typeof(normalized) <> 'object'
    or normalized - 'storage_limit_bytes' - 'project_limit' - 'group_limit' - 'ar_item_limit'
      - 'video_duration_limit_seconds' - 'max_video_size_bytes' - 'team_limit' <> '{}'::jsonb
  then
    raise exception 'Invalid custom limits' using errcode = '22023';
  end if;

  for limit_key, limit_value in
    select entry.key, entry.value from jsonb_each(normalized) as entry
  loop
    if jsonb_typeof(limit_value) <> 'number' then
      raise exception 'Invalid custom limits' using errcode = '22023';
    end if;
    numeric_value := (limit_value #>> '{}')::numeric;
    if numeric_value < 0 or numeric_value <> trunc(numeric_value) or numeric_value > 9223372036854775807 then
      raise exception 'Invalid custom limits' using errcode = '22023';
    end if;
  end loop;

  return normalized;
end;
$$;

create or replace function private.custom_limits_are_valid(p_limits jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
begin
  perform private.normalize_custom_limits(p_limits);
  return true;
exception when others then
  return false;
end;
$$;

alter table public.account_members
add constraint account_members_permissions_contract
check (private.member_permissions_are_valid(role, permissions));

alter table public.subscriptions
add constraint subscriptions_custom_limits_contract
check (private.custom_limits_are_valid(custom_limits));

create table public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  email text not null,
  role public.member_role not null,
  permissions jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  invited_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_invitations_email_format check (
    email = lower(trim(email))
    and char_length(email) between 3 and 320
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint team_invitations_role check (role <> 'owner'::public.member_role),
  constraint team_invitations_permissions_contract
    check (private.member_permissions_are_valid(role, permissions)),
  constraint team_invitations_status check (status in ('pending', 'accepted', 'revoked', 'expired')),
  constraint team_invitations_lifecycle check (
    (status = 'pending' and accepted_by is null and accepted_at is null and revoked_at is null)
    or (status = 'accepted' and accepted_by is not null and accepted_at is not null and revoked_at is null)
    or (status = 'revoked' and accepted_by is null and accepted_at is null and revoked_at is not null)
    or (status = 'expired' and accepted_by is null and accepted_at is null and revoked_at is null)
  )
);

create unique index team_invitations_pending_email_idx
on public.team_invitations(account_id, lower(email))
where status = 'pending';
create index team_invitations_account_status_idx
on public.team_invitations(account_id, status, expires_at);
create index team_invitations_invited_by_idx on public.team_invitations(invited_by);
create index team_invitations_accepted_by_idx
on public.team_invitations(accepted_by) where accepted_by is not null;

create trigger team_invitations_set_updated_at
before update on public.team_invitations
for each row execute function private.set_updated_at();

create or replace function private.member_has_permission(
  p_account_id uuid,
  p_permission text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_permission = any(array[
    'upload', 'edit', 'publish', 'delete', 'analytics', 'manage_groups', 'manage_team'
  ]) and (
    (select private.is_superadmin())
    or exists (
      select 1
      from public.account_members m
      join public.profiles p on p.id = m.user_id
      where m.account_id = p_account_id
        and m.user_id = (select auth.uid())
        and m.is_active
        and m.accepted_at is not null
        and p.is_active
        and coalesce(
          (private.normalize_member_permissions(m.role, m.permissions) ->> p_permission)::boolean,
          false
        )
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
    (select private.member_has_permission(target_account_id, 'edit'))
    and (select private.subscription_allows_write(target_account_id));
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
    when require_write then
      (select private.member_has_permission(private.storage_account_id(object_name), 'upload'))
      and (select private.subscription_allows_write(private.storage_account_id(object_name)))
    else (select private.has_account_access(private.storage_account_id(object_name)))
  end;
$$;

create or replace function private.enforce_stage8_member_permission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  previous_data jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else '{}'::jsonb end;
  next_data jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else '{}'::jsonb end;
  target_account_id uuid := (row_data ->> 'account_id')::uuid;
begin
  if (select auth.uid()) is null or (select private.is_superadmin()) then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  if tg_table_name = 'groups' then
    if not (select private.member_has_permission(target_account_id, 'manage_groups'))
      or not (select private.subscription_allows_write(target_account_id))
    then
      raise exception 'Member permission required: manage_groups' using errcode = '42501';
    end if;
  elsif tg_table_name = 'upload_sessions' then
    if not (select private.member_has_permission(target_account_id, 'upload'))
      or not (select private.subscription_allows_write(target_account_id))
    then
      raise exception 'Member permission required: upload' using errcode = '42501';
    end if;
  elsif tg_table_name = 'qr_codes' then
    if not (select private.member_has_permission(target_account_id, 'publish')) then
      raise exception 'Member permission required: publish' using errcode = '42501';
    end if;
  end if;

  if tg_op = 'UPDATE' and tg_table_name in ('projects', 'groups', 'ar_items')
    and previous_data -> 'deleted_at' is distinct from next_data -> 'deleted_at'
    and not (select private.member_has_permission(target_account_id, 'delete'))
  then
    raise exception 'Member permission required: delete' using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' and tg_table_name = 'ar_items'
    and (
      previous_data -> 'public_slug' is distinct from next_data -> 'public_slug'
      or previous_data -> 'visibility' is distinct from next_data -> 'visibility'
      or previous_data -> 'published_at' is distinct from next_data -> 'published_at'
      or previous_data -> 'expires_at' is distinct from next_data -> 'expires_at'
      or (
        previous_data -> 'status' is distinct from next_data -> 'status'
        and (previous_data ->> 'status' = 'published' or next_data ->> 'status' = 'published')
      )
    )
    and not (select private.member_has_permission(target_account_id, 'publish'))
  then
    raise exception 'Member permission required: publish' using errcode = '42501';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger projects_stage8_permissions
before update on public.projects
for each row execute function private.enforce_stage8_member_permission();
create trigger groups_stage8_permissions
before insert or update or delete on public.groups
for each row execute function private.enforce_stage8_member_permission();
create trigger ar_items_stage8_permissions
before update on public.ar_items
for each row execute function private.enforce_stage8_member_permission();
create trigger upload_sessions_stage8_permissions
before insert or update or delete on public.upload_sessions
for each row execute function private.enforce_stage8_member_permission();
create trigger qr_codes_stage8_permissions
before insert or update or delete on public.qr_codes
for each row execute function private.enforce_stage8_member_permission();

create or replace function private.write_team_invitation_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  insert into public.audit_logs (account_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (
    (row_data ->> 'account_id')::uuid,
    (select auth.uid()),
    'team_invitations.' || lower(tg_op),
    'team_invitations',
    (row_data ->> 'id')::uuid,
    jsonb_build_object(
      'status', row_data ->> 'status',
      'role', row_data ->> 'role'
    )
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger team_invitations_audit
after insert or update or delete on public.team_invitations
for each row execute function private.write_team_invitation_audit();

alter table public.team_invitations enable row level security;
alter table public.team_invitations force row level security;
revoke all on table public.team_invitations from public, anon, authenticated;

create or replace function public.get_account_entitlements(p_target_account_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_account public.accounts;
  target_subscription public.subscriptions;
  target_plan public.subscription_plans;
  target_member public.account_members;
  effective_permissions jsonb;
begin
  if (select auth.uid()) is null or not (select private.has_account_access(p_target_account_id)) then
    raise exception 'Account access required' using errcode = '42501';
  end if;

  select a.* into strict target_account from public.accounts a where a.id = p_target_account_id;
  select s.* into strict target_subscription from public.subscriptions s where s.account_id = p_target_account_id;
  select p.* into strict target_plan from public.subscription_plans p where p.id = target_subscription.plan_id;

  select m.* into target_member
  from public.account_members m
  where m.account_id = p_target_account_id
    and m.user_id = (select auth.uid())
    and m.is_active
    and m.accepted_at is not null;

  if found then
    effective_permissions := private.normalize_member_permissions(target_member.role, target_member.permissions);
  elsif (select private.is_superadmin()) then
    effective_permissions := private.default_member_permissions('owner'::public.member_role);
  else
    raise exception 'Account access required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'accountId', target_account.id,
    'accountName', target_account.name,
    'accountStatus', target_account.status,
    'memberRole', coalesce(target_member.role::text, 'superadmin'),
    'permissions', effective_permissions,
    'canWrite', (select private.subscription_allows_write(p_target_account_id))
      and coalesce((effective_permissions ->> 'edit')::boolean, false),
    'plan', jsonb_build_object(
      'id', target_plan.id,
      'code', target_plan.code,
      'name', target_plan.name,
      'description', target_plan.description
    ),
    'subscription', jsonb_build_object(
      'status', target_subscription.status,
      'startsAt', target_subscription.starts_at,
      'expiresAt', target_subscription.expires_at,
      'gracePeriodEndsAt', target_subscription.grace_period_ends_at
    ),
    'limits', jsonb_build_object(
      'storageBytes', private.effective_limit(p_target_account_id, 'storage_limit_bytes'),
      'projects', private.effective_limit(p_target_account_id, 'project_limit'),
      'groups', private.effective_limit(p_target_account_id, 'group_limit'),
      'arItems', private.effective_limit(p_target_account_id, 'ar_item_limit'),
      'videoDurationSeconds', private.effective_limit(p_target_account_id, 'video_duration_limit_seconds'),
      'maxVideoBytes', private.effective_limit(p_target_account_id, 'max_video_size_bytes'),
      'teamMembers', private.effective_limit(p_target_account_id, 'team_limit')
    ),
    'usage', jsonb_build_object(
      'storageBytes', target_account.storage_used_bytes,
      'projects', (select count(*) from public.projects p where p.account_id = p_target_account_id and p.deleted_at is null),
      'groups', (select count(*) from public.groups g where g.account_id = p_target_account_id and g.deleted_at is null),
      'arItems', (select count(*) from public.ar_items i where i.account_id = p_target_account_id and i.deleted_at is null),
      'teamMembers', (select count(*) from public.account_members m where m.account_id = p_target_account_id and m.is_active),
      'pendingInvitations', (
        select count(*) from public.team_invitations invitation
        where invitation.account_id = p_target_account_id
          and invitation.status = 'pending'
          and invitation.expires_at > statement_timestamp()
      )
    )
  );
exception when no_data_found then
  raise exception 'Account subscription is unavailable' using errcode = '23503';
end;
$$;

create or replace function public.get_team_roster(p_target_account_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  members jsonb;
  invitations jsonb;
begin
  if (select auth.uid()) is null
    or not (select private.member_has_permission(p_target_account_id, 'manage_team')) then
    raise exception 'Team management access required' using errcode = '42501';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'userId', m.user_id,
        'fullName', p.full_name,
        'email', p.email_display,
        'role', m.role,
        'permissions', private.normalize_member_permissions(m.role, m.permissions),
        'isActive', m.is_active,
        'acceptedAt', m.accepted_at
      ) order by (m.role = 'owner'::public.member_role) desc, p.full_name nulls last, p.email_display
    ),
    '[]'::jsonb
  ) into members
  from public.account_members m
  join public.profiles p on p.id = m.user_id
  where m.account_id = p_target_account_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', invitation.id,
        'email', invitation.email,
        'role', invitation.role,
        'permissions', private.normalize_member_permissions(invitation.role, invitation.permissions),
        'expiresAt', invitation.expires_at,
        'createdAt', invitation.created_at
      ) order by invitation.created_at desc
    ),
    '[]'::jsonb
  ) into invitations
  from public.team_invitations invitation
  where invitation.account_id = p_target_account_id
    and invitation.status = 'pending'
    and invitation.expires_at > statement_timestamp();

  return jsonb_build_object('members', members, 'invitations', invitations);
end;
$$;

create or replace function public.get_my_pending_team_invitations()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_email text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select lower(u.email) into caller_email from auth.users u where u.id = (select auth.uid());

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', invitation.id,
        'accountId', invitation.account_id,
        'accountName', account.name,
        'role', invitation.role,
        'expiresAt', invitation.expires_at
      ) order by invitation.created_at desc
    )
    from public.team_invitations invitation
    join public.accounts account on account.id = invitation.account_id
    where invitation.status = 'pending'
      and invitation.expires_at > statement_timestamp()
      and invitation.email = caller_email
  ), '[]'::jsonb);
end;
$$;

create or replace function public.create_team_invitation(
  p_target_account_id uuid,
  p_email text,
  p_role public.member_role,
  p_permissions jsonb default '{}'::jsonb,
  p_expires_at timestamptz default null
)
returns public.team_invitations
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(coalesce(p_email, '')));
  normalized_permissions jsonb;
  invitation_expiry timestamptz := coalesce(p_expires_at, statement_timestamp() + interval '7 days');
  team_limit bigint;
  existing_invitation public.team_invitations;
  created_invitation public.team_invitations;
begin
  if (select auth.uid()) is null
    or not (select private.member_has_permission(p_target_account_id, 'manage_team'))
    or not (select private.subscription_allows_write(p_target_account_id)) then
    raise exception 'Team management access required' using errcode = '42501';
  end if;
  if p_role = 'owner'::public.member_role
    or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(normalized_email) not between 3 and 320
    or invitation_expiry <= statement_timestamp() + interval '10 minutes'
    or invitation_expiry > statement_timestamp() + interval '30 days'
  then
    raise exception 'Invalid team invitation' using errcode = '22023';
  end if;
  normalized_permissions := private.normalize_member_permissions(p_role, p_permissions);

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('team-quota:' || p_target_account_id::text, 0));

  select invitation.* into existing_invitation
  from public.team_invitations invitation
  where invitation.account_id = p_target_account_id
    and invitation.email = normalized_email
    and invitation.status = 'pending'
  for update;
  if found then
    update public.team_invitations
    set role = p_role,
        permissions = normalized_permissions,
        expires_at = invitation_expiry
    where id = existing_invitation.id
    returning * into existing_invitation;
    return existing_invitation;
  end if;

  if exists (
    select 1
    from public.account_members member
    join auth.users user_record on user_record.id = member.user_id
    where member.account_id = p_target_account_id
      and member.is_active
      and lower(user_record.email) = normalized_email
  ) then
    raise exception 'User is already an active team member' using errcode = '23505';
  end if;

  team_limit := private.effective_limit(p_target_account_id, 'team_limit');
  if team_limit is not null and (
    (select count(*) from public.account_members member where member.account_id = p_target_account_id and member.is_active)
    +
    (select count(*) from public.team_invitations invitation
      where invitation.account_id = p_target_account_id
        and invitation.status = 'pending'
        and invitation.expires_at > statement_timestamp())
  ) >= team_limit then
    raise exception 'Team member limit reached' using errcode = '23514';
  end if;

  insert into public.team_invitations (
    account_id, email, role, permissions, invited_by, expires_at
  ) values (
    p_target_account_id, normalized_email, p_role, normalized_permissions, (select auth.uid()), invitation_expiry
  ) returning * into created_invitation;
  return created_invitation;
end;
$$;

create or replace function public.revoke_team_invitation(
  p_target_account_id uuid,
  p_invitation_id uuid
)
returns public.team_invitations
language plpgsql
security definer
set search_path = ''
as $$
declare
  revoked_invitation public.team_invitations;
begin
  if (select auth.uid()) is null
    or not (select private.member_has_permission(p_target_account_id, 'manage_team')) then
    raise exception 'Team management access required' using errcode = '42501';
  end if;

  update public.team_invitations
  set status = 'revoked', revoked_at = statement_timestamp()
  where id = p_invitation_id
    and account_id = p_target_account_id
    and status = 'pending'
  returning * into revoked_invitation;
  if not found then
    raise exception 'Pending invitation not found' using errcode = '23503';
  end if;
  return revoked_invitation;
end;
$$;

create or replace function public.accept_team_invitation(p_invitation_id uuid)
returns public.account_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  caller_email text;
  caller_profile public.profiles;
  target_invitation public.team_invitations;
  team_limit bigint;
  accepted_member public.account_members;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select lower(u.email) into caller_email from auth.users u where u.id = caller_id;
  select p.* into caller_profile from public.profiles p where p.id = caller_id and p.is_active;
  if caller_email is null or not found then
    raise exception 'Active profile required' using errcode = '42501';
  end if;

  select invitation.* into target_invitation
  from public.team_invitations invitation
  where invitation.id = p_invitation_id
    and invitation.status = 'pending'
  for update;
  if not found or target_invitation.expires_at <= statement_timestamp() then
    raise exception 'Pending invitation not found' using errcode = '23503';
  end if;
  if target_invitation.email <> caller_email then
    raise exception 'Invitation recipient mismatch' using errcode = '42501';
  end if;
  if caller_profile.account_id is not null and caller_profile.account_id <> target_invitation.account_id then
    raise exception 'Profile already belongs to another account' using errcode = '23514';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('team-quota:' || target_invitation.account_id::text, 0)
  );
  team_limit := private.effective_limit(target_invitation.account_id, 'team_limit');
  if team_limit is not null and (
    select count(*) from public.account_members member
    where member.account_id = target_invitation.account_id and member.is_active
  ) >= team_limit then
    raise exception 'Team member limit reached' using errcode = '23514';
  end if;

  insert into public.account_members (
    account_id, user_id, role, permissions, is_active, invited_by, invited_at, accepted_at
  ) values (
    target_invitation.account_id,
    caller_id,
    target_invitation.role,
    target_invitation.permissions,
    true,
    target_invitation.invited_by,
    target_invitation.created_at,
    statement_timestamp()
  )
  on conflict (account_id, user_id) do update
  set role = excluded.role,
      permissions = excluded.permissions,
      is_active = true,
      invited_by = excluded.invited_by,
      invited_at = excluded.invited_at,
      accepted_at = excluded.accepted_at
  returning * into accepted_member;

  update public.profiles set account_id = target_invitation.account_id where id = caller_id;
  update public.team_invitations
  set status = 'accepted', accepted_by = caller_id, accepted_at = statement_timestamp()
  where id = target_invitation.id;
  return accepted_member;
end;
$$;

create or replace function public.update_team_member(
  p_target_account_id uuid,
  p_member_id uuid,
  p_role public.member_role,
  p_permissions jsonb
)
returns public.account_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role public.member_role;
  target_member public.account_members;
  updated_member public.account_members;
  normalized_permissions jsonb;
begin
  if (select auth.uid()) is null
    or not (select private.member_has_permission(p_target_account_id, 'manage_team'))
    or not (select private.subscription_allows_write(p_target_account_id)) then
    raise exception 'Team management access required' using errcode = '42501';
  end if;
  if p_role = 'owner'::public.member_role then
    raise exception 'Account ownership cannot be reassigned here' using errcode = '22023';
  end if;
  normalized_permissions := private.normalize_member_permissions(p_role, p_permissions);

  select member.* into target_member
  from public.account_members member
  where member.id = p_member_id and member.account_id = p_target_account_id
  for update;
  if not found then raise exception 'Team member not found' using errcode = '23503'; end if;
  if target_member.role = 'owner'::public.member_role or target_member.user_id = (select auth.uid()) then
    raise exception 'Protected team member' using errcode = '42501';
  end if;

  select member.role into actor_role
  from public.account_members member
  where member.account_id = p_target_account_id
    and member.user_id = (select auth.uid())
    and member.is_active;
  if actor_role <> 'owner'::public.member_role and target_member.role = 'manager'::public.member_role then
    raise exception 'Only the owner can manage managers' using errcode = '42501';
  end if;

  update public.account_members
  set role = p_role, permissions = normalized_permissions
  where id = target_member.id
  returning * into updated_member;
  return updated_member;
end;
$$;

create or replace function public.set_team_member_active(
  p_target_account_id uuid,
  p_member_id uuid,
  p_is_active boolean
)
returns public.account_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role public.member_role;
  target_member public.account_members;
  team_limit bigint;
  updated_member public.account_members;
begin
  if (select auth.uid()) is null
    or not (select private.member_has_permission(p_target_account_id, 'manage_team')) then
    raise exception 'Team management access required' using errcode = '42501';
  end if;
  if p_is_active and not (select private.subscription_allows_write(p_target_account_id)) then
    raise exception 'Active subscription required' using errcode = '42501';
  end if;

  select member.* into target_member
  from public.account_members member
  where member.id = p_member_id and member.account_id = p_target_account_id
  for update;
  if not found then raise exception 'Team member not found' using errcode = '23503'; end if;
  if target_member.role = 'owner'::public.member_role or target_member.user_id = (select auth.uid()) then
    raise exception 'Protected team member' using errcode = '42501';
  end if;

  select member.role into actor_role
  from public.account_members member
  where member.account_id = p_target_account_id
    and member.user_id = (select auth.uid())
    and member.is_active;
  if actor_role <> 'owner'::public.member_role and target_member.role = 'manager'::public.member_role then
    raise exception 'Only the owner can manage managers' using errcode = '42501';
  end if;

  if p_is_active and not target_member.is_active then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('team-quota:' || p_target_account_id::text, 0));
    team_limit := private.effective_limit(p_target_account_id, 'team_limit');
    if team_limit is not null and (
      select count(*) from public.account_members member
      where member.account_id = p_target_account_id and member.is_active
    ) >= team_limit then
      raise exception 'Team member limit reached' using errcode = '23514';
    end if;
  end if;

  update public.account_members set is_active = p_is_active where id = target_member.id
  returning * into updated_member;
  return updated_member;
end;
$$;

create or replace function public.admin_update_subscription(
  p_target_account_id uuid,
  p_plan_id uuid,
  p_status public.subscription_status,
  p_starts_at timestamptz,
  p_expires_at timestamptz,
  p_grace_period_ends_at timestamptz,
  p_custom_limits jsonb default '{}'::jsonb
)
returns public.subscriptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_limits jsonb;
  updated_subscription public.subscriptions;
begin
  if (select auth.uid()) is null or not (select private.is_superadmin()) then
    raise exception 'Superadmin access required' using errcode = '42501';
  end if;
  if not exists (select 1 from public.subscription_plans plan where plan.id = p_plan_id and plan.is_active) then
    raise exception 'Subscription plan is not active' using errcode = '23503';
  end if;
  if p_expires_at is not null and p_expires_at <= p_starts_at then
    raise exception 'Invalid subscription period' using errcode = '22023';
  end if;
  if p_grace_period_ends_at is not null and p_expires_at is not null
    and p_grace_period_ends_at < p_expires_at then
    raise exception 'Invalid grace period' using errcode = '22023';
  end if;
  normalized_limits := private.normalize_custom_limits(p_custom_limits);

  update public.subscriptions
  set plan_id = p_plan_id,
      status = p_status,
      starts_at = p_starts_at,
      expires_at = p_expires_at,
      grace_period_ends_at = p_grace_period_ends_at,
      custom_limits = normalized_limits
  where account_id = p_target_account_id
  returning * into updated_subscription;
  if not found then raise exception 'Subscription not found' using errcode = '23503'; end if;
  return updated_subscription;
end;
$$;

revoke all on function private.default_member_permissions(public.member_role) from public, anon, authenticated;
revoke all on function private.normalize_member_permissions(public.member_role, jsonb) from public, anon, authenticated;
revoke all on function private.member_permissions_are_valid(public.member_role, jsonb) from public, anon, authenticated;
revoke all on function private.normalize_custom_limits(jsonb) from public, anon, authenticated;
revoke all on function private.custom_limits_are_valid(jsonb) from public, anon, authenticated;
revoke all on function private.member_has_permission(uuid, text) from public, anon, authenticated;
revoke all on function private.enforce_stage8_member_permission() from public, anon, authenticated;
revoke all on function private.write_team_invitation_audit() from public, anon, authenticated;

grant execute on function private.member_has_permission(uuid, text) to authenticated;

revoke all on function public.get_account_entitlements(uuid) from public, anon, authenticated;
revoke all on function public.get_team_roster(uuid) from public, anon, authenticated;
revoke all on function public.get_my_pending_team_invitations() from public, anon, authenticated;
revoke all on function public.create_team_invitation(uuid, text, public.member_role, jsonb, timestamptz)
  from public, anon, authenticated;
revoke all on function public.revoke_team_invitation(uuid, uuid) from public, anon, authenticated;
revoke all on function public.accept_team_invitation(uuid) from public, anon, authenticated;
revoke all on function public.update_team_member(uuid, uuid, public.member_role, jsonb)
  from public, anon, authenticated;
revoke all on function public.set_team_member_active(uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.admin_update_subscription(
  uuid, uuid, public.subscription_status, timestamptz, timestamptz, timestamptz, jsonb
) from public, anon, authenticated;

grant execute on function public.get_account_entitlements(uuid) to authenticated;
grant execute on function public.get_team_roster(uuid) to authenticated;
grant execute on function public.get_my_pending_team_invitations() to authenticated;
grant execute on function public.create_team_invitation(uuid, text, public.member_role, jsonb, timestamptz)
  to authenticated;
grant execute on function public.revoke_team_invitation(uuid, uuid) to authenticated;
grant execute on function public.accept_team_invitation(uuid) to authenticated;
grant execute on function public.update_team_member(uuid, uuid, public.member_role, jsonb) to authenticated;
grant execute on function public.set_team_member_active(uuid, uuid, boolean) to authenticated;
grant execute on function public.admin_update_subscription(
  uuid, uuid, public.subscription_status, timestamptz, timestamptz, timestamptz, jsonb
) to authenticated;
