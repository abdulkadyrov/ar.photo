begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(17);

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

select * from finish();
rollback;
