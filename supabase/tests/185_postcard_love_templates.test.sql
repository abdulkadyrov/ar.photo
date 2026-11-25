-- Registry extension only: synthetic reservations, rolled back after assertions.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();
select is((select frame from private.postcard_template_layouts where template_code='love-meadow'), '{"x":0.068,"y":0.169,"width":0.863,"height":0.621}'::jsonb, 'meadow uses the approved inner picture rectangle');
select is((select frame from private.postcard_template_layouts where template_code='love-moon'), '{"x":0.08,"y":0.156,"width":0.84,"height":0.608}'::jsonb, 'moon uses the approved inner picture rectangle');
select is((select frame from private.postcard_template_layouts where template_code='eid'), '{"x":0.1,"y":0.285,"width":0.8,"height":0.46}'::jsonb, 'existing printed Eid frame stays unchanged');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000010',true);
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000010","role":"authenticated","aal":"aal1"}',true);
select lives_ok($$select public.postcard_create_batch('20000000-0000-4000-8000-000000000001','love-meadow','Synthetic meadow',1,'a8500000-0000-4000-8000-000000000001')$$,'owner reserves the meadow template');
select lives_ok($$select public.postcard_create_batch('20000000-0000-4000-8000-000000000001','love-moon','Synthetic moon',1,'a8500000-0000-4000-8000-000000000002')$$,'owner reserves the moon template');
select is((select count(*)::int from public.postcard_cards where batch_id in (select id from public.postcard_batches where request_id in ('a8500000-0000-4000-8000-000000000001','a8500000-0000-4000-8000-000000000002'))),2,'both reservations produce unique physical cards');
select throws_ok($$select public.postcard_create_batch('20000000-0000-4000-8000-000000000001','unknown-template','Invalid',1,'a8500000-0000-4000-8000-000000000003')$$,'23514',null,'unknown artwork remains rejected');
reset role;
select * from finish();
rollback;
