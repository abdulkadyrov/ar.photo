import {
  batchInputSchema,
  batchSchema,
  canMoveCard,
  cardSchema,
  movementInputSchema,
  movementSchema,
  shopInputSchema,
  shopSchema,
  type BatchInput,
  type MovementInput,
  type PostcardBatch,
  type PostcardMovement,
  type PostcardShop,
  type ShopInput,
} from "./postcardModel";
import { z } from "zod";
import { assertDemoRuntimeEnabled } from "../../shared/config/env";
import type { PostcardRepository } from "./postcardRepository";

const stateSchema = z.object({
  shops: z.array(shopSchema),
  batches: z.array(batchSchema),
  cards: z.array(cardSchema),
  movements: z.array(movementSchema),
  codes: z.record(z.string(), z.string()),
});
type State = z.infer<typeof stateSchema>;
const key = "khanzama-postcards-demo-v1";

// Explicit demo storage only. A missing production backend never falls back here.
export class DemoPostcardRepository implements PostcardRepository {
  async getShopReport(accountId: string) {
    const state = this.read();
    return state.shops
      .filter((s) => s.account_id === accountId)
      .map((shop) => {
        const cards = state.cards.filter((c) => c.account_id === accountId && c.shop_id === shop.id);
        const movements = state.movements.filter((m) => m.account_id === accountId && m.shop_id === shop.id);
        return {
          shopId: shop.id,
          delivered: movements.filter((m) => m.kind === "assign").reduce((sum, m) => sum + m.card_ids.length, 0),
          returned: movements.filter((m) => m.kind === "return").reduce((sum, m) => sum + m.card_ids.length, 0),
          sold: cards.filter((c) => c.sold_at).length,
          stock: cards.filter((c) => !c.sold_at).length,
          activated: cards.filter((c) => c.activated_at).length,
        };
      });
  }
  private read(): State {
    assertDemoRuntimeEnabled();
    const raw = localStorage.getItem(key);
    return raw ? stateSchema.parse(JSON.parse(raw)) : { shops: [], batches: [], cards: [], movements: [], codes: {} };
  }
  private save(state: State) {
    localStorage.setItem(key, JSON.stringify(state));
  }
  async listShops(accountId: string) {
    return this.read().shops.filter((s) => s.account_id === accountId);
  }
  async listBatches(accountId: string) {
    return this.read()
      .batches.filter((b) => b.account_id === accountId)
      .slice(0, 100);
  }
  async listCards(accountId: string, batchId: string) {
    return this.read().cards.filter((c) => c.account_id === accountId && c.batch_id === batchId);
  }
  async listMovements(accountId: string) {
    return this.read()
      .movements.filter((m) => m.account_id === accountId)
      .slice(0, 50);
  }
  async createShop(accountId: string, raw: ShopInput, requestId: string): Promise<PostcardShop> {
    const input = shopInputSchema.parse(raw);
    const state = this.read();
    const old = state.shops.find((s) => s.id === requestId);
    if (old) {
      if (old.account_id !== accountId || old.name !== input.name || old.address !== input.address)
        throw new Error("Конфликт операции");
      return old;
    }
    const shop = { id: requestId, account_id: accountId, ...input, created_at: new Date().toISOString() };
    state.shops.unshift(shop);
    state.codes[shop.id] = crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
    this.save(state);
    return shop;
  }
  async getShopCode(accountId: string, shopId: string) {
    const state = this.read();
    if (!state.shops.some((s) => s.id === shopId && s.account_id === accountId)) throw new Error("Магазин не найден");
    return state.codes[shopId];
  }
  async createBatch(accountId: string, raw: BatchInput, requestId: string): Promise<PostcardBatch> {
    const input = batchInputSchema.parse(raw);
    const state = this.read();
    const old = state.batches.find((b) => b.account_id === accountId && b.request_id === requestId);
    if (old) {
      if (old.name !== input.name || old.template_code !== input.templateCode || old.quantity !== input.quantity)
        throw new Error("Конфликт операции");
      return old;
    }
    const batch = {
      id: crypto.randomUUID(),
      account_id: accountId,
      name: input.name,
      template_code: input.templateCode,
      quantity: input.quantity,
      request_id: requestId,
      created_at: new Date().toISOString(),
    };
    state.batches.unshift(batch);
    for (let ordinal = 1; ordinal <= input.quantity; ordinal++)
      state.cards.push({
        id: crypto.randomUUID(),
        account_id: accountId,
        batch_id: batch.id,
        ordinal,
        public_token: crypto.randomUUID().replaceAll("-", ""),
        shop_id: null,
        sold_at: null,
        activated_at: null,
        ar_item_id: null,
        created_at: batch.created_at,
      });
    this.save(state);
    return batch;
  }
  async moveCards(accountId: string, raw: MovementInput, requestId: string): Promise<PostcardMovement> {
    const input = movementInputSchema.parse(raw);
    const state = this.read();
    const old = state.movements.find((m) => m.account_id === accountId && m.request_id === requestId);
    if (old) {
      if (
        old.kind !== input.kind ||
        old.shop_id !== input.shopId ||
        old.card_ids.length !== input.cardIds.length ||
        !old.card_ids.every((id) => input.cardIds.includes(id))
      )
        throw new Error("Конфликт операции");
      return old;
    }
    const shop = state.shops.find((s) => s.id === input.shopId && s.account_id === accountId);
    const cards = state.cards.filter((c) => c.account_id === accountId && input.cardIds.includes(c.id));
    if (!shop || cards.length !== input.cardIds.length || cards.some((c) => !canMoveCard(c, input)))
      throw new Error("Часть открыток недоступна для этой операции. Обновите список.");
    const now = new Date().toISOString();
    for (const card of cards) {
      card.shop_id = input.kind === "return" ? null : shop.id;
      card.sold_at = input.kind === "sell" ? now : null;
    }
    const movement = {
      id: crypto.randomUUID(),
      account_id: accountId,
      request_id: requestId,
      kind: input.kind,
      shop_id: shop.id,
      card_ids: input.cardIds,
      actor_user_id: "00000000-0000-4000-8000-000000000001",
      created_at: now,
    };
    state.movements.unshift(movement);
    this.save(state);
    return movement;
  }
}
