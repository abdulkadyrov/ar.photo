import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { Check, Download, Eye, EyeOff, PackagePlus, Plus, Store, ScanLine } from "lucide-react";
import { AppShell } from "../../app/layout/AppShell";
import { Button, ErrorState, Input, Panel, Select } from "../../shared/ui";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { getSettingsRepository } from "../settings/settingsRepository";
import { getPostcardRepository } from "./postcardRepository";
import {
  cardInventoryCode,
  canMoveCard,
  findScannedCard,
  postcardTemplates,
  type MovementInput,
  type PostcardBatch,
  type PostcardCard,
  type PostcardShop,
} from "./postcardModel";
import { PostcardTemplatePicker, PostcardTemplatePreview } from "./PostcardTemplatePicker";
import "./PostcardsPage.css";

const PostcardScanner = lazy(() => import("./PostcardScanner").then((module) => ({ default: module.PostcardScanner })));
const PostcardPrintPanel = lazy(() => import("./PostcardPrintPanel"));

const kinds = { assign: "Передать магазину", sell: "Отметить продажу", return: "Вернуть на склад" };
type CreationKind = "shop" | "batch";
type CreationDraft = {
  name: string;
  address: string;
  template: (typeof postcardTemplates)[number]["code"] | null;
  quantity: string;
};
// Scoped to account + browser history entry. No activation codes or media are retained.
const creationDrafts = new Map<string, CreationDraft>();
const activeCreationForms = new Map<string, CreationKind>();

export function PostcardsRoute() {
  const auth = useAuth();
  const workspace = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => getCatalogRepository().getWorkspace(auth.session!.user.id),
  });
  return (
    <AppShell title="AR-открытки" description="Тиражи, магазины и учёт реализации" showDescriptionOnMobile>
      {workspace.isPending ? (
        <p role="status">Загружаем кабинет…</p>
      ) : workspace.error ? (
        <ErrorState
          text="Не удалось открыть кабинет."
          action={<Button onClick={() => void workspace.refetch()}>Повторить</Button>}
        />
      ) : (
        <PostcardsWorkspace
          key={workspace.data.accountId}
          accountId={workspace.data.accountId}
          canManage={workspace.data.canWrite && ["owner", "manager", "superadmin"].includes(workspace.data.memberRole)}
          demo={auth.mode === "demo"}
        />
      )}
    </AppShell>
  );
}

function PostcardsWorkspace({ accountId, canManage, demo }: { accountId: string; canManage: boolean; demo: boolean }) {
  const cache = useQueryClient();
  const entitlements = useQuery({
    queryKey: ["settings", "entitlements", accountId],
    queryFn: () => getSettingsRepository().getEntitlements(accountId),
    enabled: !demo,
    refetchInterval: 30_000,
  });
  const location = useLocation();
  const draftScope = `${accountId}:${location.key}`;
  const [batchId, setBatchId] = useState("");
  const [shopId, setShopId] = useState("");
  const [form, setForm] = useState<CreationKind | null>(() => activeCreationForms.get(draftScope) ?? null);
  const [formBusy, setFormBusy] = useState(false);
  const formDirty = useRef(false);
  const onDirtyChange = useCallback((dirty: boolean) => {
    formDirty.current = dirty;
  }, []);
  const closeForm = (next: CreationKind | null) => {
    if (formBusy) return;
    if (formDirty.current && !window.confirm("Закрыть форму и удалить несохранённые изменения?")) return;
    if (form) creationDrafts.delete(`${draftScope}:${form}`);
    formDirty.current = false;
    if (next) activeCreationForms.set(draftScope, next);
    else activeCreationForms.delete(draftScope);
    setForm(next);
  };
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (!formDirty.current && !formBusy) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const navigate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.href === window.location.href)
        return;
      if (
        formBusy ||
        (formDirty.current &&
          !window.confirm("Покинуть форму? Черновик сохранится при возврате кнопкой «Назад» в этой вкладке."))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", navigate, true);
    };
  }, [formBusy]);
  const [selected, setSelected] = useState<string[]>([]);
  const [scan, setScan] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [kind, setKind] = useState<MovementInput["kind"]>("assign");
  const [message, setMessage] = useState("");
  const [scanError, setScanError] = useState("");
  const [shopCode, setShopCode] = useState<{ shopId: string; code: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);
  const operationRequest = useRef({ fingerprint: "", id: "" });
  const shops = useQuery({
    queryKey: ["postcards", accountId, "shops"],
    queryFn: async () => (await getPostcardRepository()).listShops(accountId),
  });
  const batches = useQuery({
    queryKey: ["postcards", accountId, "batches"],
    queryFn: async () => (await getPostcardRepository()).listBatches(accountId),
  });
  const currentBatchId = batchId || batches.data?.[0]?.id || "";
  const currentShopId = shopId || shops.data?.[0]?.id || "";
  const cards = useQuery({
    queryKey: ["postcards", accountId, "cards", currentBatchId],
    queryFn: async () => (await getPostcardRepository()).listCards(accountId, currentBatchId),
    enabled: Boolean(currentBatchId),
  });
  const movements = useQuery({
    queryKey: ["postcards", accountId, "movements"],
    queryFn: async () => (await getPostcardRepository()).listMovements(accountId),
  });
  const report = useQuery({
    queryKey: ["postcards", accountId, "report"],
    queryFn: async () => (await getPostcardRepository()).getShopReport(accountId),
  });
  const invalidate = () => cache.invalidateQueries({ queryKey: ["postcards", accountId] });
  const move = useMutation({
    mutationFn: async () => {
      const input = { kind, shopId: currentShopId, cardIds: [...selected].sort() };
      const fingerprint = JSON.stringify(input);
      if (operationRequest.current.fingerprint !== fingerprint)
        operationRequest.current = { fingerprint, id: crypto.randomUUID() };
      return (await getPostcardRepository()).moveCards(accountId, input, operationRequest.current.id);
    },
    onSuccess: async (result) => {
      setSelected([]);
      setConfirm(false);
      setScan("");
      setScanError("");
      setMessage(`Сохранено: ${kinds[result.kind].toLowerCase()}, ${result.card_ids.length} шт.`);
      operationRequest.current = { fingerprint: "", id: "" };
      await invalidate();
    },
  });
  const reveal = useMutation({
    mutationFn: async () => ({
      shopId: currentShopId,
      code: await (await getPostcardRepository()).getShopCode(accountId, currentShopId),
    }),
    onSuccess: setShopCode,
  });
  const currentShop = shops.data?.find((s) => s.id === currentShopId);
  const shopStats = report.data?.find((s) => s.shopId === currentShopId);
  const currentBatch = batches.data?.find((b) => b.id === currentBatchId);
  const eligible = (cards.data ?? []).filter((c) => canMoveCard(c, { kind, shopId: currentShopId }));
  const selectedCards = (cards.data ?? []).filter((c) => selected.includes(c.id));
  const canMove = Boolean(
    canManage &&
    currentShop &&
    selected.length &&
    selectedCards.length === selected.length &&
    selectedCards.every((c) => canMoveCard(c, { kind, shopId: currentShopId })),
  );
  const error = shops.error || batches.error || cards.error || movements.error;

  const resetSelection = () => {
    setSelected([]);
    setConfirm(false);
    setScanError("");
    move.reset();
  };
  const addScannedCode = (value: string) => {
    const card = findScannedCard(value, cards.data ?? []);
    if (!card) {
      const message = "Открытка не найдена в выбранном тираже. Проверьте номер и тираж.";
      setScanError(message);
      return { accepted: false, message };
    }
    if (!canMoveCard(card, { kind, shopId: currentShopId })) {
      const message = "Открытка недоступна для выбранного действия.";
      setScanError(message);
      return { accepted: false, message };
    }
    if (selected.includes(card.id)) {
      const message = "Эта открытка уже выбрана.";
      setScanError(message);
      return { accepted: false, message };
    }
    setSelected((old) => [...old, card.id]);
    setScan("");
    setScanError("");
    setConfirm(false);
    scanRef.current?.focus();
    return { accepted: true, message: `Открытка ${card.ordinal} добавлена.` };
  };
  const submitScan = (event: FormEvent) => {
    event.preventDefault();
    addScannedCode(scan);
  };
  return (
    <div className="postcards-workspace">
      {scannerOpen && (
        <Suspense fallback={<p role="status">Открываем сканер…</p>}>
          <PostcardScanner onDetected={addScannedCode} onClose={() => setScannerOpen(false)} />
        </Suspense>
      )}
      {demo && <p className="postcards-stage">Демо · данные только в этом браузере.</p>}
      {!canManage && <p className="postcards-stage">Только просмотр.</p>}
      <div className="postcards-actions">
        <Button
          icon={<PackagePlus size={18} />}
          disabled={!canManage || formBusy}
          onClick={() => closeForm(form === "batch" ? null : "batch")}
        >
          Создать тираж
        </Button>
        <Button
          variant="ghost"
          icon={<Plus size={18} />}
          disabled={!canManage || formBusy}
          onClick={() => closeForm(form === "shop" ? null : "shop")}
        >
          Добавить магазин
        </Button>
      </div>
      {form && (
        <CreateForm
          key={form}
          kind={form}
          accountId={accountId}
          draftKey={`${draftScope}:${form}`}
          onDirtyChange={onDirtyChange}
          onBusyChange={setFormBusy}
          onCancel={() => closeForm(null)}
          onCreated={async (id) => {
            if (form === "shop") {
              setShopId(id);
              setShopCode(null);
            } else {
              setBatchId(id);
              resetSelection();
            }
            setForm(null);
            creationDrafts.delete(`${draftScope}:${form}`);
            activeCreationForms.delete(draftScope);
            formDirty.current = false;
            setMessage(
              form === "shop"
                ? "Магазин добавлен. Для него создан общий код активации."
                : "Тираж создан. Все экземпляры находятся на складе.",
            );
            await invalidate();
          }}
        />
      )}
      {message && (
        <p role="status" className="postcards-success">
          <Check size={18} />
          {message}
        </p>
      )}
      {error ? (
        <ErrorState
          text={error.message}
          action={<Button onClick={() => void invalidate()}>Повторить загрузку</Button>}
        />
      ) : shops.isPending || batches.isPending ? (
        <p role="status">Загружаем магазины и тиражи…</p>
      ) : (
        <>
          <Panel>
            <div className="postcards-section-title">
              <Store size={20} />
              <h2>Магазин</h2>
            </div>
            {shops.data.length ? (
              <>
                <Select
                  label="Точка реализации"
                  value={currentShopId}
                  options={shops.data.map((s) => ({ value: s.id, label: s.name }))}
                  onChange={(e) => {
                    setShopId(e.target.value);
                    setShopCode(null);
                    reveal.reset();
                    resetSelection();
                  }}
                />
                {currentShop?.address && <p className="postcards-muted">{currentShop.address}</p>}
                {shopStats ? (
                  <dl className="postcards-counts" aria-label="Учёт магазина">
                    <div>
                      <dt>Передано всего</dt>
                      <dd>{shopStats.delivered}</dd>
                    </div>
                    <div>
                      <dt>Продано</dt>
                      <dd>{shopStats.sold}</dd>
                    </div>
                    <div>
                      <dt>Остаток</dt>
                      <dd>{shopStats.stock}</dd>
                    </div>
                    <div>
                      <dt>Возвращено</dt>
                      <dd>{shopStats.returned}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="postcards-muted" role={report.error ? "alert" : "status"}>
                    {report.error ? "Не удалось загрузить показатели магазина." : "Загружаем показатели магазина…"}
                    {report.error && (
                      <Button variant="quiet" onClick={() => void report.refetch()}>
                        Повторить
                      </Button>
                    )}
                  </p>
                )}
                {canManage && (
                  <div className="postcards-code-row">
                    <Button
                      variant="quiet"
                      icon={shopCode?.shopId === currentShopId ? <EyeOff size={17} /> : <Eye size={17} />}
                      disabled={reveal.isPending}
                      onClick={() => {
                        if (shopCode?.shopId === currentShopId) setShopCode(null);
                        else reveal.mutate();
                      }}
                    >
                      {shopCode?.shopId === currentShopId ? "Скрыть код магазина" : "Показать код магазина"}
                    </Button>
                    {shopCode?.shopId === currentShopId && (
                      <output aria-label="Код активации магазина">{shopCode.code}</output>
                    )}
                  </div>
                )}
                {reveal.error && <p role="alert">{reveal.error.message}</p>}
              </>
            ) : (
              <p className="postcards-muted">Магазинов пока нет.</p>
            )}
          </Panel>
          <Panel>
            <div className="postcards-section-title">
              <h2>Тираж и экземпляры</h2>
              {currentBatch && (
                <Button
                  variant="quiet"
                  icon={<Download size={17} />}
                  onClick={() => exportInventory(currentBatch, cards.data ?? [], shops.data ?? [])}
                  disabled={!cards.data?.length}
                >
                  Скачать список CSV
                </Button>
              )}
            </div>
            {batches.data.length ? (
              <>
                <Select
                  label="Тираж · последние 100"
                  value={currentBatchId}
                  options={batches.data.map((b) => ({ value: b.id, label: `${b.name} · ${b.quantity} шт.` }))}
                  onChange={(e) => {
                    setBatchId(e.target.value);
                    resetSelection();
                  }}
                />
                {currentBatch && <PostcardTemplatePreview code={currentBatch.template_code} />}
                <p className="postcards-muted" role="status">
                  {cards.data
                    ? `Нужно добавлений: ${cards.data.filter((card) => !card.ar_item_id).length}. `
                    : "Загружаем лимиты… "}
                  {demo || entitlements.error || !entitlements.data
                    ? "Остаток недоступен."
                    : entitlements.data.limits.arItems === null
                      ? "Безлимит."
                      : `Общий остаток: ${Math.max(0, entitlements.data.limits.arItems - entitlements.data.usage.arItems)}.`}
                  {entitlements.data &&
                  cards.data &&
                  entitlements.data.limits.arItems !== null &&
                  cards.data.filter((card) => !card.ar_item_id).length >
                    Math.max(0, entitlements.data.limits.arItems - entitlements.data.usage.arItems)
                    ? " Недостаточно добавлений — пополните пакет."
                    : ""}
                </p>
                {cards.isPending ? (
                  <p role="status">Загружаем экземпляры…</p>
                ) : (
                  <>
                    <dl className="postcards-counts">
                      <div>
                        <dt>На складе</dt>
                        <dd>{cards.data?.filter((c) => !c.shop_id).length ?? 0}</dd>
                      </div>
                      <div>
                        <dt>В магазинах</dt>
                        <dd>{cards.data?.filter((c) => c.shop_id && !c.sold_at).length ?? 0}</dd>
                      </div>
                      <div>
                        <dt>Продано</dt>
                        <dd>{cards.data?.filter((c) => c.sold_at).length ?? 0}</dd>
                      </div>
                      <div>
                        <dt>Активировано</dt>
                        <dd>{cards.data?.filter((c) => c.activated_at).length ?? 0}</dd>
                      </div>
                    </dl>
                    {canManage && (
                      <fieldset className="postcards-movement" disabled={move.isPending}>
                        <legend>Учёт выбранных открыток</legend>
                        <Select
                          label="Действие"
                          value={kind}
                          options={Object.entries(kinds).map(([value, label]) => ({ value, label }))}
                          onChange={(e) => {
                            setKind(e.target.value as MovementInput["kind"]);
                            resetSelection();
                          }}
                        />
                        <form className="postcards-scan" onSubmit={submitScan}>
                          <label htmlFor="postcard-scan">Номер открытки / сканер штрихкода</label>
                          <div>
                            <input
                              ref={scanRef}
                              className="field-control"
                              id="postcard-scan"
                              value={scan}
                              onChange={(e) => setScan(e.target.value)}
                              placeholder="PC-… или полный ID"
                              autoComplete="off"
                            />
                            <Button type="submit" variant="ghost" disabled={!scan.trim() || !currentShopId}>
                              Добавить
                            </Button>
                          </div>
                        </form>
                        <Button
                          variant="ghost"
                          icon={<ScanLine size={18} />}
                          disabled={!currentShopId}
                          onClick={() => setScannerOpen(true)}
                        >
                          Сканировать камерой
                        </Button>
                        {scanError && <p role="alert">{scanError}</p>}
                        <div className="postcards-selection">
                          <span>Выбрано: {selected.length}</span>
                          <Button
                            variant="quiet"
                            disabled={!eligible.length || !currentShopId}
                            onClick={() => {
                              setSelected(eligible.map((c) => c.id));
                              setConfirm(false);
                            }}
                          >
                            Выбрать доступные
                          </Button>
                          <Button variant="quiet" disabled={!selected.length} onClick={resetSelection}>
                            Снять выбор
                          </Button>
                        </div>
                        {confirm ? (
                          <div className="postcards-confirm">
                            <p>
                              {kinds[kind]}: {selected.length} шт. Магазин «{currentShop?.name}».{" "}
                              {kind === "sell"
                                ? "Продажа закрепит экземпляры за магазином и исключит их из остатка."
                                : "Возвращённые экземпляры снова станут доступны для передачи."}
                            </p>
                            <Button disabled={!canMove} onClick={() => move.mutate()}>
                              {move.isPending ? "Сохраняем…" : "Подтвердить"}
                            </Button>
                            <Button variant="quiet" onClick={() => setConfirm(false)}>
                              Отмена
                            </Button>
                          </div>
                        ) : (
                          <Button
                            disabled={!canMove || move.isPending}
                            onClick={() => {
                              if (kind === "assign") move.mutate();
                              else setConfirm(true);
                            }}
                          >
                            {move.isPending ? "Сохраняем…" : kinds[kind]}
                          </Button>
                        )}
                        {move.error && <p role="alert">{move.error.message}</p>}
                      </fieldset>
                    )}
                    <ul className="postcards-card-list" aria-label="Экземпляры тиража">
                      {cards.data?.map((card) => (
                        <li key={card.id}>
                          {canManage && (
                            <input
                              type="checkbox"
                              aria-label={`Выбрать открытку ${card.ordinal}`}
                              checked={selected.includes(card.id)}
                              disabled={
                                move.isPending || !currentShopId || !canMoveCard(card, { kind, shopId: currentShopId })
                              }
                              onChange={(e) => {
                                setSelected((old) =>
                                  e.target.checked ? [...old, card.id] : old.filter((id) => id !== card.id),
                                );
                                setConfirm(false);
                              }}
                            />
                          )}
                          <div>
                            <strong>Открытка № {card.ordinal}</strong>
                            <small>{cardInventoryCode(card)}</small>
                          </div>
                          <span>
                            {card.sold_at
                              ? "Продано"
                              : card.shop_id
                                ? (shops.data.find((s) => s.id === card.shop_id)?.name ?? "Магазин")
                                : "На складе"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : (
              <p className="postcards-muted">Тиражей пока нет.</p>
            )}
          </Panel>
          {currentBatch && cards.data?.length ? (
            <Suspense fallback={<p role="status">Открываем печать…</p>}>
              <PostcardPrintPanel
                key={currentBatch.id}
                accountId={accountId}
                batch={currentBatch}
                cards={cards.data}
                shop={currentShop}
                canManage={canManage}
                demo={demo}
                onUpdated={invalidate}
              />
            </Suspense>
          ) : null}
          <Panel>
            <h2>История движения</h2>
            {movements.isPending ? (
              <p role="status">Загружаем историю…</p>
            ) : movements.data?.length ? (
              <ul className="postcards-history">
                {movements.data.map((m) => (
                  <li key={m.id}>
                    <strong>
                      {m.origin === "buyer_code" ? "Привязка по коду" : kinds[m.kind]} · {m.card_ids.length} шт.
                    </strong>
                    <span>{shops.data.find((s) => s.id === m.shop_id)?.name ?? "Магазин"}</span>
                    <time dateTime={m.created_at}>{new Date(m.created_at).toLocaleString("ru-RU")}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="postcards-muted">Передач, продаж и возвратов пока нет.</p>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

function CreateForm({
  kind,
  accountId,
  onCancel,
  onCreated,
  draftKey,
  onDirtyChange,
  onBusyChange,
}: {
  kind: "shop" | "batch";
  accountId: string;
  onCancel: () => void;
  onCreated: (id: string) => Promise<void>;
  draftKey: string;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [initial] = useState(() => creationDrafts.get(draftKey));
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [template, setTemplate] = useState<(typeof postcardTemplates)[number]["code"] | null>(
    initial?.template ?? null,
  );
  const [quantity, setQuantity] = useState(initial?.quantity ?? "10");
  useEffect(() => {
    creationDrafts.set(draftKey, { name, address, template, quantity });
    onDirtyChange(Boolean(name || address || template !== null || quantity !== "10"));
  }, [draftKey, name, address, template, quantity, onDirtyChange]);
  const request = useRef({ fingerprint: "", id: "" });
  const save = useMutation({
    onMutate: () => onBusyChange(true),
    onSettled: () => onBusyChange(false),
    mutationFn: async () => {
      if (kind === "batch" && !template) throw new Error("Выберите открытку для тиража.");
      const fingerprint = JSON.stringify({ name, address, template, quantity });
      if (request.current.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() };
      const repository = await getPostcardRepository();
      const result =
        kind === "shop"
          ? await repository.createShop(accountId, { name, address }, request.current.id)
          : await repository.createBatch(
              accountId,
              { name, templateCode: template!, quantity: Number(quantity) },
              request.current.id,
            );
      return result.id;
    },
    onSuccess: onCreated,
  });
  return (
    <Panel>
      <h2>{kind === "shop" ? "Новый магазин" : "Новый тираж"}</h2>
      <form
        className="postcards-create-form"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <fieldset className={kind === "batch" ? "postcards-create-form-batch" : undefined} disabled={save.isPending}>
          <label>
            Название {kind === "shop" ? "магазина" : "тиража"} *
            <Input required maxLength={120} value={name} onValueChange={setName} autoFocus />
          </label>
          {kind === "shop" ? (
            <label>
              Адрес
              <Input maxLength={300} value={address} onValueChange={setAddress} />
            </label>
          ) : (
            <>
              <PostcardTemplatePicker value={template} onChange={setTemplate} />
              <label>
                Количество *
                <Input type="number" min={1} max={500} step={1} required value={quantity} onValueChange={setQuantity} />
              </label>
            </>
          )}
          {save.error && <p role="alert">{save.error.message}</p>}
          <div className="postcards-actions">
            <Button type="submit" disabled={kind === "batch" && !template}>
              {save.isPending ? "Сохраняем…" : kind === "shop" ? "Сохранить магазин" : "Создать экземпляры"}
            </Button>
            <Button type="button" variant="quiet" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </fieldset>
      </form>
    </Panel>
  );
}

function exportInventory(batch: PostcardBatch, cards: PostcardCard[], shops: PostcardShop[]) {
  const cell = (text: string) => `"${(/^[=+@\-\t\r]/.test(text) ? "'" : "") + text.replaceAll('"', '""')}"`;
  const rows = [
    ["Тираж", "Номер", "Код учёта", "Магазин", "Продано", "Активировано"],
    ...cards.map((c) => [
      batch.name,
      String(c.ordinal),
      cardInventoryCode(c),
      shops.find((s) => s.id === c.shop_id)?.name ?? "Склад",
      c.sold_at ?? "",
      c.activated_at ?? "",
    ]),
  ];
  const blob = new Blob(["\ufeff" + rows.map((r) => r.map(cell).join(";")).join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `postcards-${batch.id}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
