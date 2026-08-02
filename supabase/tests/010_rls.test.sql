begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(17);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is((select count(*) from public.accounts), 1::bigint, 'owner A sees exactly one account');
select is(
  (select count(*) from public.accounts where id = '20000000-0000-4000-8000-000000000002'),
  0::bigint,
  'owner A cannot read account B'
);
select is((select count(*) from public.projects), 1::bigint, 'owner A sees only account A projects');

select lives_ok(
  $$
    select public.create_project(
      '20000000-0000-4000-8000-000000000001',
      'Idempotent project',
      'RLS fixture',
      'graduation',
      '52000000-0000-4000-8000-000000000001'
    )
  $$,
  'owner can create a project through trusted mutation'
);
select lives_ok(
  $$
    select public.create_project(
      '20000000-0000-4000-8000-000000000001',
      'Idempotent project',
      'RLS fixture',
      'graduation',
      '52000000-0000-4000-8000-000000000001'
    )
  $$,
  'repeating the same project request is safe'
);
select is(
  (
    select count(*) from public.projects
    where idempotency_key = '52000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'idempotency key creates one row'
);
select results_eq(
  $$
    update public.accounts
    set name = 'Cross-tenant write'
    where id = '20000000-0000-4000-8000-000000000002'
    returning id
  $$,
  array[]::uuid[],
  'owner A cannot update account B'
);
select is(
  (
    select count(*) from storage.objects
    where name like 'accounts/20000000-0000-4000-8000-000000000001/%'
  ),
  1::bigint,
  'owner A can read own private Storage metadata'
);
select is(
  (
    select count(*) from storage.objects
    where name like 'accounts/20000000-0000-4000-8000-000000000002/%'
  ),
  0::bigint,
  'owner A cannot read account B Storage metadata'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000012', true);
select is((select count(*) from public.accounts), 1::bigint, 'viewer can read their active account');
select results_eq(
  $$
    update public.projects
    set name = 'Viewer write'
    where id = '50000000-0000-4000-8000-000000000001'
    returning id
  $$,
  array[]::uuid[],
  'viewer cannot update projects'
);
select throws_ok(
  $$
    select public.create_project(
      '20000000-0000-4000-8000-000000000001',
      'Forbidden',
      '',
      'other',
      '52000000-0000-4000-8000-000000000002'
    )
  $$,
  '42501',
  'Account write access required',
  'viewer cannot bypass project creation quota RPC'
);
select throws_ok(
  $$
    insert into storage.objects (bucket_id, name)
    values (
      'markers-private',
      'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/viewer-write.jpg'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'viewer cannot upload to private Storage'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000013', true);
select is((select count(*) from public.accounts), 0::bigint, 'inactive member cannot read the account');

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000020', true);
select is((select count(*) from public.accounts), 1::bigint, 'expired owner can still read retained data');
select throws_ok(
  $$
    select public.create_project(
      '20000000-0000-4000-8000-000000000002',
      'Expired write',
      '',
      'other',
      '52000000-0000-4000-8000-000000000003'
    )
  $$,
  '42501',
  'Account write access required',
  'expired subscription cannot create new content'
);

reset role;
set local role anon;
select throws_ok(
  $$ select * from public.projects $$,
  '42501',
  'permission denied for table projects',
  'anon has no direct project access'
);

select * from finish();
rollback;
