import { useEffect, useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { Button, Input, Panel } from "../../shared/ui";
import type { PreparedMedia } from "../../entities/media/model";
import { getMediaRepository } from "../media/mediaRepository";
import type { PostcardBatch, PostcardCard, PostcardShop } from "./postcardModel";
import { getPostcardRepository } from "./postcardRepository";

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
function showPrint(blob: Blob, preview: Window | null, name: string) {
  if (!preview) {
    saveBlob(blob, name);
    return;
  }
  const url = URL.createObjectURL(blob);
  preview.opener = null;
  preview.location.href = url;
  setTimeout(() => URL.revokeObjectURL(url), 300_000);
}

export default function PostcardPrintPanel({
  accountId,
  batch,
  cards,
  shop,
  canManage,
  demo,
  onUpdated,
}: {
  accountId: string;
  batch: PostcardBatch;
  cards: PostcardCard[];
  shop?: PostcardShop;
  canManage: boolean;
  demo: boolean;
  onUpdated: () => Promise<unknown>;
}) {
  const [start, setStart] = useState("1");
  const [count, setCount] = useState(String(Math.min(cards.length, 10)));
  const [pending, setPending] = useState(false);
  const [canCancel, setCanCancel] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const selected = cards.filter((card) => card.ordinal >= Number(start)).slice(0, Number(count));
  const valid =
    Number.isInteger(Number(start)) &&
    Number(start) >= 1 &&
    Number.isInteger(Number(count)) &&
    Number(count) >= 1 &&
    Number(count) <= 20 &&
    selected.length === Number(count);
  const exportCards = async (format: "zip" | "photo" | "a4") => {
    const preview = format !== "zip" ? window.open("about:blank", "_blank") : null;
    setPending(true);
    setCanCancel(true);
    setError("");
    controller.current = new AbortController();
    try {
      if (demo)
        throw new Error("Рабочие QR выпускаются в подключённом кабинете. Демо не сохраняет открытки на сервере.");
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Сервер недоступен.");
      const { data: preparedBatch, error: batchError } = await client.rpc("postcard_prepare_batch", {
        p_account_id: accountId,
        p_batch_id: batch.id,
      });
      if (batchError || !preparedBatch?.project_id || !preparedBatch.group_id)
        throw new Error("Не удалось подготовить тираж. Проверьте права и доступные проекты/группы в пакете.");
      const printing = await import("./postcardPrint");
      const canonical: Array<{ publicToken: string; blob: Blob }> = [];
      for (const [index, card] of selected.entries()) {
        if (controller.current.signal.aborted) throw new DOMException("Aborted", "AbortError");
        setProgress(`Готовим открытку ${index + 1} из ${selected.length}`);
        let assetId = card.print_marker_asset_id;
        let blob: Blob;
        if (assetId) {
          const asset = await client
            .from("media_assets")
            .select("*")
            .eq("id", assetId)
            .eq("account_id", accountId)
            .is("deleted_at", null)
            .single();
          if (asset.error || !asset.data)
            throw new Error("Печатное изображение недоступно. Обновите тираж и повторите.");
          const signed = await getMediaRepository().getAssetUrl(asset.data);
          const response = await fetch(signed, { signal: controller.current.signal });
          if (!response.ok) throw new Error("Не удалось скачать сохранённую открытку.");
          blob = await response.blob();
        } else {
          blob = await printing.renderPostcard(batch.template_code, card.public_token);
          const file = new File([blob], `postcard-${card.public_token}.png`, { type: "image/png" });
          const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
          const sha256 = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
          const prepared: PreparedMedia = {
            file,
            kind: "marker",
            sha256,
            metadata: {
              width: 1200,
              height: 1800,
              exifStripped: true,
              optimization: {
                strategy: "adaptive-image",
                originalWidth: 1200,
                originalHeight: 1800,
                originalBytes: file.size,
                uploadBytes: file.size,
                savedBytes: 0,
                reductionPercent: 0,
                optimized: false,
              },
            },
          };
          const asset = await getMediaRepository().upload(
            {
              accountId,
              projectId: preparedBatch.project_id,
              groupId: preparedBatch.group_id,
              kind: "marker",
              file,
              requestId: card.id,
            },
            prepared,
            ({ uploadedBytes, totalBytes }) =>
              setProgress(
                `Сохраняем открытку ${index + 1} из ${selected.length}: ${Math.round((uploadedBytes / totalBytes) * 100)}%`,
              ),
            controller.current.signal,
          );
          assetId = asset.id;
          const attached = await client.rpc("postcard_attach_print_marker", {
            p_account_id: accountId,
            p_card_id: card.id,
            p_asset_id: assetId,
          });
          if (attached.error)
            throw new Error("Не удалось закрепить печатное изображение за открыткой. Обновите список и повторите.");
        }
        canonical.push({ publicToken: card.public_token, blob });
      }
      setProgress("Собираем файл…");
      if (format === "zip")
        saveBlob(
          await printing.createPostcardZip(batch.template_code, canonical),
          `postcards-${batch.id}-${start}.zip`,
        );
      else
        showPrint(
          await printing.createPostcardPrintHtml(batch.template_code, canonical, format),
          preview,
          `postcards-${batch.id}.html`,
        );
      setProgress(`Готово: ${canonical.length} открыток с настоящими QR.`);
      await onUpdated();
    } catch (e) {
      preview?.close();
      setError(
        e instanceof Error && e.name !== "AbortError"
          ? e.message
          : "Подготовка остановлена. Уже сохранённые открытки останутся в тираже — можно продолжить.",
      );
      await onUpdated();
    } finally {
      setPending(false);
      setCanCancel(false);
      controller.current = null;
    }
  };
  const inserts = async () => {
    if (!shop) return;
    const preview = window.open("about:blank", "_blank");
    setPending(true);
    setError("");
    try {
      const code = await (await getPostcardRepository()).getShopCode(accountId, shop.id);
      const { createShopActivationInsertHtml } = await import("./postcardPrint");
      showPrint(
        createShopActivationInsertHtml(shop.name, code, Number(count)),
        preview,
        `activation-inserts-${shop.id}.html`,
      );
    } catch {
      preview?.close();
      setError("Не удалось подготовить вкладыши магазина. Повторите попытку.");
    } finally {
      setPending(false);
    }
  };
  return (
    <Panel className="postcards-print-panel">
      <h2>Печать открыток 10 × 15 см</h2>
      <p className="postcards-muted">
        Сначала сохраняем точное печатное изображение для AR, затем выдаём файл. До 20 открыток за одну выгрузку.
        Повторная печать сохраняет те же QR; для новых экземпляров создайте новый тираж.
      </p>
      <fieldset disabled={pending || !canManage} className="postcards-print-options">
        <label>
          Начать с номера
          <Input type="number" min={1} max={cards.length} value={start} onValueChange={setStart} />
        </label>
        <label>
          Количество для печати
          <Input type="number" min={1} max={20} value={count} onValueChange={setCount} />
        </label>
        <div className="postcards-actions">
          <Button icon={<Download size={17} />} disabled={!valid || demo} onClick={() => void exportCards("zip")}>
            Скачать PNG в ZIP
          </Button>
          <Button
            variant="ghost"
            icon={<Printer size={17} />}
            disabled={!valid || demo}
            onClick={() => void exportCards("photo")}
          >
            Печать 10 × 15
          </Button>
          <Button variant="ghost" disabled={!valid || demo} onClick={() => void exportCards("a4")}>
            Печать на A4
          </Button>
        </div>
        <Button variant="quiet" disabled={!shop || !valid || demo} onClick={() => void inserts()}>
          Вкладыши с кодом магазина
        </Button>
      </fieldset>
      {pending && canCancel && (
        <Button variant="quiet" onClick={() => controller.current?.abort()}>
          Остановить подготовку
        </Button>
      )}
      {progress && (
        <p role="status" className="postcards-muted">
          {progress}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {demo && <p className="postcards-muted">Выпуск рабочих QR доступен в подключённом кабинете.</p>}
      <p className="postcards-muted">
        Код магазина печатается на отдельном вкладыше. После подготовки передайте экземпляры магазину — тогда покупатель
        сможет активировать их.
      </p>
    </Panel>
  );
}
