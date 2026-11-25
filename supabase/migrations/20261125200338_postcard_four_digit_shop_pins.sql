-- Show a simple numeric shop PIN; retain the legacy code for previously issued inserts.
-- PINs are scoped to the card's assigned shop, not globally unique.
create function private.generate_postcard_shop_pin() returns text
language plpgsql volatile set search_path='' as $$
declare bytes bytea; value integer;
begin
 loop
  bytes := extensions.gen_random_bytes(2);
  value := get_byte(bytes,0)*256+get_byte(bytes,1);
  -- Rejection sampling keeps every 0000..9999 value equally likely.
  if value < 60000 then return lpad((value % 10000)::text,4,'0'); end if;
 end loop;
end; $$;
revoke all on function private.generate_postcard_shop_pin() from public,anon,authenticated,service_role;
alter table private.postcard_shop_secrets
 add column activation_pin text not null default private.generate_postcard_shop_pin()
 check (activation_pin ~ '^[0-9]{4}$');

create or replace function public.postcard_get_shop_code(p_account_id uuid, p_shop_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare secret_code text;
begin
  perform private.require_postcard_manager(p_account_id);
  select s.activation_pin into secret_code from private.postcard_shop_secrets s
    join public.postcard_shops shop on shop.id = s.shop_id
    where shop.account_id = p_account_id and shop.id = p_shop_id;
  if not found then raise exception 'Shop not found' using errcode = 'P0002'; end if;
  insert into public.audit_logs(account_id, actor_user_id, action, entity_type, entity_id)
    values(p_account_id, auth.uid(), 'postcard.shop.code_viewed', 'postcard_shops', p_shop_id);
  return secret_code;
end;
$$;

create or replace function public.postcard_buyer_claim(p_public_token text,p_shop_code text,p_edit_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; b public.postcard_batches; i public.ar_items; existing_hash text; item_limit bigint;
begin
 perform private.require_postcard_service();
 if p_edit_hash is null or p_edit_hash !~ '^[a-f0-9]{64}$' then return jsonb_build_object('error','invalid_card'); end if;
 select * into c from public.postcard_cards where public_token=p_public_token for update;
 if not found then return jsonb_build_object('error','invalid_card'); end if;
 select edit_token_hash into existing_hash from private.postcard_claims where card_id=c.id;
 if found then
   if existing_hash=p_edit_hash then return public.postcard_buyer_state(p_public_token,p_edit_hash); end if;
   return jsonb_build_object('error','invalid_card');
 end if;
 select * into b from public.postcard_batches where id=c.batch_id;
 if c.shop_id is null or c.print_marker_asset_id is null or b.group_id is null
   or not exists(select 1 from private.postcard_shop_secrets where shop_id=c.shop_id and (activation_pin=trim(p_shop_code) or activation_code=regexp_replace(upper(trim(p_shop_code)),'[[:space:]·-]','','g'))) then
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
 update public.postcard_cards set ar_item_id=i.id,activated_at=statement_timestamp() where id=c.id;
 insert into public.audit_logs(account_id,actor_user_id,action,entity_type,entity_id,metadata)
 values(c.account_id,null,'postcard.buyer.claimed','postcard_cards',c.id,jsonb_build_object('arItemId',i.id,'actor','purchaser'));
 return public.postcard_buyer_state(p_public_token,p_edit_hash);
end; $$;

-- Existing manager/MFA checks, service-only grants and gateway rate limits are unchanged.
