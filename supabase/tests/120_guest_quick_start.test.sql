begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(17);

select is(
  (select count(*) from public.subscription_plans where code = 'guest_test' and is_active),
  1::bigint,
  'guest test plan is active'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.bootstrap_quick_start_workspace()', 'EXECUTE'),
  'authenticated sessions can call quick start'
);
select ok(
  not pg_catalog.has_function_privilege('anon', 'public.bootstrap_quick_start_workspace()', 'EXECUTE'),
  'the publishable anon role cannot allocate workspaces directly'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_anonymous, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-4000-8000-000000000040',
  'authenticated',
  'authenticated',
  null,
  '',
  null,
  '{"provider":"anonymous","providers":[]}',
  '{"registration_source":"guest_test"}',
  true,
  now(),
  now(),
  '', '', '', ''
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000040', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.is_anonymous', 'true', true);

select lives_ok(
  $$ select public.bootstrap_quick_start_workspace() $$,
  'anonymous test session creates a quick-start workspace'
);
select is(
  (select count(*) from public.accounts where owner_user_id = '10000000-0000-4000-8000-000000000040'),
  1::bigint,
  'guest owns exactly one isolated account'
);
select is(
  (
    select plan.code
    from public.subscriptions subscription
    join public.subscription_plans plan on plan.id = subscription.plan_id
    join public.accounts account on account.id = subscription.account_id
    where account.owner_user_id = '10000000-0000-4000-8000-000000000040'
  ),
  'guest_test',
  'guest receives the restricted test plan'
);
select is(
  (
    select count(*)
    from public.projects project
    join public.accounts account on account.id = project.account_id
    where account.owner_user_id = '10000000-0000-4000-8000-000000000040'
      and project.idempotency_key = 'fe7f735d-dc37-4ba8-9df1-8c2a50d2c101'
  ),
  1::bigint,
  'quick start creates one hidden project'
);
select is(
  (
    select count(*)
    from public.groups guest_group
    join public.accounts account on account.id = guest_group.account_id
    where account.owner_user_id = '10000000-0000-4000-8000-000000000040'
      and guest_group.idempotency_key = 'fe7f735d-dc37-4ba8-9df1-8c2a50d2c102'
  ),
  1::bigint,
  'quick start creates one hidden group'
);
select lives_ok(
  $$ select public.bootstrap_quick_start_workspace() $$,
  'quick start is idempotent'
);
select is(
  (select count(*) from public.projects project join public.accounts account on account.id = project.account_id
    where account.owner_user_id = '10000000-0000-4000-8000-000000000040'),
  1::bigint,
  'repeated quick start never duplicates the project'
);
select is(
  (select count(*) from public.groups guest_group join public.accounts account on account.id = guest_group.account_id
    where account.owner_user_id = '10000000-0000-4000-8000-000000000040'),
  1::bigint,
  'repeated quick start never duplicates the group'
);
select is(
  public.bootstrap_quick_start_workspace() ->> 'accountId',
  (select id::text from public.accounts where owner_user_id = '10000000-0000-4000-8000-000000000040'),
  'quick start returns its account id'
);
select is(
  public.bootstrap_quick_start_workspace() ->> 'projectId',
  (select project.id::text from public.projects project join public.accounts account on account.id = project.account_id
    where account.owner_user_id = '10000000-0000-4000-8000-000000000040'),
  'quick start returns its project id'
);
select is(
  public.bootstrap_quick_start_workspace() ->> 'groupId',
  (select guest_group.id::text from public.groups guest_group join public.accounts account on account.id = guest_group.account_id
    where account.owner_user_id = '10000000-0000-4000-8000-000000000040'),
  'quick start returns its group id'
);

update public.projects
set status = 'archived', archived_at = statement_timestamp(), deleted_at = statement_timestamp()
where account_id = (select id from public.accounts where owner_user_id = '10000000-0000-4000-8000-000000000040');

update public.groups
set archived_at = statement_timestamp(), deleted_at = statement_timestamp()
where account_id = (select id from public.accounts where owner_user_id = '10000000-0000-4000-8000-000000000040');

select lives_ok(
  $$ select public.bootstrap_quick_start_workspace() $$,
  'quick start heals an archived and deleted system workspace'
);
select ok(
  (
    select project.deleted_at is null and project.archived_at is null and project.status = 'draft'
    from public.projects project
    join public.accounts account on account.id = project.account_id
    where account.owner_user_id = '10000000-0000-4000-8000-000000000040'
  ),
  'quick start restores its system project'
);
select ok(
  (
    select guest_group.deleted_at is null and guest_group.archived_at is null
    from public.groups guest_group
    join public.accounts account on account.id = guest_group.account_id
    where account.owner_user_id = '10000000-0000-4000-8000-000000000040'
  ),
  'quick start restores its system group'
);

select * from finish();
rollback;
