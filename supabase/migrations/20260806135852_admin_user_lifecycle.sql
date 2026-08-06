create or replace function public.admin_set_user_active(
  p_target_account_id uuid,
  p_target_user_id uuid,
  p_active boolean,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_member public.account_members;
begin
  perform private.require_admin_mfa();
  if p_target_user_id = (select auth.uid()) then
    raise exception 'Superadmin cannot change own access' using errcode = '22023';
  end if;

  select member.* into target_member
  from public.account_members member
  join public.profiles profile on profile.id = member.user_id
  where member.account_id = p_target_account_id
    and member.user_id = p_target_user_id
    and profile.role <> 'superadmin'
  for update of member;
  if not found then raise exception 'Account user not found' using errcode = '23503'; end if;
  if p_active and target_member.accepted_at is null then
    raise exception 'Pending invitation cannot be activated' using errcode = '22023';
  end if;

  update public.profiles
  set is_active = p_active
  where id = p_target_user_id;
  update public.account_members
  set is_active = p_active
  where id = target_member.id;

  perform private.write_admin_audit(
    p_target_account_id,
    case when p_active then 'admin.user.activate' else 'admin.user.suspend' end,
    'profiles',
    p_target_user_id::text,
    p_reason,
    jsonb_build_object('active', p_active, 'memberRole', target_member.role)
  );

  return jsonb_build_object('userId', p_target_user_id, 'active', p_active);
end;
$$;

create or replace function public.admin_authorize_user_deletion(
  p_target_account_id uuid,
  p_target_user_id uuid,
  p_confirmation text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_member public.account_members;
  target_profile public.profiles;
  target_account public.accounts;
begin
  perform private.require_admin_mfa();
  if p_confirmation <> 'УДАЛИТЬ' then
    raise exception 'Deletion confirmation is invalid' using errcode = '22023';
  end if;
  if p_target_user_id = (select auth.uid()) then
    raise exception 'Superadmin cannot delete own identity' using errcode = '22023';
  end if;

  select member, profile into target_member, target_profile
  from public.account_members member
  join public.profiles profile on profile.id = member.user_id
  where member.account_id = p_target_account_id
    and member.user_id = p_target_user_id
  for update of member, profile;
  if not found then raise exception 'Account user not found' using errcode = '23503'; end if;

  select account.* into target_account
  from public.accounts account
  where account.id = p_target_account_id
  for update;
  if not found then raise exception 'Account not found' using errcode = '23503'; end if;
  if target_profile.role = 'superadmin' then
    raise exception 'Superadmin identity cannot be deleted' using errcode = '22023';
  end if;
  if target_account.owner_user_id = p_target_user_id then
    raise exception 'Account owner cannot be deleted' using errcode = '22023';
  end if;
  if target_member.role = 'owner' and (
    select count(*)
    from public.account_members member
    where member.account_id = p_target_account_id
      and member.role = 'owner'
      and member.is_active
  ) <= 1 then
    raise exception 'Last active owner cannot be deleted' using errcode = '22023';
  end if;

  update public.profiles set is_active = false where id = p_target_user_id;
  update public.account_members set is_active = false where id = target_member.id;

  perform private.write_admin_audit(
    p_target_account_id,
    'admin.user.delete.authorized',
    'profiles',
    p_target_user_id::text,
    p_reason,
    jsonb_build_object('memberRole', target_member.role)
  );

  return jsonb_build_object('authorized', true, 'userId', p_target_user_id);
end;
$$;

revoke all on function public.admin_set_user_active(uuid, uuid, boolean, text)
from public, anon, authenticated;
revoke all on function public.admin_authorize_user_deletion(uuid, uuid, text, text)
from public, anon, authenticated;

grant execute on function public.admin_set_user_active(uuid, uuid, boolean, text) to authenticated;
grant execute on function public.admin_authorize_user_deletion(uuid, uuid, text, text) to authenticated;
