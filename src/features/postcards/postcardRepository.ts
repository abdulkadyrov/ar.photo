import { z } from "zod";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { assertDemoRuntimeEnabled } from "../../shared/config/env";
import {
  batchInputSchema,
  batchSchema,
  cardSchema,
  movementInputSchema,
  movementSchema,
  shopInputSchema,
  shopSchema,
  shopReportSchema,
  type ShopReport,
  type BatchInput,
  type MovementInput,
  type PostcardBatch,
  type PostcardCard,
  type PostcardMovement,
  type PostcardShop,
  type ShopInput,
} from "./postcardModel";

export interface PostcardRepository {
  getShopReport(accountId: string): Promise<ShopReport>;
  listShops(accountId: string): Promise<PostcardShop[]>;
  listBatches(accountId: string): Promise<PostcardBatch[]>;
  listCards(accountId: string, batchId: string): Promise<PostcardCard[]>;
  listMovements(accountId: string): Promise<PostcardMovement[]>;
  createShop(accountId: string, input: ShopInput, requestId: string): Promise<PostcardShop>;
  getShopCode(accountId: string, shopId: string): Promise<string>;
  createBatch(accountId: string, input: BatchInput, requestId: string): Promise<PostcardBatch>;
  moveCards(accountId: string, input: MovementInput, requestId: string): Promise<PostcardMovement>;
}

function fail(error: { code?: string; message?: string }): never {
  const messages: Record<string, string> = {
    "42501": "Недостаточно прав или пакет аккаунта не позволяет вносить изменения.",
    "23514": "Часть открыток уже продана, активирована или находится в другом месте. Обновите список.",
    P0002: "Магазин не найден. Обновите список.",
    "22023": "Данные операции изменились. Обновите страницу и повторите действие.",
    PGRST202: "Серверная часть открыток ещё не установлена. Данные не сохранены.",
    "42P01": "Серверная часть открыток ещё не установлена. Данные не сохранены.",
    PGRST205: "Серверная часть открыток ещё не установлена. Данные не сохранены.",
  };
  throw new Error(messages[error.code ?? ""] ?? "Не удалось выполнить действие. Проверьте соединение и повторите.");
}

export class SupabasePostcardRepository implements PostcardRepository {
  constructor(private readonly client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>) {}
  async getShopReport(accountId: string) {
    const { data, error } = await this.client.rpc("postcard_shop_report", { p_account_id: accountId });
    if (error) fail(error);
    return shopReportSchema.parse(data);
  }
  async listShops(accountId: string) {
    const { data, error } = await this.client
      .from("postcard_shops")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) fail(error);
    return z.array(shopSchema).parse(data);
  }
  async listBatches(accountId: string) {
    const { data, error } = await this.client
      .from("postcard_batches")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) fail(error);
    return z.array(batchSchema).parse(data);
  }
  async listCards(accountId: string, batchId: string) {
    const { data, error } = await this.client
      .from("postcard_cards")
      .select("*")
      .eq("account_id", accountId)
      .eq("batch_id", batchId)
      .order("ordinal")
      .limit(500);
    if (error) fail(error);
    return z.array(cardSchema).parse(data);
  }
  async listMovements(accountId: string) {
    const { data, error } = await this.client
      .from("postcard_movements")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) fail(error);
    return z.array(movementSchema).parse(data);
  }
  async createShop(accountId: string, raw: ShopInput, requestId: string) {
    const input = shopInputSchema.parse(raw);
    const { data, error } = await this.client.rpc("postcard_create_shop", {
      p_account_id: accountId,
      p_name: input.name,
      p_address: input.address,
      p_request_id: requestId,
    });
    if (error) fail(error);
    return shopSchema.parse(data);
  }
  async getShopCode(accountId: string, shopId: string) {
    const { data, error } = await this.client.rpc("postcard_get_shop_code", {
      p_account_id: accountId,
      p_shop_id: shopId,
    });
    if (error) fail(error);
    return z
      .string()
      .regex(/^[A-F0-9]{12}$/)
      .parse(data);
  }
  async createBatch(accountId: string, raw: BatchInput, requestId: string) {
    const input = batchInputSchema.parse(raw);
    const { data, error } = await this.client.rpc("postcard_create_batch", {
      p_account_id: accountId,
      p_name: input.name,
      p_template_code: input.templateCode,
      p_quantity: input.quantity,
      p_request_id: requestId,
    });
    if (error) fail(error);
    return batchSchema.parse(data);
  }
  async moveCards(accountId: string, raw: MovementInput, requestId: string) {
    const input = movementInputSchema.parse(raw);
    const { data, error } = await this.client.rpc("postcard_move_cards", {
      p_account_id: accountId,
      p_kind: input.kind,
      p_shop_id: input.shopId,
      p_card_ids: input.cardIds,
      p_request_id: requestId,
    });
    if (error) fail(error);
    return movementSchema.parse(data);
  }
}

let repository: PostcardRepository | undefined;
export async function getPostcardRepository(): Promise<PostcardRepository> {
  if (repository) return repository;
  const client = getSupabaseBrowserClient();
  if (client) return (repository = new SupabasePostcardRepository(client));
  assertDemoRuntimeEnabled();
  const { DemoPostcardRepository } = await import("./demoPostcardRepository");
  return (repository = new DemoPostcardRepository());
}
