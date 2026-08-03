import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clipboard,
  Download,
  ExternalLink,
  LoaderCircle,
  Printer,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  Unlink,
} from "lucide-react";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import type { QrStylePreset } from "../../entities/ar-item/model";
import { Button, ErrorState, Modal, Panel, Select, Skeleton, Toast } from "../../shared/ui";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { getArItemRepository } from "../ar-items/arItemRepository";
import {
  brandLogoDataUrl,
  parseQrStyle,
  qrDownloadName,
  qrStylePresets,
  resolvePublicBaseUrl,
  validatePublicQrUrl,
  validateQrDesign,
} from "./qrDesign";

const catalogRepository = getCatalogRepository();
const arItemRepository = getArItemRepository();
const printSizes = [30, 40, 50];

type PublicationAction = "publish" | "unpublish" | "rotate" | { style: QrStylePreset };

export function QrCodesRoute() {
  const auth = useAuth();
  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const itemsQuery = useQuery({
    queryKey: ["ar-items", "publication", workspaceQuery.data?.accountId],
    queryFn: () => arItemRepository.listItems(workspaceQuery.data!.accountId),
    enabled: Boolean(workspaceQuery.data?.accountId),
  });

  if (workspaceQuery.isPending || itemsQuery.isPending) return <QrLoading title="QR-коды" />;
  if (workspaceQuery.error || itemsQuery.error) {
    return <QrError title="QR-коды" error={workspaceQuery.error ?? itemsQuery.error} />;
  }

  const items = itemsQuery.data.filter((item) => item.status === "ready" || item.status === "published");
  return (
    <AppShell
      eyebrow={workspaceQuery.data.accountName}
      title="QR-коды"
      description="Публикуйте готовые AR-работы, проверяйте публичную ссылку и скачивайте QR для печати."
    >
      {items.length ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Готовые AR-публикации">
          {items.map((item) => (
            <Panel key={item.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="metric-icon">
                  <QrCode size={20} />
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === "published" ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-muted"
                  }`}
                >
                  {item.status === "published" ? "Опубликовано" : "Готово"}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                {item.status === "published"
                  ? "Публичный viewer активен; QR можно скачать повторно."
                  : "Processing завершён; публикация ещё не активна."}
              </p>
              <Link className="btn btn-ghost mt-5" to={`/items/${item.id}/qr`}>
                {item.status === "published" ? "Открыть QR" : "Опубликовать"}
              </Link>
            </Panel>
          ))}
        </section>
      ) : (
        <Panel className="mt-6 text-center">
          <QrCode className="mx-auto text-muted" size={36} />
          <h2 className="mt-4 text-xl font-semibold">Нет готовых AR-работ</h2>
          <p className="mt-2 text-sm text-muted">Завершите processing и техническую проверку в мастере.</p>
          <Link className="btn btn-primary mt-5" to="/items">
            Перейти к AR-работам
          </Link>
        </Panel>
      )}
    </AppShell>
  );
}

export function QrPublicationRoute() {
  const auth = useAuth();
  const { itemId = "" } = useParams();
  const queryClient = useQueryClient();
  const [confirmation, setConfirmation] = useState<"unpublish" | "rotate" | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [printSize, setPrintSize] = useState("40");
  const [notice, setNotice] = useState<{ title: string; message?: string; tone: "success" | "error" } | null>(
    null,
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const accountId = workspaceQuery.data?.accountId;
  const itemQuery = useQuery({
    queryKey: ["ar-item", accountId, itemId],
    queryFn: () => arItemRepository.getItem(accountId!, itemId),
    enabled: Boolean(accountId && itemId),
  });
  const qrQuery = useQuery({
    queryKey: ["ar-item", "qr", accountId, itemId],
    queryFn: () => arItemRepository.getQrCode(accountId!, itemId),
    enabled: Boolean(accountId && itemId),
  });

  const publicBase = useMemo(() => {
    try {
      return { value: resolvePublicBaseUrl(), error: null };
    } catch (error) {
      return { value: "", error: readableError(error) };
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (action: PublicationAction) => {
      if (!accountId) throw new Error("Рабочее пространство недоступно");
      if (action === "publish") return arItemRepository.publish(accountId, itemId, publicBase.value);
      if (action === "unpublish") return arItemRepository.unpublish(accountId, itemId);
      if (action === "rotate") return arItemRepository.rotatePublicSlug(accountId, itemId, publicBase.value);
      return arItemRepository.updateQrStyle(accountId, itemId, qrStylePresets[action.style]);
    },
    onSuccess: async (_, action) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ar-item", accountId, itemId] }),
        queryClient.invalidateQueries({ queryKey: ["ar-item", "qr", accountId, itemId] }),
        queryClient.invalidateQueries({ queryKey: ["ar-items"] }),
      ]);
      setConfirmation(null);
      setConfirmationText("");
      setNotice({
        title:
          action === "publish"
            ? "AR-работа опубликована"
            : action === "unpublish"
              ? "Публикация отключена"
              : action === "rotate"
                ? "Публичная ссылка обновлена"
                : "Стиль QR сохранён",
        tone: "success",
      });
    },
    onError: (error) => setNotice({ title: "Действие не выполнено", message: readableError(error), tone: "error" }),
  });

  if (workspaceQuery.isPending || itemQuery.isPending || qrQuery.isPending) return <QrLoading title="Публикация и QR" />;
  if (workspaceQuery.error || itemQuery.error || qrQuery.error) {
    return <QrError title="Публикация и QR" error={workspaceQuery.error ?? itemQuery.error ?? qrQuery.error} />;
  }

  const item = itemQuery.data;
  const qrCode = qrQuery.data;
  const style = parseQrStyle(qrCode?.style ?? qrStylePresets.white);
  const designValidation = validateQrDesign(style);
  const urlValidation = qrCode ? validatePublicQrUrl(qrCode.public_url, item.id) : { valid: false, issues: [] };
  const canPublish = item.status === "ready" && !publicBase.error && workspaceQuery.data.canWrite;
  const imageSize = Math.round(320 * style.logoScale);
  const imageSettings = style.logo
    ? { src: brandLogoDataUrl, width: imageSize, height: imageSize, excavate: true }
    : undefined;

  const copyPublicUrl = async () => {
    if (!qrCode) return;
    try {
      await navigator.clipboard.writeText(qrCode.public_url);
      setNotice({ title: "Ссылка скопирована", tone: "success" });
    } catch {
      setNotice({ title: "Не удалось скопировать ссылку", tone: "error" });
    }
  };

  const sharePublicUrl = async () => {
    if (!qrCode) return;
    try {
      const hasNativeShare = typeof navigator.share === "function";
      if (hasNativeShare) await navigator.share({ title: item.title, url: qrCode.public_url });
      else await navigator.clipboard.writeText(qrCode.public_url);
      setNotice({ title: hasNativeShare ? "Меню публикации открыто" : "Ссылка скопирована", tone: "success" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNotice({ title: "Не удалось поделиться ссылкой", tone: "error" });
    }
  };

  const downloadSvg = () => {
    if (!qrCode || !svgRef.current) return;
    const serialized = new XMLSerializer().serializeToString(svgRef.current);
    downloadBlob(new Blob([serialized], { type: "image/svg+xml;charset=utf-8" }), qrDownloadName(item.title, qrCode.version, "svg"));
  };

  const downloadPng = () => {
    if (!qrCode || !canvasRef.current) return;
    const link = document.createElement("a");
    link.download = qrDownloadName(item.title, qrCode.version, "png");
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <AppShell
      eyebrow="Publication boundary"
      title={item.title}
      description="Стабильная публичная ссылка, печатный QR и отзыв публикации без раскрытия внутренних идентификаторов."
      actions={
        <Link className="btn btn-quiet" to="/items">
          <ArrowLeft size={17} /> AR-работы
        </Link>
      }
    >
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-5">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Статус</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {item.status === "published" ? "Публичный viewer активен" : "Готово к публикации"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  {item.status === "published"
                    ? "Unpublish мгновенно закрывает manifest, а rotate отзывает старую ссылку и требует перепечатать QR."
                    : "Публикация доступна только для завершённой processing revision с проверенными marker/video assets."}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.status === "published" ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-muted"
                }`}
              >
                {item.status === "published" ? "Опубликовано" : item.status === "ready" ? "Готово" : item.status}
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-line bg-black/15 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Публичный base URL</p>
              <p className="mt-2 break-all font-mono text-sm">{publicBase.value || "Не настроен"}</p>
              <p className="mt-2 text-xs leading-5 text-muted">
                Настраивается через <code>VITE_PUBLIC_APP_URL</code>; production требует HTTPS. Custom domain меняет
                только origin, публичный capability slug остаётся случайным.
              </p>
              {publicBase.error ? <p className="mt-2 text-sm text-red-300">{publicBase.error}</p> : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {item.status === "ready" ? (
                <Button disabled={!canPublish || mutation.isPending} onClick={() => mutation.mutate("publish")}>
                  {mutation.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <QrCode size={16} />}
                  Опубликовать и создать QR
                </Button>
              ) : null}
              {item.status === "published" ? (
                <>
                  <Button variant="danger" disabled={mutation.isPending} onClick={() => setConfirmation("unpublish")}>
                    <Unlink size={16} /> Отключить публикацию
                  </Button>
                  <Button variant="quiet" disabled={mutation.isPending} onClick={() => setConfirmation("rotate")}>
                    <RefreshCw size={16} /> Обновить публичную ссылку
                  </Button>
                </>
              ) : null}
            </div>
          </Panel>

          {item.status === "published" && qrCode ? (
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Публичная ссылка</p>
                  <p className="mt-2 break-all font-mono text-sm" data-testid="public-qr-url">
                    {qrCode.public_url}
                  </p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted">QR v{qrCode.version}</span>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="ghost" onClick={() => void copyPublicUrl()}>
                  <Clipboard size={16} /> Копировать
                </Button>
                <Button variant="ghost" onClick={() => void sharePublicUrl()}>
                  <Share2 size={16} /> Поделиться
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.open(qrCode.public_url, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink size={16} /> Открыть
                </Button>
                <Button variant="ghost" onClick={() => window.print()}>
                  <Printer size={16} /> Тест печати
                </Button>
              </div>
            </Panel>
          ) : null}

          {item.status === "published" && qrCode ? (
            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Оформление QR</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(["white", "transparent", "brand"] as const).map((preset) => (
                  <button
                    key={preset}
                    aria-pressed={style.preset === preset}
                    className={`rounded-xl border p-4 text-left transition ${
                      style.preset === preset ? "border-primary bg-primary/10" : "border-line bg-white/[0.025]"
                    }`}
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ style: preset })}
                  >
                    <span className="font-semibold">
                      {preset === "white" ? "Белый" : preset === "transparent" ? "Прозрачный" : "AR Photo"}
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-muted">
                      {preset === "brand"
                        ? "Фирменный цвет и безопасный логотип"
                        : preset === "transparent"
                          ? "Для гарантированно светлого фона"
                          : "Максимальная совместимость"}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Select
                  label="Размер печати"
                  value={printSize}
                  onChange={(event) => setPrintSize(event.target.value)}
                  options={printSizes.map((size) => ({ label: `${size} × ${size} мм`, value: String(size) }))}
                />
                <div className="rounded-xl border border-line p-4 text-sm">
                  <p className="font-semibold">Readability gate</p>
                  <p className="mt-1 text-muted">
                    Quiet zone {style.quietZone} · ECC H · contrast {designValidation.contrastRatio.toFixed(1)}:1
                  </p>
                </div>
              </div>
            </Panel>
          ) : null}
        </div>

        <Panel className="h-fit xl:sticky xl:top-6">
          {item.status === "published" && qrCode ? (
            <div className="text-center" data-print-root>
              <div
                className="mx-auto grid max-w-[340px] place-items-center rounded-2xl p-3"
                data-print-qr
                data-testid="qr-preview"
                style={
                  {
                    background: style.background === "transparent" ? "#FFFFFF" : style.background,
                    "--qr-print-size": `${printSize}mm`,
                  } as CSSProperties
                }
              >
                <QRCodeSVG
                  ref={svgRef}
                  value={qrCode.public_url}
                  size={320}
                  level="H"
                  marginSize={style.quietZone}
                  fgColor={style.foreground}
                  bgColor={style.background}
                  imageSettings={imageSettings}
                  title={`QR: ${item.title}`}
                  className="h-auto w-full"
                />
                <QRCodeCanvas
                  ref={canvasRef}
                  value={qrCode.public_url}
                  size={1024}
                  level="H"
                  marginSize={style.quietZone}
                  fgColor={style.foreground}
                  bgColor={style.background}
                  imageSettings={
                    style.logo
                      ? {
                          src: brandLogoDataUrl,
                          width: Math.round(1024 * style.logoScale),
                          height: Math.round(1024 * style.logoScale),
                          excavate: true,
                        }
                      : undefined
                  }
                  className="hidden"
                  aria-hidden="true"
                />
              </div>
              <h2 className="mt-5 text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">Наведите камеру на QR, затем — на фотографию.</p>
              <div className="mt-5 grid grid-cols-2 gap-2" data-print-hide>
                <Button variant="ghost" onClick={downloadSvg}>
                  <Download size={16} /> SVG
                </Button>
                <Button variant="ghost" onClick={downloadPng}>
                  <Download size={16} /> PNG
                </Button>
              </div>
              <div
                className={`mt-5 rounded-xl border p-4 text-left text-sm ${
                  designValidation.valid && urlValidation.valid
                    ? "border-emerald-400/20 bg-emerald-400/5"
                    : "border-red-400/20 bg-red-400/5"
                }`}
              >
                <p className="flex items-center gap-2 font-semibold">
                  {designValidation.valid && urlValidation.valid ? (
                    <ShieldCheck className="text-emerald-300" size={18} />
                  ) : (
                    <QrCode className="text-red-300" size={18} />
                  )}
                  {designValidation.valid && urlValidation.valid ? "QR прошёл software gate" : "QR требует исправления"}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  URL не содержит UUID/PII/signed media; quiet zone, ECC H, контраст и logo scale проверены. Физический scan
                  test на втором устройстве остаётся launch gate.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-primary">
                <QrCode size={32} />
              </span>
              <h2 className="mt-5 text-xl font-semibold">QR появится после публикации</h2>
              <p className="mt-2 text-sm leading-6 text-muted">До этого public manifest остаётся закрыт.</p>
            </div>
          )}
        </Panel>
      </div>

      <Modal
        open={confirmation === "unpublish"}
        title="Отключить публикацию?"
        description="Публичный viewer сразу перестанет открываться. QR metadata сохранится для повторной публикации."
        onClose={() => setConfirmation(null)}
        actions={
          <Button variant="danger" disabled={mutation.isPending} onClick={() => mutation.mutate("unpublish")}>
            Отключить
          </Button>
        }
      />
      <Modal
        open={confirmation === "rotate"}
        title="Отозвать старую ссылку?"
        description="Старый QR перестанет работать немедленно. Все напечатанные материалы нужно будет заменить."
        onClose={() => {
          setConfirmation(null);
          setConfirmationText("");
        }}
        actions={
          <Button
            variant="danger"
            disabled={mutation.isPending || confirmationText !== "ОБНОВИТЬ"}
            onClick={() => mutation.mutate("rotate")}
          >
            Обновить ссылку
          </Button>
        }
      >
        <label className="grid gap-2 text-sm font-semibold">
          Введите ОБНОВИТЬ
          <input
            className="field-control"
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
          />
        </label>
      </Modal>

      {notice ? (
        <div className="fixed bottom-24 right-5 z-50 lg:bottom-6" data-print-hide>
          <Toast {...notice} onDismiss={() => setNotice(null)} />
        </div>
      ) : null}
    </AppShell>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 0);
}

function QrLoading({ title }: { title: string }) {
  return (
    <AppShell title={title}>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Panel>
          <Skeleton className="h-72" />
        </Panel>
        <Panel>
          <Skeleton className="h-72" />
        </Panel>
      </div>
    </AppShell>
  );
}

function QrError({ title, error }: { title: string; error: unknown }) {
  return (
    <AppShell title={title}>
      <div className="mt-6">
        <ErrorState text={readableError(error)} />
      </div>
    </AppShell>
  );
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}
