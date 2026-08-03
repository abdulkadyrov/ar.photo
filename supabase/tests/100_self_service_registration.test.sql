begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(12);

select is(
  (select count(*) from public.subscription_plans where code = 'trial' and is_active),
  1::bigint,
  'an active self-service trial plan is available'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.bootstrap_self_service_account()', 'EXECUTE'),
  'authenticated users can call the bootstrap boundary'
);
select ok(
  not pg_catalog.has_function_privilege('anon', 'public.bootstrap_self_service_account()', 'EXECUTE'),
  'anonymous users cannot call the bootstrap boundary'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000030',
    'authenticated', 'authenticated', 'signup@arphoto.example',
    extensions.crypt('ArPhotoDemo1!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Новый владелец","account_name":"Моя студия","registration_source":"self_service"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000031',
    'authenticated', 'authenticated', 'unconfirmed@arphoto.example',
    extensions.crypt('ArPhotoDemo1!', extensions.gen_salt('bf')), null,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Без подтверждения","registration_source":"self_service"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000032',
    'authenticated', 'authenticated', 'invited@arphoto.example',
    extensions.crypt('ArPhotoDemo1!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Приглашённый сотрудник"}',
    now(), now(), '', '', '', ''
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000030', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$ select public.bootstrap_self_service_account() $$,
  'confirmed self-service user creates a trial workspace'
);
select is(
  (select count(*) from public.accounts where owner_user_id = '10000000-0000-4000-8000-000000000030'),
  1::bigint,
  'bootstrap creates exactly one owned account'
);
select is(
  (select role::text from public.account_members where user_id = '10000000-0000-4000-8000-000000000030'),
  'owner',
  'bootstrap grants only the owner membership'
);
select is(
  (
    select s.status::text
    from public.subscriptions s
    join public.accounts a on a.id = s.account_id
    where a.owner_user_id = '10000000-0000-4000-8000-000000000030'
  ),
  'trial',
  'bootstrap attaches the fixed trial subscription'
);
select ok(
  (
    select s.expires_at between statement_timestamp() + interval '13 days'
      and statement_timestamp() + interval '15 days'
    from public.subscriptions s
    join public.accounts a on a.id = s.account_id
    where a.owner_user_id = '10000000-0000-4000-8000-000000000030'
  ),
  'self-service trial expires after fourteen days'
);
select lives_ok(
  $$ select public.bootstrap_self_service_account() $$,
  'repeating bootstrap is idempotent'
);
select is(
  (select count(*) from public.accounts where owner_user_id = '10000000-0000-4000-8000-000000000030'),
  1::bigint,
  'idempotent bootstrap never duplicates an account'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000031', true);
select throws_ok(
  $$ select public.bootstrap_self_service_account() $$,
  '42501',
  'Email confirmation required',
  'unconfirmed email cannot allocate a workspace'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000032', true);
select lives_ok(
  $$ select public.bootstrap_self_service_account() $$,
  'confirmed users can explicitly start a trial without trusting mutable user metadata'
);

select * from finish();
rollback;
