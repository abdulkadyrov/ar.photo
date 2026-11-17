-- Minimal administrative profile editors. They do not change Auth identities,
-- account ownership, memberships, capabilities, subscription limits or MFA.
create or replace function public.admin_update_account_profile(
  p_target_account_id uuid,
  p_name text,
  p_timezone text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_account public.accounts;
  next_name text := btrim(p_name);
  next_timezone text := btrim(p_timezone);
begin
  perform private.require_admin_mfa();
  if next_name is null or char_length(next_name) not between 1 and 120 or next_name ~ '[[:cntrl:]]' then
    raise exception 'Invalid account name' using errcode = '22023';
  end if;
  if next_timezone is null or char_length(next_timezone) not between 1 and 64
    or not exists (select 1 from pg_catalog.pg_timezone_names zone where zone.name = next_timezone) then
    raise exception 'Invalid timezone' using errcode = '22023';
  end if;
  select account.* into target_account from public.accounts account
  where account.id = p_target_account_id and account.status <> 'closed'
  for update;
  if not found then raise exception 'Account not found' using errcode = '23503'; end if;

  update public.accounts set name = next_name, timezone = next_timezone
  where id = target_account.id;
  perform private.write_admin_audit(
    p_target_account_id, 'admin.account.profile.update', 'accounts', p_target_account_id::text, p_reason,
    jsonb_build_object('before', jsonb_build_object('name', target_account.name, 'timezone', target_account.timezone),
      'after', jsonb_build_object('name', next_name, 'timezone', next_timezone))
  );
  return jsonb_build_object('accountId', p_target_account_id, 'name', next_name, 'timezone', next_timezone);
end;
$$;

create or replace function public.admin_update_user_profile(
  p_target_account_id uuid,
  p_target_user_id uuid,
  p_full_name text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile public.profiles;
  next_name text := btrim(p_full_name);
begin
  perform private.require_admin_mfa();
  if next_name is null or char_length(next_name) not between 1 and 120 or next_name ~ '[[:cntrl:]]' then
    raise exception 'Invalid user name' using errcode = '22023';
  end if;
  select profile.* into target_profile from public.profiles profile
  join public.account_members member on member.user_id = profile.id
  join public.accounts account on account.id = member.account_id
  where member.account_id = p_target_account_id and profile.id = p_target_user_id
    and account.status <> 'closed' and profile.role <> 'superadmin'
  for update of profile;
  if not found then raise exception 'Account user not found' using errcode = '23503'; end if;

  update public.profiles set full_name = next_name where id = target_profile.id;
  perform private.write_admin_audit(
    p_target_account_id, 'admin.user.profile.update', 'profiles', p_target_user_id::text, p_reason,
    jsonb_build_object('before', jsonb_build_object('fullName', target_profile.full_name),
      'after', jsonb_build_object('fullName', next_name))
  );
  return jsonb_build_object('userId', p_target_user_id, 'fullName', next_name);
end;
$$;

revoke all on function public.admin_update_account_profile(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_update_user_profile(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.admin_update_account_profile(uuid, text, text, text) to authenticated;
grant execute on function public.admin_update_user_profile(uuid, uuid, text, text) to authenticated;
