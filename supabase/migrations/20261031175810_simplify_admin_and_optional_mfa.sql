-- Fail closed by default; only a superadmin can change the temporary MFA policy.
insert into private.system_settings(key,value,description)
values('admin_mfa_required','true'::jsonb,'Требовать MFA в админке. Для включения сначала подтвердите код в разделе Безопасность.')
on conflict(key) do nothing;

create or replace function private.require_admin_mfa()
returns void language plpgsql stable security definer set search_path='' as $$
begin
  if (select auth.uid()) is null or not (select private.is_superadmin()) then
    raise exception 'Superadmin access required' using errcode='42501';
  end if;
  if coalesce((select value='true'::jsonb from private.system_settings where key='admin_mfa_required'),true)
    and not (select private.admin_mfa_verified()) then
    raise exception 'MFA verification required' using errcode='42501';
  end if;
end; $$;

create or replace function public.get_admin_access()
returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object(
    'isSuperadmin',(select private.is_superadmin()),
    'mfaVerified',(select private.admin_mfa_verified()),
    'mfaRequired',coalesce((select value='true'::jsonb from private.system_settings where key='admin_mfa_required'),true)
  );
$$;
create or replace function public.admin_update_system_setting(
  p_key text,
  p_value jsonb,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_setting private.system_settings;
  invalid_value boolean;
begin
  perform private.require_admin_mfa();
  invalid_value := case p_key
    when 'admin_mfa_required' then jsonb_typeof(p_value) <> 'boolean'
    when 'maintenance_mode' then jsonb_typeof(p_value) <> 'boolean'
    when 'registration_enabled' then jsonb_typeof(p_value) <> 'boolean'
    when 'public_ar_enabled' then jsonb_typeof(p_value) <> 'boolean'
    when 'analytics_retention_days' then
      jsonb_typeof(p_value) <> 'number' or (p_value #>> '{}')::numeric <> trunc((p_value #>> '{}')::numeric)
        or (p_value #>> '{}')::integer not between 30 and 730
    when 'support_banner' then
      jsonb_typeof(p_value) <> 'string' or char_length(p_value #>> '{}') > 160
    else true
  end;
  if not exists (select 1 from private.system_settings setting where setting.key = p_key)
    or p_value is null
    or invalid_value
  then
    raise exception 'Invalid system setting' using errcode = '22023';
  end if;

  if p_key='admin_mfa_required' and p_value='true'::jsonb and (
    not (select private.admin_mfa_verified()) or not exists(
      select 1 from auth.mfa_factors where user_id=(select auth.uid()) and status='verified'
    )
  ) then
    raise exception 'Подключите MFA и подтвердите код перед включением требования' using errcode='22023';
  end if;
  update private.system_settings
  set value = p_value,
      updated_by = (select auth.uid()),
      updated_at = statement_timestamp()
  where key = p_key
  returning * into updated_setting;

  perform private.write_admin_audit(
    null,
    'admin.settings.update',
    'system_settings',
    p_key,
    p_reason,
    jsonb_build_object('key', p_key)
  );
  return jsonb_build_object(
    'key', updated_setting.key,
    'value', updated_setting.value,
    'description', updated_setting.description,
    'updatedAt', updated_setting.updated_at
  );
end;
$$;

create or replace function public.admin_close_account(
  p_target_account_id uuid,
  p_confirmation text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_account public.accounts;
  affected_users integer;
begin
  perform private.require_admin_mfa();
  if p_confirmation <> 'УДАЛИТЬ АККАУНТ' then
    raise exception 'Account deletion confirmation is invalid' using errcode = '22023';
  end if;

  select account.* into target_account
  from public.accounts account
  where account.id = p_target_account_id
  for update;
  if not found then raise exception 'Account not found' using errcode = '23503'; end if;

  if target_account.status='closed' then
    return jsonb_build_object('closed',true,'accountId',p_target_account_id,'deactivatedUsers',0);
  end if;

  update public.accounts
  set status = 'closed', closed_at = statement_timestamp()
  where id = p_target_account_id;

  update public.subscriptions
  set status = 'cancelled'
  where account_id = p_target_account_id;

  update public.account_members
  set is_active = false
  where account_id = p_target_account_id;

  update public.profiles profile
  set is_active = false
  where profile.role <> 'superadmin'
    and exists (
      select 1
      from public.account_members target_member
      where target_member.account_id = p_target_account_id
        and target_member.user_id = profile.id
    )
    and not exists (
      select 1
      from public.account_members other_member
      join public.accounts other_account on other_account.id = other_member.account_id
      where other_member.user_id = profile.id
        and other_member.account_id <> p_target_account_id
        and other_member.is_active
        and other_account.status <> 'closed'
    );
  get diagnostics affected_users = row_count;

  perform private.write_admin_audit(
    p_target_account_id,
    'admin.account.close',
    'accounts',
    p_target_account_id::text,
    p_reason,
    jsonb_build_object(
      'accountName', target_account.name,
      'accountSlug', target_account.slug,
      'deactivatedUsers', affected_users
    )
  );

  return jsonb_build_object(
    'closed', true,
    'accountId', p_target_account_id,
    'deactivatedUsers', affected_users
  );
end;
$$;

revoke all on function public.admin_close_account(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.admin_close_account(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
