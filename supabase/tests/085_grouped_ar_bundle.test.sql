begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(7);

select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.create_ar_item_draft_in_bundle(uuid,uuid,uuid,uuid,text,text,uuid)',
    'EXECUTE'
  ),
  'authenticated owners can add another AR photo to a bundle'
);
select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.create_ar_item_draft_in_bundle(uuid,uuid,uuid,uuid,text,text,uuid)',
    'EXECUTE'
  ),
  'anonymous Data API clients cannot mutate AR bundles'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.publish_ar_bundle(uuid,uuid,text,timestamptz)', 'EXECUTE'),
  'authenticated owners can publish an AR bundle'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$
    select public.create_ar_item_draft(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      'Bundle root',
      '',
      '89000000-0000-4000-8000-000000000001'
    )
  $$,
  'owner creates the first AR photo normally'
);

select lives_ok(
  $$
    select public.create_ar_item_draft_in_bundle(
      '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      (select id from public.ar_items where idempotency_key = '89000000-0000-4000-8000-000000000001'),
      'Bundle photo 2',
      '',
      '89000000-0000-4000-8000-000000000002'
    )
  $$,
  'owner appends another AR photo without creating another QR root'
);

select is(
  (
    select count(distinct qr_bundle_id)
    from public.ar_items
    where idempotency_key in (
      '89000000-0000-4000-8000-000000000001',
      '89000000-0000-4000-8000-000000000002'
    )
  ),
  1::bigint,
  'both AR photos share one durable bundle id'
);

select throws_ok(
  $$
    select public.publish_ar_bundle(
      '20000000-0000-4000-8000-000000000001',
      (select id from public.ar_items where idempotency_key = '89000000-0000-4000-8000-000000000001'),
      'https://example.test/ar.photo',
      null
    )
  $$,
  '55000',
  'AR item is not ready for publication',
  'bundle publication remains atomic when any item is incomplete'
);

select * from finish();
rollback;
