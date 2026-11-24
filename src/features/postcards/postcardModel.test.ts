import { describe, expect, it } from "vitest";
import {
  batchInputSchema,
  canMoveCard,
  cardInventoryCode,
  findScannedCard,
  movementInputSchema,
  type PostcardCard,
} from "./postcardModel";

const card: PostcardCard = {
  id: "10000000-0000-4000-8000-000000000001",
  account_id: "20000000-0000-4000-8000-000000000001",
  batch_id: "30000000-0000-4000-8000-000000000001",
  ordinal: 1,
  public_token: "1234567890abcdef1234567890abcdef",
  shop_id: null,
  sold_at: null,
  activated_at: null,
  ar_item_id: null,
  created_at: "2026-11-25T00:00:00Z",
};
const shopId = "40000000-0000-4000-8000-000000000001";
describe("postcard inventory rules", () => {
  it("only assigns warehouse stock and only sells/returns cards held by the selected shop", () => {
    expect(canMoveCard(card, { kind: "assign", shopId })).toBe(true);
    expect(canMoveCard(card, { kind: "sell", shopId })).toBe(false);
    const delivered = { ...card, shop_id: shopId };
    expect(canMoveCard(delivered, { kind: "assign", shopId })).toBe(false);
    expect(canMoveCard(delivered, { kind: "return", shopId })).toBe(true);
    expect(canMoveCard(delivered, { kind: "sell", shopId: card.id })).toBe(false);
  });
  it("never returns or resells a sold card", () => {
    for (const kind of ["assign", "sell", "return"] as const)
      expect(canMoveCard({ ...card, shop_id: shopId, sold_at: card.created_at }, { kind, shopId })).toBe(false);
  });
  it("allows reporting a sale after activation without treating activation as a sale", () => {
    const activated = { ...card, shop_id: shopId, activated_at: card.created_at, ar_item_id: card.id };
    expect(canMoveCard(activated, { kind: "sell", shopId })).toBe(true);
    expect(canMoveCard(activated, { kind: "return", shopId })).toBe(false);
    expect(canMoveCard(activated, { kind: "assign", shopId })).toBe(false);
  });
  it("matches complete inventory IDs and never accepts partial codes or arbitrary URLs", () => {
    expect(findScannedCard(` ${cardInventoryCode(card)}\n`, [card])).toEqual(card);
    expect(findScannedCard(card.id, [card])).toEqual(card);
    expect(findScannedCard("PC-1234", [card])).toBeUndefined();
    expect(findScannedCard(`https://attacker.example/${card.public_token}`, [card])).toBeUndefined();
  });
  it("rejects duplicate scans and out-of-range batch quantities", () => {
    expect(movementInputSchema.safeParse({ kind: "assign", shopId, cardIds: [card.id, card.id] }).success).toBe(false);
    for (const quantity of [0, 501, 1.5, NaN])
      expect(batchInputSchema.safeParse({ name: "Тираж", templateCode: "eid", quantity }).success).toBe(false);
  });
});
