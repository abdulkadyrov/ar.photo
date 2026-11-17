import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Unlink,
  MoreHorizontal,
  Plus,
  ImageIcon,
  Search,
  Pencil,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { captureWorkspaceOrigin, rememberWorkspaceFocus, useWorkspaceBack } from "../ar-items/itemNavigation";
import { AppShell } from "../../app/layout/AppShell";
import type { ArItem, MediaAsset, QrStylePreset } from "../../entities/ar-item/model";
import { Button, ErrorState, Modal, Panel, Select, Skeleton, Toast } from "../../shared/ui";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { getMediaRepository } from "../media/mediaRepository";
import { getArItemRepository } from "../ar-items/arItemRepository";
import { clearPendingQuickStart, getPendingQuickStart } from "../quick-start/quickStartRepository";
import { brandLogoDataUrl, parseQrStyle, qrDownloadName, qrStylePresets, resolvePublicBaseUrl } from "./qrDesign";
import "./QrPublicationPage.css";

const catalogRepository = getCatalogRepository();
const arItemRepository = getArItemRepository();
const mediaRepository = getMediaRepository();
const printSizes = [30, 40, 50, 60];

type PublicationAction = "publish" | "unpublish" | "rotate" | { style: QrStylePreset };

export function QrCodesRoute() {
  const auth = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const projectId = searchParams.get("projectId") ?? "";
  const selectedIds = (searchParams.get("selected") ?? "").split(",").filter(Boolean);
  const setFilter = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace: true, state: location.state });
  };
  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const itemsQuery = useQuery({
    queryKey: ["ar-items", "publication", workspaceQuery.data?.accountId],
    queryFn: () => arItemRepository.listItems(workspaceQuery.data!.accountId),
    enabled: Boolean(workspaceQuery.data?.accountId),
  });

  const projectsQuery = useQuery({
    queryKey: ["catalog", "project-options", workspaceQuery.data?.accountId],
    queryFn: () => catalogRepository.listProjectOptions(workspaceQuery.data!.accountId),
    enabled: Boolean(workspaceQuery.data?.accountId),
  });
  const groupsQuery = useQuery({
    queryKey: ["catalog", "groups", workspaceQuery.data?.accountId, "all"],
    queryFn: () => catalogRepository.listGroups(workspaceQuery.data!.accountId),
    enabled: Boolean(workspaceQuery.data?.accountId),
  });
  const assetsQuery = useQuery({
    queryKey: ["media-assets", workspaceQuery.data?.accountId, "all"],
    queryFn: () => mediaRepository.listAssets(workspaceQuery.data!.accountId),
    enabled: Boolean(workspaceQuery.data?.accountId),
  });
  useWorkspaceBack(workspaceQuery.data?.accountId, "/items");
  const selectedItems = (itemsQuery.data ?? []).filter(
    (item) => item.status === "published" && selectedIds.includes(item.id),
  );
  const printQueries = useQueries({
    queries: selectedItems.map((item) => ({
      queryKey: ["ar-item", "qr", workspaceQuery.data?.accountId, item.id],
      queryFn: () => arItemRepository.getQrCode(workspaceQuery.data!.accountId, item.id),
      enabled: Boolean(workspaceQuery.data?.accountId),
    })),
  });
  const printable =
    printQueries.length > 0 && printQueries.every((query) => Boolean(query.data) && !query.isPending && !query.error);
  if (workspaceQuery.isPending || itemsQuery.isPending) return <QrLoading title="QR-коды" />;
  if (workspaceQuery.error || itemsQuery.error) {
    return <QrError title="QR-коды" error={workspaceQuery.error ?? itemsQuery.error} />;
  }

  const items = itemsQuery.data.filter(
    (item) =>
      (item.status === "ready" || item.status === "published") &&
      (!status || item.status === status) &&
      (!projectId || item.project_id === projectId) &&
      item.title.toLocaleLowerCase("ru-RU").includes(search.trim().toLocaleLowerCase("ru-RU")),
  );
  return (
    <AppShell
      eyebrow={workspaceQuery.data.accountName}
      title="QR-коды"
      description="QR-коды для просмотра ваших живых фото в дополненной реальности."
      showDescriptionOnMobile
      actions={
        <Link
          className="btn btn-primary qr-list-create"
          to="/create"
          state={captureWorkspaceOrigin(location, workspaceQuery.data.accountId)}
        >
          <Plus size={17} /> Создать AR-фото
        </Link>
      }
    >
      <div className="qr-list-filters">
        <label className="qr-list-search">
          <span className="sr-only">Поиск по названию</span>
          <Search size={17} />
          <input
            className="field-control"
            placeholder="Найти QR-код"
            value={search}
            onChange={(event) => setFilter("q", event.target.value)}
          />
        </label>
        <Select
          label="Проект"
          value={projectId}
          onChange={(event) => setFilter("projectId", event.target.value)}
          options={[
            { label: "Все проекты", value: "" },
            ...(projectsQuery.data ?? []).map((entry) => ({ label: entry.name, value: entry.id })),
          ]}
        />
        <Select
          label="Статус"
          value={status}
          onChange={(event) => setFilter("status", event.target.value)}
          options={[
            { label: "Все статусы", value: "" },
            { label: "Опубликовано", value: "published" },
            { label: "Готово к публикации", value: "ready" },
          ]}
        />
      </div>
      <div className="qr-list-selection" data-print-hide>
        <label>
          <input
            type="checkbox"
            aria-label="Выбрать все опубликованные QR"
            checked={
              items.filter((item) => item.status === "published").length > 0 &&
              items.filter((item) => item.status === "published").every((item) => selectedIds.includes(item.id))
            }
            onChange={(event) =>
              setFilter(
                "selected",
                event.target.checked
                  ? items
                      .filter((item) => item.status === "published")
                      .map((item) => item.id)
                      .join(",")
                  : "",
              )
            }
          />
          <span>Выбрано: {selectedItems.length}</span>
        </label>
        <Button disabled={!printable} onClick={() => window.print()}>
          <Printer size={16} /> Печать выбранных
        </Button>
        <span className="qr-list-total">Всего QR-кодов: {items.length}</span>
      </div>
      <div className="qr-print-batch" data-print-root>
        {selectedItems.map((item, index) =>
          printQueries[index]?.data ? (
            <figure key={item.id}>
              <QRCodeSVG
                value={printQueries[index].data!.public_url}
                size={220}
                level="H"
                marginSize={4}
                title={item.title}
              />
              <figcaption>
                <strong>{item.title}</strong>
                <p>KHANZAMA · AR-живое фото</p>
              </figcaption>
            </figure>
          ) : null,
        )}
      </div>
      {items.length ? (
        <section className="qr-list-table" aria-label="Готовые AR-публикации">
          <div className="qr-list-table-heading" aria-hidden="true">
            <span />
            <span>QR-код</span>
            <span>Работа</span>
            <span>Проект / группа</span>
            <span>Статус</span>
            <span>Обновлено</span>
            <span>Действия</span>
          </div>
          {items.map((item) => (
            <QrListRow
              key={item.id}
              item={item}
              accountId={workspaceQuery.data.accountId}
              marker={assetsQuery.data?.find((asset) => asset.id === item.marker_asset_id)}
              groupName={groupsQuery.data?.find((group) => group.id === item.group_id)?.name}
              projectName={projectsQuery.data?.find((project) => project.id === item.project_id)?.name}
              checked={selectedIds.includes(item.id)}
              onCheck={(checked) =>
                setFilter(
                  "selected",
                  (checked ? [...selectedIds, item.id] : selectedIds.filter((id) => id !== item.id)).join(","),
                )
              }
            />
          ))}
        </section>
      ) : (
        <Panel className="mt-6 text-center">
          <QrCode className="mx-auto text-muted" size={36} />
          <h2 className="mt-4 text-xl font-semibold">Нет подходящих AR-работ</h2>
          <p className="mt-2 text-sm text-muted">Завершите обработку AR-работы, чтобы подготовить QR-код.</p>
          <Link className="btn btn-primary mt-5" to="/items">
            Перейти к AR-работам
          </Link>
        </Panel>
      )}
    </AppShell>
  );
}

function QrListRow({
  accountId,
  item,
  marker,
  projectName,
  groupName,
  checked,
  onCheck,
}: {
  accountId: string;
  item: ArItem;
  marker?: MediaAsset;
  projectName?: string;
  groupName?: string;
  checked: boolean;
  onCheck(checked: boolean): void;
}) {
  const location = useLocation();
  const svg = useRef<SVGSVGElement>(null);
  const qrQuery = useQuery({
    queryKey: ["ar-item", "qr", accountId, item.id],
    queryFn: () => arItemRepository.getQrCode(accountId, item.id),
  });
  const markerQuery = useQuery({
    queryKey: ["media-preview", marker?.id, marker?.version],
    queryFn: () => mediaRepository.getAssetUrl(marker!),
    enabled: Boolean(marker),
    staleTime: 8 * 60_000,
  });
  const forward = captureWorkspaceOrigin(location, accountId);
  return (
    <article className="qr-list-row">
      <input
        type="checkbox"
        aria-label={`Выбрать QR ${item.title}`}
        disabled={item.status !== "published"}
        checked={checked}
        onChange={(event) => onCheck(event.target.checked)}
      />
      <span className="qr-list-code">
        {qrQuery.data ? (
          <QRCodeSVG ref={svg} value={qrQuery.data.public_url} size={56} level="M" title={`QR: ${item.title}`} />
        ) : (
          <QrCode size={24} />
        )}
      </span>
      <div className="qr-list-work">
        <span className="qr-list-photo">
          {markerQuery.data ? <img src={markerQuery.data} alt="" /> : <ImageIcon size={18} />}
        </span>
        <div>
          <h2 title={item.title}>{item.title}</h2>
          <p>Живое фото (AR)</p>
          <span className="qr-list-mobile-project">{groupName ?? projectName ?? "—"}</span>
        </div>
      </div>
      <span className="qr-list-project">{groupName ?? projectName ?? "—"}</span>
      <span className={`qr-list-status ${item.status === "published" ? "qr-list-status-live" : ""}`}>
        {item.status === "published" ? "Активен" : "Готово"}
      </span>
      <time className="qr-list-date" dateTime={item.updated_at}>
        {new Date(item.updated_at).toLocaleDateString("ru-RU")}
        <span>{new Date(item.updated_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
      </time>
      <div className="qr-list-actions">
        <Link
          id={`qr-list-open-${item.id}`}
          className="btn btn-primary"
          aria-label="Открыть QR"
          to={`/items/${item.id}/qr`}
          state={forward}
          onClick={() => rememberWorkspaceFocus(location.key, `qr-list-open-${item.id}`)}
        >
          <ExternalLink size={15} />
          Открыть
        </Link>
        <Button
          variant="quiet"
          disabled={!qrQuery.data}
          onClick={() => {
            if (svg.current)
              downloadBlob(
                new Blob([new XMLSerializer().serializeToString(svg.current)], { type: "image/svg+xml;charset=utf-8" }),
                qrDownloadName(item.title, qrQuery.data!.version, "svg"),
              );
          }}
        >
          <Download size={15} /> Скачать
        </Button>
        <details className="qr-list-more">
          <summary aria-label={`Действия ${item.title}`}>
            <MoreHorizontal size={18} />
          </summary>
          <div>
            <Link to={`/items/${item.id}`} state={forward}>
              Открыть работу
            </Link>
            <Link to={`/items/${item.id}/edit`} state={forward}>
              Изменить работу
            </Link>
          </div>
        </details>
      </div>
    </article>
  );
}

function QrIdentityThumbnail({ accountId, item }: { accountId: string; item: ArItem }) {
  const assets = useQuery({
    queryKey: ["media-assets", accountId, item.project_id],
    queryFn: () => mediaRepository.listAssets(accountId, item.project_id),
  });
  const marker = assets.data?.find((asset) => asset.id === item.marker_asset_id);
  const url = useQuery({
    queryKey: ["media-preview", marker?.id, marker?.version],
    queryFn: () => mediaRepository.getAssetUrl(marker!),
    enabled: Boolean(marker),
    staleTime: 8 * 60_000,
  });
  return (
    <span className="qr-identity-photo">{url.data ? <img src={url.data} alt="" /> : <ImageIcon size={22} />}</span>
  );
}

export function QrPublicationRoute() {
  const auth = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { itemId = "" } = useParams();
  const queryClient = useQueryClient();
  const [defaultPrintOpen, setDefaultPrintOpen] = useState(() => window.matchMedia("(min-width: 700px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 700px)");
    const update = () => setDefaultPrintOpen(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const printOpen = searchParams.get("print") === "expanded" || (!searchParams.has("print") && defaultPrintOpen);
  const [confirmation, setConfirmation] = useState<"unpublish" | "rotate" | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const requestedSize = searchParams.get("size") ?? "60";
  const printSize = printSizes.some((size) => String(size) === requestedSize) ? requestedSize : "60";
  const printCaption = searchParams.get("caption");
  const setPrintOption = (name: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value !== null) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace: true, state: location.state });
  };
  const [notice, setNotice] = useState<{ title: string; message?: string; tone: "success" | "error" } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoPublishAttempted = useRef(false);
  const pendingQuickStart = useMemo(() => getPendingQuickStart(auth.session!.user.id), [auth.session]);

  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const accountId = workspaceQuery.data?.accountId;
  const goBack = useWorkspaceBack(accountId, `/items/${itemId}`);
  const itemQuery = useQuery({
    queryKey: ["ar-item", accountId, itemId],
    queryFn: () => arItemRepository.getItem(accountId!, itemId),
    enabled: Boolean(accountId && itemId),
    refetchInterval: (query) =>
      query.state.data && ["ready", "published", "failed"].includes(query.state.data.status) ? false : 2_500,
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
      if (action === "publish" && pendingQuickStart?.itemId === itemId) {
        clearPendingQuickStart(auth.session!.user.id);
      }
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

  useEffect(() => {
    const item = itemQuery.data;
    if (
      autoPublishAttempted.current ||
      pendingQuickStart?.itemId !== itemId ||
      item?.status !== "ready" ||
      !accountId ||
      !workspaceQuery.data?.canWrite ||
      publicBase.error ||
      mutation.isPending
    ) {
      return;
    }
    autoPublishAttempted.current = true;
    mutation.mutate("publish");
  }, [accountId, itemId, itemQuery.data, mutation, pendingQuickStart, publicBase.error, workspaceQuery.data]);

  if (workspaceQuery.isPending || itemQuery.isPending || qrQuery.isPending)
    return <QrLoading title="Публикация и QR" />;
  if (workspaceQuery.error || itemQuery.error || qrQuery.error) {
    return <QrError title="Публикация и QR" error={workspaceQuery.error ?? itemQuery.error ?? qrQuery.error} />;
  }

  const item = itemQuery.data;
  const qrCode = qrQuery.data;
  const style = parseQrStyle(qrCode?.style ?? qrStylePresets.white);
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
    downloadBlob(
      new Blob([serialized], { type: "image/svg+xml;charset=utf-8" }),
      qrDownloadName(item.title, qrCode.version, "svg"),
    );
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
      title="QR и публикация"
      actions={
        <button className="btn btn-quiet qr-back-link" type="button" onClick={goBack}>
          <ArrowLeft size={17} /> <span>Назад</span>
        </button>
      }
    >
      <div className="qr-publication-page">
        <Panel className="qr-identity-strip">
          <QrIdentityThumbnail accountId={accountId!} item={item} />
          <div>
            <h2>{item.title}</h2>
            <span className={`qr-status-pill ${item.status === "published" ? "qr-status-published" : ""}`}>
              {item.status === "published" ? "Опубликовано" : item.status === "ready" ? "Готово" : "Подготовка"}
            </span>
          </div>
          <Link
            className="btn btn-quiet"
            to={`/items/${itemId}/edit`}
            state={captureWorkspaceOrigin(location, accountId)}
          >
            <Pencil size={16} />
            <span>Изменить работу</span>
          </Link>
        </Panel>
        {item.status === "ready" ? (
          <Panel className="qr-publish-card">
            <span className="qr-status-pill">Готово</span>
            <h2>Всё подготовлено</h2>
            <p>Опубликуйте AR-фото, чтобы получить ссылку и QR-код.</p>
            {publicBase.error ? <p className="qr-publication-error">{publicBase.error}</p> : null}
            <Button full disabled={!canPublish || mutation.isPending} onClick={() => mutation.mutate("publish")}>
              {mutation.isPending ? <LoaderCircle className="animate-spin" size={17} /> : <QrCode size={17} />}
              Опубликовать и создать QR
            </Button>
          </Panel>
        ) : null}

        {item.status === "published" && qrCode ? (
          <>
            <Panel className="qr-primary-card">
              <h2 className="qr-card-heading">QR-код работы</h2>
              <div className="qr-print-content" data-print-root>
                <div
                  className="qr-code-frame"
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
                <h2>{printCaption ?? item.title}</h2>
                <p className="qr-print-brand">KHANZAMA</p>
              </div>
            </Panel>
            <Panel className="qr-link-card" data-print-hide>
              <div className="qr-link-block">
                <label htmlFor="public-qr-url">Публичная ссылка</label>
                <div className="qr-link-field">
                  <p id="public-qr-url" title={qrCode.public_url} data-testid="public-qr-url">
                    {qrCode.public_url}
                  </p>
                  <button aria-label="Копировать публичную ссылку" onClick={() => void copyPublicUrl()}>
                    <Clipboard size={18} />
                  </button>
                </div>
              </div>
              <div className="qr-link-actions">
                <Button variant="quiet" onClick={() => void copyPublicUrl()} aria-label="Копировать ссылку">
                  <Clipboard size={16} />
                  <span>Копировать</span>
                </Button>
                <Button variant="quiet" onClick={() => void sharePublicUrl()} aria-label="Поделиться ссылкой">
                  <Share2 size={16} />
                  <span>Поделиться</span>
                </Button>
                <Button
                  className="qr-open-button"
                  onClick={() => window.open(qrCode.public_url, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink size={17} /> Открыть AR
                </Button>
              </div>
            </Panel>

            <details className="qr-extra-card" data-print-hide open={printOpen}>
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  setPrintOption("print", printOpen ? "collapsed" : "expanded");
                }}
              >
                Печать и оформление QR
              </summary>
              <div className="qr-extra-content">
                <section>
                  <h2>Печать QR-кода</h2>
                  <div className="qr-print-fields">
                    {" "}
                    <label className="grid gap-2 text-sm font-medium">
                      Подпись для печати
                      <input
                        className="field-control"
                        value={printCaption ?? item.title}
                        maxLength={160}
                        onChange={(event) => setPrintOption("caption", event.target.value)}
                      />
                    </label>
                    <Select
                      label="Размер печати"
                      value={printSize}
                      onChange={(event) => setPrintOption("size", event.target.value)}
                      options={printSizes.map((size) => ({ label: `${size} × ${size} мм`, value: String(size) }))}
                    />
                  </div>
                  <div className="qr-download-actions">
                    <Button variant="ghost" onClick={downloadSvg}>
                      <Download size={16} /> SVG
                    </Button>
                    <Button variant="ghost" onClick={downloadPng}>
                      <Download size={16} /> Скачать PNG
                    </Button>
                    <Button variant="ghost" onClick={() => window.print()}>
                      <Printer size={16} /> Печать / PDF
                    </Button>
                  </div>
                </section>

                <section>
                  <h2>Оформление</h2>
                  <div className="qr-style-options">
                    {(["white", "transparent", "brand"] as const).map((preset) => (
                      <button
                        key={preset}
                        aria-pressed={style.preset === preset}
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate({ style: preset })}
                      >
                        {preset === "white" ? "Белый" : preset === "transparent" ? "Прозрачный" : "AR Photo"}
                      </button>
                    ))}
                  </div>
                </section>

                <details className="qr-publication-actions">
                  <summary className="cursor-pointer py-3 text-sm font-semibold">Управление публикацией</summary>
                  <Button variant="quiet" disabled={mutation.isPending} onClick={() => setConfirmation("rotate")}>
                    <RefreshCw size={16} /> Обновить публичную ссылку
                  </Button>
                  <Button variant="danger" disabled={mutation.isPending} onClick={() => setConfirmation("unpublish")}>
                    <Unlink size={16} /> Отключить публикацию
                  </Button>
                </details>
              </div>
            </details>
          </>
        ) : null}
      </div>

      <Modal
        open={confirmation === "unpublish"}
        title="Отключить публикацию?"
        description="Публичный viewer сразу перестанет открываться. Данные QR сохранятся для повторной публикации."
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
