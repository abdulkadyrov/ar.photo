begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,encrypted_password)
values('c1000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','credit-admin@example.test','');
update public.profiles set role='superadmin' where id='c1000000-0000-4000-8000-000000000001';
insert into public.subscription_plans(id,code,name,ar_item_limit,duration_days,price_kopecks)
values('c0000000-0000-4000-8000-000000000001','credit_test','Credit test',2,30,100000);
insert into public.subscription_plans(id,code,name,ar_item_limit,duration_days,price_kopecks,product_kind)
values('c0000000-0000-4000-8000-000000000002','credit_extra','Extra test',3,15,50000,'addon');
insert into public.accounts(id,name,slug,owner_user_id)
values('c2000000-0000-4000-8000-000000000001','Credit QA','credit-qa','c1000000-0000-4000-8000-000000000001');
insert into public.subscriptions(account_id,plan_id,status,expires_at)
values('c2000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','active',now()+interval '30 days');
insert into public.projects(id,account_id,name,created_by)
values('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','Credit QA','c1000000-0000-4000-8000-000000000001');
insert into public.groups(id,account_id,project_id,name,created_by)
values('c6000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','Credit QA','c1000000-0000-4000-8000-000000000001');
select is((select allowance from private.photo_credit_wallets where account_id='c2000000-0000-4000-8000-000000000001'),2::bigint,'new subscription initializes two credits');
insert into public.ar_items(id,account_id,project_id,group_id,title,created_by)
values('c7000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','c6000000-0000-4000-8000-000000000001','Credit photo','c1000000-0000-4000-8000-000000000001');
select is((select spent from private.photo_credit_wallets where account_id='c2000000-0000-4000-8000-000000000001'),1::bigint,'new AR work spends one credit');
delete from public.ar_items where id='c7000000-0000-4000-8000-000000000001';
select is((select spent from private.photo_credit_wallets where account_id='c2000000-0000-4000-8000-000000000001'),1::bigint,'hard deletion never refunds the credit');
select ok(exists(select 1 from private.photo_credit_spends where ar_item_id='c7000000-0000-4000-8000-000000000001'),'permanent record survives deletion');
insert into public.ar_items(account_id,project_id,group_id,title,created_by)
values('c2000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','c6000000-0000-4000-8000-000000000001','Second photo','c1000000-0000-4000-8000-000000000001');
select throws_ok($$insert into public.ar_items(account_id,project_id,group_id,title,created_by) values('c2000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','c6000000-0000-4000-8000-000000000001','No credit','c1000000-0000-4000-8000-000000000001')$$,'23514','Photo creation limit reached','deletion does not allow a third creation');
select is((select spent from private.photo_credit_wallets where account_id='c2000000-0000-4000-8000-000000000001'),2::bigint,'failed creation does not spend extra');
select ok(not has_table_privilege('authenticated','private.photo_credit_wallets','UPDATE'),'browser cannot edit credit balances');
select ok(not has_function_privilege('anon','public.admin_apply_package(uuid,uuid,uuid,text)','EXECUTE'),'anonymous users cannot grant packages');
set local role authenticated;
select set_config('request.jwt.claim.sub','c1000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}',true);
select throws_ok($$select public.admin_apply_package('c2000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002','c8000000-0000-4000-8000-000000000001','Package QA grant')$$,'42501','MFA verification required','superadmin requires MFA to grant credits');
select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-8000-000000000001","aal":"aal2","role":"authenticated"}',true);
select lives_ok($$select public.admin_apply_package('c2000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002','c8000000-0000-4000-8000-000000000001','Package QA grant')$$,'MFA admin grants extra photos and time');
select lives_ok($$select public.admin_apply_package('c2000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002','c8000000-0000-4000-8000-000000000001','Package QA retry')$$,'retry with same request is safe');
reset role;
select is((select allowance from private.photo_credit_wallets where account_id='c2000000-0000-4000-8000-000000000001'),5::bigint,'retry does not double grant');
select is((select expires_at from public.subscriptions where account_id='c2000000-0000-4000-8000-000000000001'),now()+interval '45 days','extension adds fifteen days to existing expiry');
select is((select count(*) from private.package_grants where account_id='c2000000-0000-4000-8000-000000000001'),1::bigint,'one immutable grant receipt');
select is((select plan_id from public.subscriptions where account_id='c2000000-0000-4000-8000-000000000001'),'c0000000-0000-4000-8000-000000000001'::uuid,'addon preserves base subscription plan');
select ok(exists(select 1 from private.admin_audit_logs where action='admin.package.grant' and account_id='c2000000-0000-4000-8000-000000000001'),'grant is audited');
set local role authenticated;
select is((public.get_account_entitlements('c2000000-0000-4000-8000-000000000001')->'usage'->>'arItems')::bigint,2::bigint,'client sees spent credits including deleted work');
select lives_ok($$select public.admin_save_plan('{"id":"c0000000-0000-4000-8000-000000000001","code":"credit_test","name":"Updated test","description":"QA","arItemLimit":20,"durationDays":365,"priceKopecks":200000,"isActive":true,"productKind":"subscription"}', 'Change catalog conditions')$$,'admin edits price, period and photo credits');
reset role;
select is((select allowance from private.photo_credit_wallets where account_id='c2000000-0000-4000-8000-000000000001'),5::bigint,'editing catalog does not change already purchased credit allowance');
select is((select duration_days from public.subscription_plans where id='c0000000-0000-4000-8000-000000000001'),365,'new plan duration is saved');
select is((select price_kopecks from public.subscription_plans where id='c0000000-0000-4000-8000-000000000001'),200000::bigint,'new price is saved');
update public.subscriptions set expires_at=now()-interval '1 day',starts_at=now()-interval '60 days' where account_id='c2000000-0000-4000-8000-000000000001';
set local role authenticated;
select lives_ok($$select public.admin_apply_package('c2000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002','c8000000-0000-4000-8000-000000000002','Extend expired subscription')$$,'expired subscription can be extended');
reset role;
select is((select expires_at from public.subscriptions where account_id='c2000000-0000-4000-8000-000000000001'),now()+interval '15 days','expired subscription extends from today');
select * from finish();
rollback;
