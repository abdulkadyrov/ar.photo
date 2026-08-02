begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(8);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$
    select public.create_project(
      '20000000-0000-4000-8000-000000000001',
      'Movement target',
      'Catalog pgTAP fixture',
      'other',
      '52000000-0000-4000-8000-000000000020'
    )
  $$,
  'owner creates a destination project'
);

select lives_ok(
  $$
    select public.create_group(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      'Teachers',
      'Catalog pgTAP fixture',
      '62000000-0000-4000-8000-000000000020'
    )
  $$,
  'owner creates another group'
);

select lives_ok(
  $$
    select public.reorder_groups(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      array[
        '62000000-0000-4000-8000-000000000020'::uuid,
        '60000000-0000-4000-8000-000000000001'::uuid
      ]
    )
  $$,
  'owner atomically reorders every active project group'
);

select is(
  (select sort_order from public.groups where id = '60000000-0000-4000-8000-000000000001'),
  1,
  'reorder assigns the expected stable position'
);

select lives_ok(
  $$
    select public.move_group(
      '20000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      '52000000-0000-4000-8000-000000000020'
    )
  $$,
  'owner atomically moves a group'
);

select is(
  (select p.name from public.groups g join public.projects p on p.id = g.project_id where g.id = '60000000-0000-4000-8000-000000000001'),
  'Movement target',
  'group belongs to the destination project'
);

select is(
  (select p.name from public.ar_items item join public.projects p on p.id = item.project_id where item.id = '70000000-0000-4000-8000-000000000001'),
  'Movement target',
  'moving a group cascades project consistency to its AR items'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000012', true);
select throws_ok(
  $$
    select public.move_group(
      '20000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001'
    )
  $$,
  '42501',
  'Account write access required',
  'viewer cannot move groups'
);

select * from finish();
rollback;
