begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(27);

select ok(
  not pg_catalog.has_function_privilege('anon', 'public.admin_set_user_active(uuid,uuid,boolean,text)', 'EXECUTE'),
  'anonymous callers cannot change user access'
);
select ok(
  not pg_catalog.has_function_privilege('anon', 'public.admin_authorize_user_deletion(uuid,uuid,text,text)', 'EXECUTE'),
  'anonymous callers cannot authorize user deletion'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.admin_set_user_active(uuid,uuid,boolean,text)', 'EXECUTE'),
  'authenticated callers reach the MFA-protected user status RPC'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.admin_authorize_user_deletion(uuid,uuid,text,text)', 'EXECUTE'),
  'authenticated callers reach the MFA-protected deletion authorization RPC'
);
select ok(
  not pg_catalog.has_function_privilege('anon', 'public.admin_close_account(uuid,text,text)', 'EXECUTE'),
  'anonymous callers cannot close accounts'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.admin_close_account(uuid,text,text)', 'EXECUTE'),
  'authenticated callers reach the MFA-protected account closing RPC'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000010","aal":"aal2","role":"authenticated"}',
  true
);
select throws_ok(
  $$ select public.admin_set_user_active(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000011',
    false,
    'Несанкционированная блокировка пользователя'
  ) $$,
  '42501',
  'Superadmin access required',
  'account owner cannot use admin user lifecycle operations'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}',
  true
);
select throws_ok(
  $$ select public.admin_set_user_active(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000011',
    false,
    'Блокировка без второго фактора должна завершиться ошибкой'
  ) $$,
  '42501',
  'MFA verification required',
  'aal1 superadmin cannot change user access'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","aal":"aal2","role":"authenticated"}',
  true
);
select lives_ok(
  $$ select public.admin_set_user_active(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000011',
    false,
    'Блокировка сотрудника по обращению SECURITY-204'
  ) $$,
  'MFA-verified superadmin can suspend an account user'
);
reset role;
select is(
  (select is_active from public.profiles where id = '10000000-0000-4000-8000-000000000011'),
  false,
  'profile is inactive after suspension'
);
select is(
  (select is_active from public.account_members where user_id = '10000000-0000-4000-8000-000000000011'),
  false,
  'account membership is inactive after suspension'
);
select is(
  (select count(*) from private.admin_audit_logs where action = 'admin.user.suspend'),
  1::bigint,
  'user suspension is audit logged'
);

set local role authenticated;
select lives_ok(
  $$ select public.admin_set_user_active(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000011',
    true,
    'Восстановление сотрудника после проверки SECURITY-204'
  ) $$,
  'MFA-verified superadmin can restore an accepted user'
);
reset role;
select is(
  (select is_active from public.profiles where id = '10000000-0000-4000-8000-000000000011'),
  true,
  'profile is active after restore'
);

set local role authenticated;
select throws_ok(
  $$ select public.admin_authorize_user_deletion(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000011',
    'DELETE',
    'Удаление с неверным подтверждением должно быть отклонено'
  ) $$,
  '22023',
  'Deletion confirmation is invalid',
  'deletion requires the exact localized confirmation'
);
select throws_ok(
  $$ select public.admin_authorize_user_deletion(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000010',
    'УДАЛИТЬ',
    'Попытка удаления владельца аккаунта должна быть отклонена'
  ) $$,
  '22023',
  'Account owner cannot be deleted',
  'account owner identity is protected from deletion'
);
select is(
  (public.admin_authorize_user_deletion(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000011',
    'УДАЛИТЬ',
    'Удаление сотрудника по подтверждённому запросу OWNER-812'
  ) ->> 'authorized')::boolean,
  true,
  'eligible account user deletion is authorized server-side'
);
reset role;
select is(
  (select is_active from public.profiles where id = '10000000-0000-4000-8000-000000000011'),
  false,
  'authorized deletion blocks the profile before Auth removal'
);
select is(
  (select count(*) from private.admin_audit_logs where action = 'admin.user.delete.authorized'),
  1::bigint,
  'user deletion authorization is audit logged'
);

set local role authenticated;
select throws_ok(
  $$ select public.admin_close_account(
    '20000000-0000-4000-8000-000000000002',
    'УДАЛИТЬ',
    'Закрытие аккаунта с неверным подтверждением должно завершиться ошибкой'
  ) $$,
  '22023',
  'Account deletion confirmation is invalid',
  'account closing requires the exact localized confirmation'
);
select is(
  (public.admin_close_account(
    '20000000-0000-4000-8000-000000000002',
    'УДАЛИТЬ АККАУНТ',
    'Закрытие аккаунта по подтверждённому запросу владельца OWNER-901'
  ) ->> 'closed')::boolean,
  true,
  'MFA-verified superadmin can close an account'
);
reset role;
select is(
  (select status from public.accounts where id = '20000000-0000-4000-8000-000000000002'),
  'closed'::public.account_status,
  'closed account is no longer active'
);
select ok(
  (select closed_at is not null from public.accounts where id = '20000000-0000-4000-8000-000000000002'),
  'account closure records its timestamp'
);
select is(
  (select count(*) from public.account_members where account_id = '20000000-0000-4000-8000-000000000002' and is_active),
  0::bigint,
  'all memberships in the closed account are disabled'
);
select is(
  (select status from public.subscriptions where account_id = '20000000-0000-4000-8000-000000000002'),
  'cancelled'::public.subscription_status,
  'the closed account subscription is cancelled'
);
select is(
  (select is_active from public.profiles where id = '10000000-0000-4000-8000-000000000020'),
  false,
  'a user without another active account is disabled'
);
select is(
  (select count(*) from private.admin_audit_logs where action = 'admin.account.close'),
  1::bigint,
  'account closure is audit logged'
);

select * from finish();
rollback;
