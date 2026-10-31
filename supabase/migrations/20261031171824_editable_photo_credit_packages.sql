-- A photo credit is spent when a new AR work is created; deletion never refunds it.
alter table public.subscription_plans
  add column duration_days integer default 30 check (duration_days is null or duration_days between 0 and 3650),
  add column price_kopecks bigint not null default 0 check (price_kopecks between 0 and 100000000000),
  add column product_kind text not null default 'subscription' check (product_kind in ('subscription', 'addon')),
  add constraint subscription_plan_package_valid check (
    (product_kind = 'subscription' and (duration_days is null or duration_days > 0)) or
    (product_kind = 'addon' and duration_days is not null and ar_item_limit is not null and
      (ar_item_limit > 0 or coalesce(duration_days, 0) > 0))
  );

create table private.photo_credit_wallets (
  account_id uuid primary key references public.accounts(id) on delete cascade,
  allowance bigint check (allowance is null or allowance >= 0),
  spent bigint not null default 0 check (spent >= 0)
);
create table private.photo_credit_spends (
  ar_item_id uuid primary key,
  account_id uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table private.package_grants (
  request_id uuid primary key,
  account_id uuid not null references public.accounts(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  product_snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create index photo_credit_spends_account_idx on private.photo_credit_spends(account_id);
create index package_grants_account_idx on private.package_grants(account_id);
alter table private.photo_credit_wallets enable row level security;
alter table private.photo_credit_spends enable row level security;
alter table private.package_grants enable row level security;
revoke all on private.photo_credit_wallets, private.photo_credit_spends, private.package_grants from public, anon, authenticated;

-- Historical deletions before migration cannot be reconstructed. Count all surviving rows,
-- including soft-deleted work, and preserve a permanent spend record from this point on.
insert into private.photo_credit_wallets(account_id, allowance, spent)
select s.account_id, coalesce((s.custom_limits->>'ar_item_limit')::bigint, p.ar_item_limit),
  (select count(*) from public.ar_items i where i.account_id=s.account_id)
from public.subscriptions s join public.subscription_plans p on p.id=s.plan_id;
insert into private.photo_credit_spends(ar_item_id,account_id,created_at)
select id,account_id,created_at from public.ar_items;

create function private.validate_subscription_product() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if exists(select 1 from public.subscription_plans where id=new.plan_id and product_kind='addon') then
    raise exception 'An addon cannot be the base subscription' using errcode='22023';
  end if;
  return new;
end; $$;
create trigger subscriptions_validate_product before insert or update of plan_id on public.subscriptions
for each row execute function private.validate_subscription_product();
revoke all on function private.validate_subscription_product() from public,anon,authenticated;

create function private.initialize_photo_credits() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into private.photo_credit_wallets(account_id,allowance)
  select new.account_id,coalesce((new.custom_limits->>'ar_item_limit')::bigint,p.ar_item_limit)
  from public.subscription_plans p where p.id=new.plan_id
  on conflict(account_id) do nothing;
  return new;
end; $$;
create trigger subscriptions_photo_credits after insert on public.subscriptions
for each row execute function private.initialize_photo_credits();

create function private.spend_photo_credit() returns trigger
language plpgsql security definer set search_path='' as $$
declare wallet private.photo_credit_wallets;
begin
  select * into strict wallet from private.photo_credit_wallets where account_id=new.account_id for update;
  if wallet.allowance is not null and wallet.spent >= wallet.allowance then
    raise exception 'Photo creation limit reached' using errcode='23514', detail='photo_credits_exhausted';
  end if;
  insert into private.photo_credit_spends(ar_item_id,account_id) values(new.id,new.account_id);
  update private.photo_credit_wallets set spent=spent+1 where account_id=new.account_id;
  return new;
end; $$;
create trigger ar_items_spend_photo_credit before insert on public.ar_items
for each row execute function private.spend_photo_credit();

create or replace function private.effective_limit(target_account_id uuid, limit_name text)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select case when limit_name = 'ar_item_limit' then
    (select w.allowance from private.photo_credit_wallets w where w.account_id=target_account_id)
  else coalesce(
    case
      when s.custom_limits ? limit_name
        and jsonb_typeof(s.custom_limits -> limit_name) = 'number'
      then greatest(0, (s.custom_limits ->> limit_name)::bigint)
    end,
    case limit_name
      when 'storage_limit_bytes' then p.storage_limit_bytes
      when 'project_limit' then p.project_limit::bigint
      when 'group_limit' then p.group_limit::bigint
      when 'ar_item_limit' then p.ar_item_limit::bigint
      when 'video_duration_limit_seconds' then p.video_duration_limit_seconds::bigint
      when 'max_video_size_bytes' then p.max_video_size_bytes
      when 'team_limit' then p.team_limit::bigint
    end
  ) end
  from public.subscriptions s
  join public.subscription_plans p on p.id = s.plan_id
  where s.account_id = target_account_id;
$$;

create or replace function public.get_account_entitlements(p_target_account_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_account public.accounts;
  target_subscription public.subscriptions;
  target_plan public.subscription_plans;
  target_member public.account_members;
  effective_permissions jsonb;
begin
  if (select auth.uid()) is null or not (select private.has_account_access(p_target_account_id)) then
    raise exception 'Account access required' using errcode = '42501';
  end if;

  select a.* into strict target_account from public.accounts a where a.id = p_target_account_id;
  select s.* into strict target_subscription from public.subscriptions s where s.account_id = p_target_account_id;
  select p.* into strict target_plan from public.subscription_plans p where p.id = target_subscription.plan_id;

  select m.* into target_member
  from public.account_members m
  where m.account_id = p_target_account_id
    and m.user_id = (select auth.uid())
    and m.is_active
    and m.accepted_at is not null;

  if found then
    effective_permissions := private.normalize_member_permissions(target_member.role, target_member.permissions);
  elsif (select private.is_superadmin()) then
    effective_permissions := private.default_member_permissions('owner'::public.member_role);
  else
    raise exception 'Account access required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'accountId', target_account.id,
    'accountName', target_account.name,
    'accountStatus', target_account.status,
    'memberRole', coalesce(target_member.role::text, 'superadmin'),
    'permissions', effective_permissions,
    'canWrite', (select private.subscription_allows_write(p_target_account_id))
      and coalesce((effective_permissions ->> 'edit')::boolean, false),
    'plan', jsonb_build_object(
      'id', target_plan.id,
      'code', target_plan.code,
      'name', target_plan.name,
      'description', target_plan.description
    ),
    'subscription', jsonb_build_object(
      'status', target_subscription.status,
      'startsAt', target_subscription.starts_at,
      'expiresAt', target_subscription.expires_at,
      'gracePeriodEndsAt', target_subscription.grace_period_ends_at
    ),
    'limits', jsonb_build_object(
      'storageBytes', private.effective_limit(p_target_account_id, 'storage_limit_bytes'),
      'projects', private.effective_limit(p_target_account_id, 'project_limit'),
      'groups', private.effective_limit(p_target_account_id, 'group_limit'),
      'arItems', private.effective_limit(p_target_account_id, 'ar_item_limit'),
      'videoDurationSeconds', private.effective_limit(p_target_account_id, 'video_duration_limit_seconds'),
      'maxVideoBytes', private.effective_limit(p_target_account_id, 'max_video_size_bytes'),
      'teamMembers', private.effective_limit(p_target_account_id, 'team_limit')
    ),
    'usage', jsonb_build_object(
      'storageBytes', target_account.storage_used_bytes,
      'projects', (select count(*) from public.projects p where p.account_id = p_target_account_id and p.deleted_at is null),
      'groups', (select count(*) from public.groups g where g.account_id = p_target_account_id and g.deleted_at is null),
      'arItems', (select w.spent from private.photo_credit_wallets w where w.account_id=p_target_account_id),
      'teamMembers', (select count(*) from public.account_members m where m.account_id = p_target_account_id and m.is_active),
      'pendingInvitations', (
        select count(*) from public.team_invitations invitation
        where invitation.account_id = p_target_account_id
          and invitation.status = 'pending'
          and invitation.expires_at > statement_timestamp()
      )
    )
  );
exception when no_data_found then
  raise exception 'Account subscription is unavailable' using errcode = '23503';
end;
$$;

create or replace function public.admin_list_plans()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform private.require_admin_mfa();
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', plan.id,
    'code', plan.code,
    'name', plan.name,
    'description', plan.description,
    'storageLimitBytes', plan.storage_limit_bytes,
    'projectLimit', plan.project_limit,
    'groupLimit', plan.group_limit,
    'arItemLimit', plan.ar_item_limit,
    'videoDurationLimitSeconds', plan.video_duration_limit_seconds,
    'maxVideoSizeBytes', plan.max_video_size_bytes,
    'teamLimit', plan.team_limit,
    'isActive', plan.is_active,
    'durationDays', plan.duration_days,
    'priceKopecks', plan.price_kopecks,
    'productKind', plan.product_kind,
    'updatedAt', plan.updated_at
  ) order by plan.created_at, plan.code), '[]'::jsonb)
  into result from public.subscription_plans plan;
  return result;
end;
$$;

create function public.admin_save_plan(p_input jsonb, p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare saved public.subscription_plans;
begin
  perform private.require_admin_mfa();
  if p_input->>'productKind'='addon' and exists(select 1 from public.subscriptions where plan_id=(p_input->>'id')::uuid) then
    raise exception 'A subscription in use cannot become an addon' using errcode='22023';
  end if;
  insert into public.subscription_plans(id,code,name,description,storage_limit_bytes,project_limit,group_limit,ar_item_limit,
    video_duration_limit_seconds,max_video_size_bytes,team_limit,is_active,duration_days,price_kopecks,product_kind)
  values(coalesce((p_input->>'id')::uuid,extensions.gen_random_uuid()),lower(btrim(p_input->>'code')),btrim(p_input->>'name'),nullif(btrim(p_input->>'description'),''),
    (p_input->>'storageLimitBytes')::bigint,(p_input->>'projectLimit')::integer,(p_input->>'groupLimit')::integer,(p_input->>'arItemLimit')::integer,
    (p_input->>'videoDurationLimitSeconds')::integer,(p_input->>'maxVideoSizeBytes')::bigint,(p_input->>'teamLimit')::integer,(p_input->>'isActive')::boolean,
    (p_input->>'durationDays')::integer,(p_input->>'priceKopecks')::bigint,p_input->>'productKind')
  on conflict(id) do update set code=excluded.code,name=excluded.name,description=excluded.description,
    storage_limit_bytes=excluded.storage_limit_bytes,project_limit=excluded.project_limit,group_limit=excluded.group_limit,
    ar_item_limit=excluded.ar_item_limit,video_duration_limit_seconds=excluded.video_duration_limit_seconds,
    max_video_size_bytes=excluded.max_video_size_bytes,team_limit=excluded.team_limit,is_active=excluded.is_active,
    duration_days=excluded.duration_days,price_kopecks=excluded.price_kopecks,product_kind=excluded.product_kind
  returning * into saved;
  perform private.write_admin_audit(null,'admin.plan.upsert','subscription_plans',saved.id::text,p_reason,
    jsonb_build_object('name',saved.name,'photoCredits',saved.ar_item_limit,'durationDays',saved.duration_days,'priceKopecks',saved.price_kopecks,'productKind',saved.product_kind,'isActive',saved.is_active));
end; $$;

create function public.admin_apply_package(p_target_account_id uuid, p_plan_id uuid, p_request_id uuid, p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare
  product public.subscription_plans;
  sub public.subscriptions;
  days integer;
  previous private.package_grants;
begin
  perform private.require_admin_mfa();
  perform 1 from private.photo_credit_wallets where account_id=p_target_account_id for update;
  if not found then raise exception 'Account not found' using errcode='23503'; end if;
  select * into previous from private.package_grants where request_id=p_request_id;
  if found then
    if previous.account_id <> p_target_account_id or previous.plan_id <> p_plan_id then
      raise exception 'Idempotency key conflict' using errcode='22023';
    end if;
    return;
  end if;
  select * into strict product from public.subscription_plans where id=p_plan_id and is_active for share;
  select * into strict sub from public.subscriptions where account_id=p_target_account_id for update;
  if exists(select 1 from public.accounts where id=p_target_account_id and status <> 'active') then
    raise exception 'Restore account before granting a package' using errcode='22023';
  end if;
  if sub.status='suspended' then raise exception 'Restore subscription before granting a package' using errcode='22023'; end if;
  if product.product_kind='addon' and product.ar_item_limit>0 and
    (sub.status not in ('active','trial','grace_period') or (sub.expires_at <= now())) and coalesce(product.duration_days,0)=0 then
    raise exception 'Extend subscription before adding photos' using errcode='22023';
  end if;
  update private.photo_credit_wallets set allowance=case
    when product.product_kind='subscription' and product.ar_item_limit is null then null
    when product.product_kind='subscription' and allowance is null then spent+product.ar_item_limit
    when allowance is null then null
    else allowance+coalesce(product.ar_item_limit,0) end
  where account_id=p_target_account_id;
  days:=coalesce(product.duration_days,0);
  update public.subscriptions set
    plan_id=case when product.product_kind='subscription' then product.id else plan_id end,
    status=case when product.product_kind='subscription' or days>0 then 'active'::public.subscription_status else status end,
    expires_at=case
      when product.product_kind='subscription' and product.duration_days is null then null
      when product.product_kind='addon' and sub.expires_at is null and sub.status in ('active','trial') then null
      when days>0 then greatest(coalesce(sub.expires_at,now()),now())+make_interval(days=>days)
      else expires_at end,
    grace_period_ends_at=case when days>0 or product.product_kind='subscription' then null else grace_period_ends_at end
  where account_id=p_target_account_id;
  insert into private.package_grants(request_id,account_id,plan_id,product_snapshot)
  values(p_request_id,p_target_account_id,p_plan_id,to_jsonb(product));
  perform private.write_admin_audit(p_target_account_id,'admin.package.grant','subscription_plans',p_plan_id::text,p_reason,
    jsonb_build_object('requestId',p_request_id,'name',product.name,'photoCredits',product.ar_item_limit,'durationDays',product.duration_days,'priceKopecks',product.price_kopecks));
end; $$;

-- Explicit access grants: privileged RPCs retain MFA and audit requirements.
revoke all on function private.initialize_photo_credits(), private.spend_photo_credit() from public,anon,authenticated;
revoke all on function public.admin_save_plan(jsonb,text), public.admin_apply_package(uuid,uuid,uuid,text) from public,anon;
grant execute on function public.admin_save_plan(jsonb,text), public.admin_apply_package(uuid,uuid,uuid,text) to authenticated;
notify pgrst, 'reload schema';
