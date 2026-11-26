// Development-only browser fixture. This entry is not included in the production build.
import { createRoot } from "react-dom/client";
import PostcardPrintPanel from "../../../src/features/postcards/PostcardPrintPanel";
import "../../../src/styles.css";
import "../../../src/features/postcards/PostcardsPage.css";
const batch = {
  id: "batch",
  account_id: "account",
  name: "Проверка печати",
  template_code: "milka-gift" as const,
  quantity: 10,
  request_id: "request",
  created_at: "2026-11-27",
};
const cards = Array.from({ length: 10 }, (_, index) => ({
  id: `card-${index}`,
  account_id: "account",
  batch_id: "batch",
  ordinal: index + 1,
  public_token: (index + 1).toString(16).padStart(32, "0"),
  print_marker_asset_id: `marker-${index}`,
  shop_id: null,
  sold_at: null,
  activated_at: null,
  ar_item_id: null,
  created_at: "2026-11-27",
}));
createRoot(document.getElementById("root")!).render(
  <main style={{ maxWidth: 900, margin: "24px auto", padding: "0 14px" }}>
    <PostcardPrintPanel
      accountId="account"
      batch={batch}
      cards={cards}
      canManage
      demo={false}
      onUpdated={async () => undefined}
    />
  </main>,
);
