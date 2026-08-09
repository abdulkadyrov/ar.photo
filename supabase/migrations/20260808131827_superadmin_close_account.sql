-- A superadmin "deletes" a tenant by closing it. The record and admin audit are
-- retained, while every tenant membership is disabled immediately.
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
    and account.status <> 'closed'
  for update;
  if not found then raise exception 'Account not found' using errcode = '23503'; end if;

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
