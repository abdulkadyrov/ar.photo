// Isolated PostgreSQL execution of the inventory migration. Auth helper fixtures below
// model two accounts; this does not replace testing the full deployed Supabase stack.
import { readFileSync } from "node:fs";
import { pathToFileURL, URL } from "node:url";
import process from "node:process";
import console from "node:console";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
const modulePath = process.env.PGLITE_MODULE_PATH;
const { PGlite } = await import(modulePath ? pathToFileURL(modulePath).href : "@electric-sql/pglite");
const db = new PGlite();
let checks = 0;
const account = "20000000-0000-4000-8000-000000000001";
const other = "20000000-0000-4000-8000-000000000002";
const owner = "10000000-0000-4000-8000-000000000001";
const viewer = "10000000-0000-4000-8000-000000000002";
const shopId = "30000000-0000-4000-8000-000000000001";
const batchRequest = "40000000-0000-4000-8000-000000000001";
const id = () => randomUUID();
async function query(sql, params = []) {
  return (await db.query(sql, params)).rows;
}
async function check(name, run) {
  await run();
  checks++;
  console.log(`ok ${checks} - ${name}`);
}
async function denied(sql, params, code) {
  await assert.rejects(query(sql, params), (e) => e.code === code);
}
try {
  await db.exec(`
create role anon; create role authenticated; create schema auth; create schema private;
create type public.member_role as enum ('owner', 'manager', 'editor', 'viewer');
create table auth.users(id uuid primary key);
create table public.accounts(id uuid primary key);
create table public.ar_items(id uuid primary key, account_id uuid references public.accounts, unique(id,account_id));
create table public.audit_logs(id bigint generated always as identity primary key, account_id uuid, actor_user_id uuid, action text, entity_type text, entity_id uuid, metadata jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.user',true),'')::uuid$$;
create function private.has_account_access(a uuid) returns boolean language sql stable as $$select a::text=current_setting('test.account',true)$$;
create function private.has_account_role(a uuid, roles public.member_role[]) returns boolean language sql stable as $$select private.has_account_access(a) and current_setting('test.member_role',true)::public.member_role=any(roles)$$;
create function private.can_write_account(a uuid) returns boolean language sql stable as $$select private.has_account_access(a) and current_setting('test.active',true)='yes'$$;
grant usage on schema public,auth,private to authenticated,anon;
grant execute on function auth.uid(), private.has_account_access(uuid), private.has_account_role(uuid,public.member_role[]),private.can_write_account(uuid) to authenticated;
insert into public.accounts values('${account}'),('${other}');
insert into auth.users values('${owner}'),('${viewer}');
`);
  await db.exec(
    readFileSync(new URL("../../supabase/migrations/20261124211944_postcard_inventory.sql", import.meta.url), "utf8"),
  );
  await check("every inventory foreign key has a supporting index", async () => {
    const missing = await query(`select c.conname from pg_catalog.pg_constraint c
      join pg_catalog.pg_class t on t.oid=c.conrelid
      where t.relname like 'postcard_%' and c.contype='f'
      and not exists(select 1 from pg_catalog.pg_index i where i.indrelid=c.conrelid and c.conkey <@ i.indkey::smallint[])`);
    assert.deepEqual(missing, []);
  });
  await db.exec(
    `set role authenticated; set "test.user"='${owner}'; set "test.account"='${account}'; set "test.member_role"='owner'; set "test.active"='yes';`,
  );
  const shopArgs = [account, "Сувениры", "Грозный", shopId];
  const shopSql = "select (public.postcard_create_shop($1,$2,$3,$4)).*";
  await check("owner creates shop and retries without duplication", async () => {
    await query(shopSql, shopArgs);
    await query(shopSql, shopArgs);
    assert.equal((await query("select count(*)::int n from public.postcard_shops"))[0].n, 1);
  });
  await check("shop activation code is stable and shared, never in shop row", async () => {
    const a = await query("select public.postcard_get_shop_code($1,$2) code", [account, shopId]);
    const b = await query("select public.postcard_get_shop_code($1,$2) code", [account, shopId]);
    assert.match(a[0].code, /^[A-F0-9]{12}$/);
    assert.equal(a[0].code, b[0].code);
    assert.equal("activation_code" in (await query("select * from public.postcard_shops"))[0], false);
  });
  await check("secrets cannot be selected directly", () =>
    denied("select * from private.postcard_shop_secrets", [], "42501"),
  );
  const batchSql = "select (public.postcard_create_batch($1,$2,$3,$4,$5)).*";
  const batchArgs = [account, "new-year", "Первая партия", 3, batchRequest];
  const batch = (await query(batchSql, batchArgs))[0];
  await check("batch retry reserves exactly three distinct cards and no AR works", async () => {
    await query(batchSql, batchArgs);
    const cards = await query("select * from public.postcard_cards");
    assert.equal(cards.length, 3);
    assert.equal(new Set(cards.map((c) => c.public_token)).size, 3);
    await db.exec("reset role");
    assert.equal((await query("select count(*)::int n from public.ar_items"))[0].n, 0);
    await db.exec("set role authenticated");
  });
  await check("changed payload with same batch request rejected", () =>
    denied(batchSql, [account, "eid", "Первая партия", 3, batchRequest], "22023"),
  );
  await check("invalid batch size rejected", () =>
    denied(batchSql, [account, "eid", "Слишком много", 501, id()], "23514"),
  );
  const cards = await query("select * from public.postcard_cards order by ordinal");
  const moveSql = "select (public.postcard_move_cards($1,$2,$3,$4,$5)).*";
  const handoff = id();
  await check("handoff and retry are atomic and idempotent", async () => {
    const args = [account, "assign", shopId, cards.map((c) => c.id), handoff];
    await query(moveSql, args);
    await query(moveSql, args);
    assert.equal((await query("select count(*)::int n from public.postcard_movements"))[0].n, 1);
  });
  await check("duplicate scan in operation rejected", () =>
    denied(moveSql, [account, "sell", shopId, [cards[0].id, cards[0].id], id()], "22023"),
  );
  await check("sale is independent of activation", async () => {
    await query(moveSql, [account, "sell", shopId, [cards[0].id], id()]);
    const c = (await query("select * from public.postcard_cards where id=$1", [cards[0].id]))[0];
    assert.ok(c.sold_at);
    assert.equal(c.activated_at, null);
  });
  await check("double sale rejected", () => denied(moveSql, [account, "sell", shopId, [cards[0].id], id()], "23514"));
  await check("mixed sold and unsold return rolls back whole operation", async () => {
    await denied(moveSql, [account, "return", shopId, [cards[0].id, cards[1].id], id()], "23514");
    assert.equal(
      (await query("select shop_id from public.postcard_cards where id=$1", [cards[1].id]))[0].shop_id,
      shopId,
    );
  });
  await check("unsold return restores warehouse and records history", async () => {
    await query(moveSql, [account, "return", shopId, [cards[1].id], id()]);
    assert.equal(
      (await query("select shop_id from public.postcard_cards where id=$1", [cards[1].id]))[0].shop_id,
      null,
    );
  });
  await check("report aggregates all movements independently of client lists", async () => {
    const report = (await query("select public.postcard_shop_report($1) report", [account]))[0].report;
    assert.deepEqual(report, [{ shopId, delivered: 3, returned: 1, sold: 1, stock: 1, activated: 0 }]);
  });
  await check("activated cards cannot return but their real sale can be reported later", async () => {
    await query(moveSql, [account, "assign", shopId, [cards[1].id], id()]);
    await db.exec("reset role");
    await query("insert into public.ar_items(id,account_id) values($1,$2)", [cards[1].id, account]);
    await query("update public.postcard_cards set activated_at=now(),ar_item_id=$1 where id=$1", [cards[1].id]);
    await db.exec("set role authenticated");
    await denied(moveSql, [account, "return", shopId, [cards[1].id], id()], "23514");
    await query(moveSql, [account, "sell", shopId, [cards[1].id], id()]);
    assert.ok((await query("select sold_at from public.postcard_cards where id=$1", [cards[1].id]))[0].sold_at);
  });
  await check("direct inventory writes denied", () =>
    denied("update public.postcard_cards set shop_id=null", [], "42501"),
  );
  await check("cross-account shop and batch creation denied", async () => {
    await denied(shopSql, [other, "Чужой магазин", "", id()], "42501");
    await denied(batchSql, [other, "eid", "Чужой тираж", 1, id()], "42501");
  });
  await check("RLS hides foreign-account inventory", async () => {
    await db.exec(`set "test.account"='${other}'`);
    assert.equal((await query("select * from public.postcard_cards")).length, 0);
    assert.equal((await query("select * from public.postcard_shops")).length, 0);
    assert.deepEqual((await query("select public.postcard_shop_report($1) report", [account]))[0].report, []);
    await denied("select public.postcard_get_shop_code($1,$2)", [other, shopId], "P0002");
    await db.exec(`set "test.account"='${account}'`);
  });
  await check("viewer cannot manage or reveal codes", async () => {
    await db.exec(`set "test.user"='${viewer}'; set "test.member_role"='viewer'`);
    await denied(shopSql, [account, "Новый", "", id()], "42501");
    await denied("select public.postcard_get_shop_code($1,$2)", [account, shopId], "42501");
    await denied(moveSql, [account, "assign", shopId, [cards[1].id], id()], "42501");
  });
  await check("expired account cannot manage inventory", async () => {
    await db.exec(`set "test.user"='${owner}'; set "test.member_role"='owner'; set "test.active"='no'`);
    await denied(batchSql, [account, "eid", "Просрочено", 1, id()], "42501");
  });
  await check("anonymous visitor cannot read inventory or call RPCs", async () => {
    await db.exec("reset role; set role anon");
    await denied("select * from public.postcard_cards", [], "42501");
    await denied("select public.postcard_get_shop_code($1,$2)", [account, shopId], "42501");
  });
  await db.exec("reset role");
  await check("audit logs contain actions but no shop code", async () => {
    const logs = await query("select * from public.audit_logs");
    assert.ok(logs.some((l) => l.action === "postcard.shop.code_viewed"));
    const secret = (await query("select activation_code from private.postcard_shop_secrets"))[0].activation_code;
    assert.equal(JSON.stringify(logs).includes(secret), false);
  });
  console.log(`${checks} inventory database checks passed; batch ${batch.id}`);
} finally {
  await db.close();
}
