-- Inventory only: reserving paper cards does not create AR works or spend credits.
-- All writes are atomic RPCs; shop activation secrets are never table-readable.
create table public.postcard_shops (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 120),
  address text not null default '' check (char_length(address) <= 300),
  created_at timestamptz not null default now(),
  unique (id, account_id)
);

create table private.postcard_shop_secrets (
  shop_id uuid primary key references public.postcard_shops(id) on delete restrict,
  activation_code text not null
);
alter table private.postcard_shop_secrets enable row level security;
revoke all on private.postcard_shop_secrets from public, anon, authenticated;

create table public.postcard_batches (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete restrict,
  template_code text not null check (template_code in (
    'new-year', 'eid', 'march-8', 'autumn-ball', 'best-friend', 'brother-vip'
  )),
  name text not null check (char_length(name) between 1 and 120),
  quantity integer not null check (quantity between 1 and 500),
  request_id uuid not null,
  created_at timestamptz not null default now(),
  unique (account_id, request_id),
  unique (id, account_id)
);

create table public.postcard_cards (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete restrict,
  batch_id uuid not null,
  ordinal integer not null check (ordinal > 0),
  public_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  shop_id uuid,
  sold_at timestamptz,
  activated_at timestamptz,
  ar_item_id uuid,
  created_at timestamptz not null default now(),
  unique (batch_id, ordinal),
  foreign key (batch_id, account_id) references public.postcard_batches(id, account_id) on delete restrict,
  foreign key (shop_id, account_id) references public.postcard_shops(id, account_id) on delete restrict,
  foreign key (ar_item_id, account_id) references public.ar_items(id, account_id) on delete restrict,
  check (sold_at is null or shop_id is not null),
  check ((activated_at is null) = (ar_item_id is null))
);

create table public.postcard_movements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete restrict,
  request_id uuid not null,
  kind text not null check (kind in ('assign', 'sell', 'return')),
  shop_id uuid,
  card_ids uuid[] not null check (cardinality(card_ids) between 1 and 500),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (account_id, request_id),
  foreign key (shop_id, account_id) references public.postcard_shops(id, account_id) on delete restrict
);

create index postcard_shops_account_idx on public.postcard_shops(account_id);
create index postcard_batches_account_idx on public.postcard_batches(account_id, created_at desc);
create index postcard_cards_account_batch_idx on public.postcard_cards(account_id, batch_id, ordinal);
create index postcard_cards_shop_idx on public.postcard_cards(shop_id, account_id) where shop_id is not null;
create index postcard_cards_ar_item_idx on public.postcard_cards(ar_item_id, account_id) where ar_item_id is not null;
create index postcard_movements_account_idx on public.postcard_movements(account_id, created_at desc);
create index postcard_movements_shop_idx on public.postcard_movements(shop_id, account_id) where shop_id is not null;
create index postcard_movements_actor_idx on public.postcard_movements(actor_user_id);

alter table public.postcard_shops enable row level security;
alter table public.postcard_batches enable row level security;
alter table public.postcard_cards enable row level security;
alter table public.postcard_movements enable row level security;
create policy postcard_shops_read on public.postcard_shops for select to authenticated
  using ((select private.has_account_access(account_id)));
create policy postcard_batches_read on public.postcard_batches for select to authenticated
  using ((select private.has_account_access(account_id)));
create policy postcard_cards_read on public.postcard_cards for select to authenticated
  using ((select private.has_account_access(account_id)));
create policy postcard_movements_read on public.postcard_movements for select to authenticated
  using ((select private.has_account_access(account_id)));
revoke all on public.postcard_shops, public.postcard_batches, public.postcard_cards,
  public.postcard_movements from public, anon, authenticated;
grant select on public.postcard_shops, public.postcard_batches, public.postcard_cards,
  public.postcard_movements to authenticated;

create function private.require_postcard_manager(target_account_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null
    or not private.has_account_role(target_account_id, array['owner', 'manager']::public.member_role[])
    or not private.can_write_account(target_account_id) then
    raise exception 'Postcard management access required' using errcode = '42501';
  end if;
end;
$$;
revoke all on function private.require_postcard_manager(uuid) from public, anon, authenticated;

create function public.postcard_create_shop(p_account_id uuid, p_name text, p_address text, p_request_id uuid)
returns public.postcard_shops language plpgsql security definer set search_path = '' as $$
declare saved public.postcard_shops;
begin
  perform private.require_postcard_manager(p_account_id);
  if p_request_id is null then raise exception 'Request ID required' using errcode = '22023'; end if;
  -- A stable ID makes retries safe, including a retry after a lost response.
  perform pg_advisory_xact_lock(hashtextextended('postcard-shop:' || p_request_id::text, 0));
  select * into saved from public.postcard_shops where id = p_request_id;
  if found then
    if saved.account_id is distinct from p_account_id or saved.name is distinct from trim(p_name)
      or saved.address is distinct from trim(coalesce(p_address, '')) then
      raise exception 'Request ID conflict' using errcode = '22023';
    end if;
    return saved;
  end if;
  insert into public.postcard_shops(id, account_id, name, address)
    values(p_request_id, p_account_id, trim(p_name), trim(coalesce(p_address, ''))) returning * into saved;
  insert into private.postcard_shop_secrets(shop_id, activation_code)
    values(saved.id, upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)));
  insert into public.audit_logs(account_id, actor_user_id, action, entity_type, entity_id)
    values(p_account_id, auth.uid(), 'postcard.shop.created', 'postcard_shops', saved.id);
  return saved;
end;
$$;

create function public.postcard_get_shop_code(p_account_id uuid, p_shop_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare secret_code text;
begin
  perform private.require_postcard_manager(p_account_id);
  select s.activation_code into secret_code from private.postcard_shop_secrets s
    join public.postcard_shops shop on shop.id = s.shop_id
    where shop.account_id = p_account_id and shop.id = p_shop_id;
  if not found then raise exception 'Shop not found' using errcode = 'P0002'; end if;
  insert into public.audit_logs(account_id, actor_user_id, action, entity_type, entity_id)
    values(p_account_id, auth.uid(), 'postcard.shop.code_viewed', 'postcard_shops', p_shop_id);
  return secret_code;
end;
$$;

create function public.postcard_create_batch(
  p_account_id uuid, p_template_code text, p_name text, p_quantity integer, p_request_id uuid
) returns public.postcard_batches language plpgsql security definer set search_path = '' as $$
declare saved public.postcard_batches;
begin
  perform private.require_postcard_manager(p_account_id);
  if p_request_id is null then raise exception 'Request ID required' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('postcard-batch:' || p_account_id::text || p_request_id::text, 0));
  select * into saved from public.postcard_batches where account_id = p_account_id and request_id = p_request_id;
  if found then
    if saved.template_code is distinct from p_template_code or saved.name is distinct from trim(p_name) or saved.quantity is distinct from p_quantity then
      raise exception 'Request ID conflict' using errcode = '22023';
    end if;
    return saved;
  end if;
  insert into public.postcard_batches(account_id, template_code, name, quantity, request_id)
    values(p_account_id, p_template_code, trim(p_name), p_quantity, p_request_id) returning * into saved;
  insert into public.postcard_cards(account_id, batch_id, ordinal)
    select p_account_id, saved.id, n from generate_series(1, p_quantity) n;
  insert into public.audit_logs(account_id, actor_user_id, action, entity_type, entity_id, metadata)
    values(p_account_id, auth.uid(), 'postcard.batch.created', 'postcard_batches', saved.id,
      jsonb_build_object('quantity', p_quantity, 'template', p_template_code));
  return saved;
end;
$$;

create function public.postcard_move_cards(
  p_account_id uuid, p_kind text, p_shop_id uuid, p_card_ids uuid[], p_request_id uuid
) returns public.postcard_movements language plpgsql security definer set search_path = '' as $$
declare saved public.postcard_movements; matched integer; card_count integer;
begin
  perform private.require_postcard_manager(p_account_id);
  card_count := cardinality(p_card_ids);
  if p_request_id is null or p_kind is null or p_kind not in ('assign', 'sell', 'return')
    or card_count is null or card_count not between 1 and 500
    or exists(select 1 from unnest(p_card_ids) x where x is null)
    or card_count <> (select count(distinct x) from unnest(p_card_ids) x) then
    raise exception 'Invalid movement' using errcode = '22023';
  end if;
  -- Serialize inventory changes per account; no partial handoffs or double sales.
  perform pg_advisory_xact_lock(hashtextextended('postcard-inventory:' || p_account_id::text, 0));
  select * into saved from public.postcard_movements where account_id = p_account_id and request_id = p_request_id;
  if found then
    if saved.kind <> p_kind or saved.shop_id is distinct from p_shop_id
      or not (saved.card_ids @> p_card_ids and saved.card_ids <@ p_card_ids) then
      raise exception 'Request ID conflict' using errcode = '22023';
    end if;
    return saved;
  end if;
  if p_shop_id is null or not exists(select 1 from public.postcard_shops
    where id = p_shop_id and account_id = p_account_id) then
    raise exception 'Shop not found' using errcode = 'P0002';
  end if;
  perform 1 from public.postcard_cards where account_id = p_account_id and id = any(p_card_ids) order by id for update;
  select count(*) into matched from public.postcard_cards where account_id = p_account_id and id = any(p_card_ids)
    and sold_at is null and (activated_at is null or p_kind = 'sell')
    and ((p_kind = 'assign' and shop_id is null) or (p_kind in ('sell', 'return') and shop_id = p_shop_id));
  if matched <> card_count then
    raise exception 'Cards unavailable for this movement' using errcode = '23514';
  end if;
  update public.postcard_cards set
    shop_id = case when p_kind = 'return' then null else p_shop_id end,
    sold_at = case when p_kind = 'sell' then statement_timestamp() else null end
    where account_id = p_account_id and id = any(p_card_ids);
  insert into public.postcard_movements(account_id, request_id, kind, shop_id, card_ids, actor_user_id)
    values(p_account_id, p_request_id, p_kind, p_shop_id, p_card_ids, auth.uid()) returning * into saved;
  insert into public.audit_logs(account_id, actor_user_id, action, entity_type, entity_id, metadata)
    values(p_account_id, auth.uid(), 'postcard.cards.' || p_kind, 'postcard_movements', saved.id,
      jsonb_build_object('shopId', p_shop_id, 'quantity', card_count));
  return saved;
end;
$$;

revoke all on function public.postcard_create_shop(uuid, text, text, uuid),
  public.postcard_get_shop_code(uuid, uuid), public.postcard_create_batch(uuid, text, text, integer, uuid),
  public.postcard_move_cards(uuid, text, uuid, uuid[], uuid) from public, anon, authenticated;
grant execute on function public.postcard_create_shop(uuid, text, text, uuid),
  public.postcard_get_shop_code(uuid, uuid), public.postcard_create_batch(uuid, text, text, integer, uuid),
  public.postcard_move_cards(uuid, text, uuid, uuid[], uuid) to authenticated;

-- Full-account aggregation, independent of the paginated lists in the client.
create function public.postcard_shop_report(p_account_id uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'shopId', s.id,
    'delivered', (select coalesce(sum(cardinality(m.card_ids)), 0) from public.postcard_movements m
      where m.account_id = p_account_id and m.shop_id = s.id and m.kind = 'assign'),
    'returned', (select coalesce(sum(cardinality(m.card_ids)), 0) from public.postcard_movements m
      where m.account_id = p_account_id and m.shop_id = s.id and m.kind = 'return'),
    'sold', (select count(*) from public.postcard_cards c where c.account_id = p_account_id and c.shop_id = s.id and c.sold_at is not null),
    'stock', (select count(*) from public.postcard_cards c where c.account_id = p_account_id and c.shop_id = s.id and c.sold_at is null),
    'activated', (select count(*) from public.postcard_cards c where c.account_id = p_account_id and c.shop_id = s.id and c.activated_at is not null)
  ) order by s.created_at desc, s.id), '[]'::jsonb)
  from public.postcard_shops s where s.account_id = p_account_id;
$$;
revoke all on function public.postcard_shop_report(uuid) from public, anon, authenticated;
grant execute on function public.postcard_shop_report(uuid) to authenticated;
