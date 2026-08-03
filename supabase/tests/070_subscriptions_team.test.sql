begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(50);

select ok(
  (select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.team_invitations'::regclass),
  'team invitations use forced RLS'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.team_invitations', 'SELECT'),
  'team invitation emails are not directly exposed through the Data API'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.get_account_entitlements(uuid)', 'EXECUTE'),
  'authenticated users can request effective entitlements'
);
select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.create_team_invitation(uuid,text,public.member_role,jsonb,timestamptz)',
    'EXECUTE'
  ),
  'authenticated users can call the trusted team invitation boundary'
);
select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.create_team_invitation(uuid,text,public.member_role,jsonb,timestamptz)',
    'EXECUTE'
  ),
  'anonymous users cannot create team invitations'
);
select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.admin_update_subscription(uuid,uuid,public.subscription_status,timestamptz,timestamptz,timestamptz,jsonb)',
    'EXECUTE'
  ),
  'subscription administration is exposed only through a trusted RPC'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-4000-8000-000000000014',
  'authenticated',
  'authenticated',
  'invitee-a@arphoto.example',
  extensions.crypt('ArPhotoDemo1!', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Invited Alpha"}',
  now(), now(), '', '', '', ''
);

update public.ar_items
set status = 'published', visibility = 'public', published_at = statement_timestamp()
where id = '70000000-0000-4000-8000-000000000001';
insert into public.qr_codes (account_id, ar_item_id, public_url, style)
values (
  '20000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  'https://ar.example/ar/' || (select public_slug from public.ar_items where id = '70000000-0000-4000-8000-000000000001'),
  '{"preset":"white","foreground":"#0B0F14","background":"#FFFFFF","quietZone":4,"logo":false,"logoScale":0.12}'::jsonb
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select is(
  public.get_account_entitlements('20000000-0000-4000-8000-000000000001') -> 'plan' ->> 'code',
  'studio',
  'owner sees the effective Studio plan'
);
select is(
  (public.get_account_entitlements('20000000-0000-4000-8000-000000000001') -> 'usage' ->> 'teamMembers')::integer,
  3,
  'usage includes active team members'
);
select is(
  (public.get_account_entitlements('20000000-0000-4000-8000-000000000001') -> 'permissions' ->> 'manage_team')::boolean,
  true,
  'owner receives effective team management permission'
);
select is(
  (public.get_account_entitlements('20000000-0000-4000-8000-000000000001') -> 'limits' ->> 'teamMembers')::integer,
  20,
  'entitlements resolve the plan team limit'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000012', true);
select throws_ok(
  $$ select public.get_team_roster('20000000-0000-4000-8000-000000000001') $$,
  '42501',
  'Team management access required',
  'viewer cannot read the protected team roster'
);
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000011', true);
select throws_ok(
  $$ select public.create_team_invitation(
    '20000000-0000-4000-8000-000000000001',
    'blocked@arphoto.example',
    'viewer',
    '{}'::jsonb,
    statement_timestamp() + interval '7 days'
  ) $$,
  '42501',
  'Team management access required',
  'editor role cannot invite team members'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select throws_ok(
  $$ select public.create_team_invitation(
    '20000000-0000-4000-8000-000000000001',
    'owner@arphoto.example',
    'owner',
    '{}'::jsonb,
    statement_timestamp() + interval '7 days'
  ) $$,
  '22023',
  'Invalid team invitation',
  'team invitation cannot assign account ownership'
);
select throws_ok(
  $$ select public.create_team_invitation(
    '20000000-0000-4000-8000-000000000001',
    'viewer-escalation@arphoto.example',
    'viewer',
    '{"edit":true}'::jsonb,
    statement_timestamp() + interval '7 days'
  ) $$,
  '22023',
  'Invalid member permissions',
  'viewer invitation cannot escalate to write permission'
);
select lives_ok(
  $$ select public.create_team_invitation(
    '20000000-0000-4000-8000-000000000001',
    'INVITEE-A@ARPHOTO.EXAMPLE',
    'editor',
    '{"publish":false}'::jsonb,
    statement_timestamp() + interval '7 days'
  ) $$,
  'owner creates a normalized team invitation'
);
reset role;
select is(
  (select email from public.team_invitations where account_id = '20000000-0000-4000-8000-000000000001' and status = 'pending'),
  'invitee-a@arphoto.example',
  'team invitation email is normalized'
);
select set_config(
  'stage8.invitation_id',
  (select id::text from public.team_invitations where account_id = '20000000-0000-4000-8000-000000000001' and status = 'pending'),
  true
);
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$ select public.create_team_invitation(
    '20000000-0000-4000-8000-000000000001',
    'invitee-a@arphoto.example',
    'editor',
    '{"publish":false}'::jsonb,
    statement_timestamp() + interval '8 days'
  ) $$,
  'repeated invitation updates the pending record idempotently'
);
reset role;
select is(
  (select count(*) from public.team_invitations where account_id = '20000000-0000-4000-8000-000000000001' and email = 'invitee-a@arphoto.example'),
  1::bigint,
  'repeated invitation does not create a duplicate'
);
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select is(
  jsonb_array_length(public.get_team_roster('20000000-0000-4000-8000-000000000001') -> 'invitations'),
  1,
  'protected roster shows one pending invitation'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000014', true);
select is(
  jsonb_array_length(public.get_my_pending_team_invitations()),
  1,
  'authenticated recipient sees their own pending invitation'
);
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000012', true);
select throws_ok(
  $$ select public.accept_team_invitation(current_setting('stage8.invitation_id')::uuid) $$,
  '42501',
  'Invitation recipient mismatch',
  'another account member cannot accept the invitation'
);
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000014', true);
select lives_ok(
  $$ select public.accept_team_invitation(current_setting('stage8.invitation_id')::uuid) $$,
  'matching authenticated recipient accepts the invitation'
);

reset role;
select ok(
  exists (
    select 1 from public.account_members
    where account_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000014'
      and is_active
  ),
  'acceptance creates an active membership'
);
select is(
  (select account_id from public.profiles where id = '10000000-0000-4000-8000-000000000014'),
  '20000000-0000-4000-8000-000000000001'::uuid,
  'acceptance attaches the invited profile to the account'
);
select is(
  (select status from public.team_invitations where id = current_setting('stage8.invitation_id')::uuid),
  'accepted',
  'accepted invitation is closed'
);
select is(
  (select permissions ->> 'publish' from public.account_members where account_id = '20000000-0000-4000-8000-000000000001' and user_id = '10000000-0000-4000-8000-000000000014'),
  'false',
  'accepted member retains the explicit permission override'
);
select ok(
  not exists (
    select 1 from public.audit_logs
    where entity_type = 'team_invitations'
      and metadata::text like '%invitee-a@arphoto.example%'
  ),
  'team invitation audit metadata excludes email PII'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000014', true);
select throws_ok(
  $$ select public.accept_team_invitation(current_setting('stage8.invitation_id')::uuid) $$,
  '23503',
  'Pending invitation not found',
  'accepted invitation cannot be replayed'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$ select public.update_team_member(
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000002',
    'editor',
    '{"upload":false,"edit":true,"publish":false,"delete":false,"analytics":true,"manage_groups":false}'::jsonb
  ) $$,
  'owner applies granular editor permissions'
);
select is(
  (select permissions ->> 'upload' from public.account_members where id = '30000000-0000-4000-8000-000000000002'),
  'false',
  'granular upload denial is persisted'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000011', true);
select throws_ok(
  $$ select public.begin_media_upload(
    '20000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001',
    'marker',
    'permission.jpg',
    'image/jpeg',
    2048,
    '89000000-0000-4000-8000-000000000001'
  ) $$,
  '42501',
  'Member permission required: upload',
  'upload permission is enforced inside the trusted media lifecycle'
);
select throws_ok(
  $$ select public.create_group(
    '20000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    'Forbidden group',
    '',
    '89000000-0000-4000-8000-000000000002'
  ) $$,
  '42501',
  'Member permission required: manage_groups',
  'group management permission is enforced by a database trigger'
);
select throws_ok(
  $$ update public.projects
    set deleted_at = statement_timestamp()
    where id = '50000000-0000-4000-8000-000000000001' $$,
  '42501',
  'Member permission required: delete',
  'soft delete requires explicit delete permission'
);
select throws_ok(
  $$ select public.update_ar_item_qr_style(
    '20000000-0000-4000-8000-000000000001',
    '70000000-0000-4000-8000-000000000001',
    '{"preset":"brand","foreground":"#4B35D2","background":"#FFFFFF","quietZone":4,"logo":true,"logoScale":0.12}'::jsonb
  ) $$,
  '42501',
  'Member permission required: publish',
  'publication permission is enforced inside QR mutations'
);
select throws_ok(
  $$ select public.create_team_invitation(
    '20000000-0000-4000-8000-000000000001',
    'still-blocked@arphoto.example',
    'viewer',
    '{}'::jsonb,
    statement_timestamp() + interval '7 days'
  ) $$,
  '42501',
  'Team management access required',
  'editor cannot self-escalate into team management'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$ select public.update_team_member(
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000002',
    'editor',
    '{}'::jsonb
  ) $$,
  'owner restores default editor permissions'
);
select lives_ok(
  $$ select public.set_team_member_active(
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000002',
    false
  ) $$,
  'owner deactivates an employee'
);
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000011', true);
select is(
  (select count(*) from public.accounts where id = '20000000-0000-4000-8000-000000000001'),
  0::bigint,
  'deactivated employee loses tenant access immediately'
);
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select lives_ok(
  $$ select public.set_team_member_active(
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000002',
    true
  ) $$,
  'owner reactivates an employee while quota allows it'
);
select throws_ok(
  $$ select public.admin_update_subscription(
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'active',
    statement_timestamp() - interval '1 day',
    statement_timestamp() + interval '90 days',
    null,
    '{}'::jsonb
  ) $$,
  '42501',
  'Superadmin access required',
  'account owner cannot administer their subscription'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$ select public.admin_update_subscription(
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'active',
    statement_timestamp() - interval '1 day',
    statement_timestamp() + interval '90 days',
    null,
    '{"unknown_limit":1}'::jsonb
  ) $$,
  '22023',
  'Invalid custom limits',
  'superadmin cannot persist unknown custom limits'
);
select lives_ok(
  $$ select public.admin_update_subscription(
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'active',
    statement_timestamp() - interval '1 day',
    statement_timestamp() + interval '90 days',
    null,
    '{"team_limit":4,"project_limit":12}'::jsonb
  ) $$,
  'superadmin applies strict custom subscription limits'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select is(
  (public.get_account_entitlements('20000000-0000-4000-8000-000000000001') -> 'limits' ->> 'teamMembers')::integer,
  4,
  'custom team limit overrides the plan value'
);
select throws_ok(
  $$ select public.create_team_invitation(
    '20000000-0000-4000-8000-000000000001',
    'over-quota@arphoto.example',
    'viewer',
    '{}'::jsonb,
    statement_timestamp() + interval '7 days'
  ) $$,
  '23514',
  'Team member limit reached',
  'team limit counts active accepted members under an advisory lock'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$ select public.admin_update_subscription(
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'suspended',
    statement_timestamp() - interval '1 day',
    statement_timestamp() + interval '90 days',
    null,
    '{"team_limit":4,"project_limit":12}'::jsonb
  ) $$,
  'superadmin suspends the subscription'
);
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select is(
  (public.get_account_entitlements('20000000-0000-4000-8000-000000000001') ->> 'canWrite')::boolean,
  false,
  'suspended subscription becomes read-only in the entitlement contract'
);
select throws_ok(
  $$ select public.create_project(
    '20000000-0000-4000-8000-000000000001',
    'Suspended project',
    '',
    'other',
    '89000000-0000-4000-8000-000000000003'
  ) $$,
  '42501',
  'Account write access required',
  'suspended subscription blocks trusted content creation'
);
select lives_ok(
  $$ select public.set_team_member_active(
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000002',
    false
  ) $$,
  'suspended owner can still deactivate a member as a safety action'
);

reset role;
select ok(
  exists (
    select 1 from public.audit_logs
    where account_id = '20000000-0000-4000-8000-000000000001'
      and entity_type = 'subscriptions'
      and action = 'subscriptions.update'
  ),
  'subscription administration is audit logged'
);
select ok(
  exists (
    select 1 from public.audit_logs
    where account_id = '20000000-0000-4000-8000-000000000001'
      and entity_type = 'account_members'
      and action = 'account_members.update'
  ),
  'team permission and activation changes are audit logged'
);

select * from finish();
rollback;
