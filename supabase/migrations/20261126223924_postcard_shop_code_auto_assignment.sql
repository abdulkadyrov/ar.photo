create index postcard_shop_pin_lookup_idx on private.postcard_shop_secrets(activation_pin);
create index postcard_shop_legacy_code_lookup_idx on private.postcard_shop_secrets(activation_code);
-- Existing printed codes stay unchanged. New shops avoid PIN collisions within their account.
create function private.unique_new_postcard_shop_pin() returns trigger
language plpgsql security definer set search_path='' as $$
declare account uuid; start_pin integer; candidate text; offset_value integer;
begin
 select account_id into account from public.postcard_shops where id=new.shop_id;
 if account is null or new.activation_pin !~ '^[0-9]{4}$' then return new; end if;
 perform pg_advisory_xact_lock(hashtextextended('postcard-inventory:'||account::text,0));
 start_pin:=new.activation_pin::integer;
 for offset_value in 0..9999 loop
  candidate:=lpad(((start_pin+offset_value)%10000)::text,4,'0');
  if not exists(select 1 from private.postcard_shop_secrets secret join public.postcard_shops shop on shop.id=secret.shop_id where shop.account_id=account and secret.activation_pin=candidate) then
   new.activation_pin:=candidate; return new;
  end if;
 end loop;
 raise exception 'No available shop activation codes' using errcode='23514';
end; $$;
revoke all on function private.unique_new_postcard_shop_pin() from public,anon,authenticated,service_role;
create trigger postcard_shop_pin_unique_on_insert before insert on private.postcard_shop_secrets
for each row execute function private.unique_new_postcard_shop_pin();

-- Purchaser-triggered handoffs have no human account actor. Do not impersonate the issuer.
alter table public.postcard_movements add column origin text not null default 'manager'
 check(origin in ('manager','buyer_code'));
alter table public.postcard_movements alter column actor_user_id drop not null;
alter table public.postcard_movements add constraint postcard_movements_actor_origin_check check(
 (origin='manager' and actor_user_id is not null) or
 (origin='buyer_code' and actor_user_id is null and kind='assign')
);

create or replace function public.postcard_buyer_state(p_public_token text,p_edit_hash text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; b public.postcard_batches; i public.ar_items; owned boolean; frame jsonb; state text; jobs jsonb;
begin
 perform private.require_postcard_service();
 select * into c from public.postcard_cards where public_token=p_public_token;
 if not found then return jsonb_build_object('error','invalid_card'); end if;
 select * into b from public.postcard_batches where id=c.batch_id;
 select l.frame into frame from private.postcard_template_layouts l where l.template_code=b.template_code;
 owned := exists(select 1 from private.postcard_claims where card_id=c.id and edit_token_hash=p_edit_hash);
 if c.ar_item_id is not null then select * into i from public.ar_items where id=c.ar_item_id and account_id=c.account_id; end if;
 state := case
   when i.status='published' and i.deleted_at is null then 'published'
   when c.print_marker_asset_id is null or b.group_id is null or not private.subscription_allows_write(c.account_id) then 'unavailable'
   when c.ar_item_id is null then 'available'
   when i.deleted_at is not null or i.status in ('archived','suspended') then 'unavailable'
   when i.status='processing' then 'processing'
   when i.status='ready' then 'ready'
   else 'claimed' end;
 if owned and i.id is not null then
   select coalesce(jsonb_agg(jsonb_build_object('stage',j.type,'status',j.status,'progress',j.progress,'errorCode',j.error_code) order by j.id),'[]'::jsonb)
   into jobs from public.processing_jobs j where j.ar_item_id=i.id and j.account_id=c.account_id and j.input_metadata->>'revision'=i.version::text;
 end if;
 return jsonb_build_object(
   'card',jsonb_build_object('publicToken',c.public_token,'templateCode',b.template_code,'title',b.name,'state',state,'mode',c.display_mode,'frame',frame,'videoViewport',c.video_viewport,
     'publicSlug',case when i.status='published' and i.deleted_at is null then i.public_slug else null end),
   'limits',jsonb_build_object('maxVideoBytes',least(104857600::bigint,coalesce(private.effective_limit(c.account_id,'max_video_size_bytes'),104857600)),
     'maxVideoSeconds',least(120::bigint,coalesce(private.effective_limit(c.account_id,'video_duration_limit_seconds'),120))),
   'owned',owned,'jobs',coalesce(jobs,'[]'::jsonb),
   '_previewAssetId',c.print_marker_asset_id,
   '_videoAssetId',case when owned then i.video_asset_id else null end
 );
end; $$;

create or replace function public.postcard_buyer_claim(p_public_token text,p_shop_code text,p_edit_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; b public.postcard_batches; i public.ar_items; existing_hash text; item_limit bigint; claim_account uuid; target_shop uuid; matching_shops uuid[]; auto_assigned boolean; movement_id uuid;
begin
 perform private.require_postcard_service();
 if p_edit_hash is null or p_edit_hash !~ '^[a-f0-9]{64}$' then return jsonb_build_object('error','invalid_card'); end if;
 select account_id into claim_account from public.postcard_cards where public_token=p_public_token;
 if not found then return jsonb_build_object('error','invalid_card'); end if;
 -- Same lock order as manager transfers: inventory, card, quota/wallet.
 perform pg_advisory_xact_lock(hashtextextended('postcard-inventory:'||claim_account::text,0));
 select * into c from public.postcard_cards where public_token=p_public_token for update;
 if not found then return jsonb_build_object('error','invalid_card'); end if;
 select edit_token_hash into existing_hash from private.postcard_claims where card_id=c.id;
 if found then
   if existing_hash=p_edit_hash then return public.postcard_buyer_state(p_public_token,p_edit_hash); end if;
   return jsonb_build_object('error','invalid_card');
 end if;
 select * into b from public.postcard_batches where id=c.batch_id;
 if c.print_marker_asset_id is null or b.group_id is null then
   return jsonb_build_object('error','invalid_card');
 end if;
 auto_assigned:=c.shop_id is null;
 target_shop:=c.shop_id;
 if auto_assigned then
   select array_agg(shop.id) into matching_shops from public.postcard_shops shop
   join private.postcard_shop_secrets secret on secret.shop_id=shop.id
   where shop.account_id=c.account_id and
    (secret.activation_pin=trim(p_shop_code) or secret.activation_code=regexp_replace(upper(trim(p_shop_code)),'[[:space:]·-]','','g'));
   -- Existing duplicate codes are preserved, but never route an unassigned card ambiguously.
   if coalesce(cardinality(matching_shops),0)<>1 then return jsonb_build_object('error','invalid_card'); end if;
   target_shop:=matching_shops[1];
 elsif not exists(select 1 from private.postcard_shop_secrets where shop_id=c.shop_id and
   (activation_pin=trim(p_shop_code) or activation_code=regexp_replace(upper(trim(p_shop_code)),'[[:space:]·-]','','g'))) then
   return jsonb_build_object('error','invalid_card');
 end if;
 if not private.subscription_allows_write(c.account_id) then return jsonb_build_object('error','activation_unavailable'); end if;
 if not exists(select 1 from public.groups g join public.projects p on p.id=g.project_id and p.account_id=g.account_id
    where g.id=b.group_id and g.account_id=c.account_id and g.archived_at is null and g.deleted_at is null and p.deleted_at is null and p.status<>'archived') then
   return jsonb_build_object('error','activation_unavailable');
 end if;
 perform pg_advisory_xact_lock(hashtextextended('ar-item-quota:'||c.account_id::text,0));
 item_limit := private.effective_limit(c.account_id,'ar_item_limit');
 if item_limit is not null and (select count(*) from public.ar_items where account_id=c.account_id and deleted_at is null)>=item_limit then
   return jsonb_build_object('error','activation_unavailable');
 end if;
 -- Existing credit-spend trigger is authoritative and runs exactly once here.
 insert into public.ar_items(account_id,project_id,group_id,title,description,idempotency_key,created_by)
 values(c.account_id,b.project_id,b.group_id,left(b.name||' № '||c.ordinal,160),'AR-открытка: самостоятельная активация покупателем',c.id,b.issued_by) returning * into i;
 insert into private.postcard_claims(card_id,edit_token_hash) values(c.id,p_edit_hash);
 update public.postcard_cards set shop_id=target_shop,ar_item_id=i.id,activated_at=statement_timestamp() where id=c.id;
 if auto_assigned then
   insert into public.postcard_movements(account_id,request_id,kind,shop_id,card_ids,actor_user_id,origin)
   values(c.account_id,gen_random_uuid(),'assign',target_shop,array[c.id],null,'buyer_code') returning id into movement_id;
   insert into public.audit_logs(account_id,actor_user_id,action,entity_type,entity_id,metadata)
   values(c.account_id,null,'postcard.cards.auto_assigned','postcard_movements',movement_id,
     jsonb_build_object('shopId',target_shop,'quantity',1,'actor','purchaser'));
 end if;
 insert into public.audit_logs(account_id,actor_user_id,action,entity_type,entity_id,metadata)
 values(c.account_id,null,'postcard.buyer.claimed' ,'postcard_cards',c.id,jsonb_build_object('arItemId',i.id,'actor','purchaser'));
 return public.postcard_buyer_state(p_public_token,p_edit_hash);
end; $$;


-- CREATE OR REPLACE retains the existing service-only grants; no new public RPCs.
