import { z } from "zod";

import { postcardTemplateCatalog, postcardTemplateCodes } from "./postcardTemplates";
export const postcardTemplates = postcardTemplateCatalog.map(({ code, name }) => ({ code, name }));

export const shopInputSchema = z.object({
  name: z.string().trim().min(1, "Введите название магазина").max(120),
  address: z.string().trim().max(300),
});
export const batchInputSchema = z.object({
  name: z.string().trim().min(1, "Введите название тиража").max(120),
  templateCode: z.enum(postcardTemplateCodes),
  quantity: z.number().int().min(1).max(500),
});
export const shopSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  created_at: z.string(),
});
export const batchSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  template_code: batchInputSchema.shape.templateCode,
  name: z.string(),
  quantity: z.number().int(),
  request_id: z.string().uuid(),
  created_at: z.string(),
});
export const cardSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  batch_id: z.string().uuid(),
  ordinal: z.number().int(),
  public_token: z.string().regex(/^[a-f0-9]{32}$/),
  shop_id: z.string().uuid().nullable(),
  print_marker_asset_id: z.string().uuid().nullable().optional(),
  printed_at: z.string().nullable().optional(),
  display_mode: z.enum(["frame", "full"]).optional(),
  video_viewport: z.unknown().nullable().optional(),
  sold_at: z.string().nullable(),
  activated_at: z.string().nullable(),
  ar_item_id: z.string().uuid().nullable(),
  created_at: z.string(),
});
export const movementSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  request_id: z.string().uuid(),
  kind: z.enum(["assign", "sell", "return"]),
  shop_id: z.string().uuid().nullable(),
  card_ids: z.array(z.string().uuid()),
  actor_user_id: z.string().uuid(),
  created_at: z.string(),
});
export const movementInputSchema = z.object({
  kind: movementSchema.shape.kind,
  shopId: z.string().uuid(),
  cardIds: z
    .array(z.string().uuid())
    .min(1)
    .max(500)
    .refine((ids) => new Set(ids).size === ids.length),
});
export type PostcardShop = z.infer<typeof shopSchema>;
export type PostcardBatch = z.infer<typeof batchSchema>;
export type PostcardCard = z.infer<typeof cardSchema>;
export type PostcardMovement = z.infer<typeof movementSchema>;
export type ShopInput = z.infer<typeof shopInputSchema>;
export type BatchInput = z.infer<typeof batchInputSchema>;
export type MovementInput = z.infer<typeof movementInputSchema>;
export const shopReportSchema = z.array(
  z.object({
    shopId: z.string().uuid(),
    delivered: z.number().int().nonnegative(),
    returned: z.number().int().nonnegative(),
    sold: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
    activated: z.number().int().nonnegative(),
  }),
);
export type ShopReport = z.infer<typeof shopReportSchema>;

export function cardInventoryCode(card: Pick<PostcardCard, "public_token">) {
  return `PC-${card.public_token}`;
}

export function findScannedCard(input: string, cards: PostcardCard[]) {
  const code = input.trim();
  let candidate = code;
  if (code.startsWith("https://")) {
    try {
      const url = new URL(code);
      if (
        url.origin !== "https://khanzama.ru" ||
        !/^\/ar\.photo\/card\/[a-f0-9]{32}$/.test(url.pathname) ||
        url.search ||
        url.hash
      )
        return undefined;
      candidate = `PC-${url.pathname.split("/").at(-1)}`;
    } catch {
      return undefined;
    }
  }
  return cards.find((card) => card.id === candidate || cardInventoryCode(card) === candidate);
}

export function canMoveCard(card: PostcardCard, input: Pick<MovementInput, "kind" | "shopId">) {
  if (card.sold_at || (card.activated_at && input.kind !== "sell")) return false;
  return input.kind === "assign" ? card.shop_id === null : card.shop_id === input.shopId;
}
