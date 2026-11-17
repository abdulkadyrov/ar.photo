import { useMutation } from "@tanstack/react-query";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeft, CalendarDays, ChevronRight, Image, Save } from "lucide-react";
import { Button, Input, Modal } from "../../shared/ui";
import { getAdminRepository } from "./adminRepository";
import type { AdminPlan, AdminPlanInput } from "./adminSchemas";
import "./AdminWorkspace.css";

const repository = getAdminRepository();
const numericFields = [
  ["arItemLimit", "Добавления AR-фото", 1],
  ["storageLimitBytes", "Хранилище, ГБ", 1073741824],
  ["projectLimit", "Проекты", 1],
  ["groupLimit", "Группы", 1],
  ["teamLimit", "Сотрудники", 1],
  ["videoDurationLimitSeconds", "Длительность видео, секунд", 1],
  ["maxVideoSizeBytes", "Размер видео, МБ", 1048576],
] as const;

export function PlanEditor({
  plan,
  onClose,
  onSuccess,
}: {
  plan: AdminPlan | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState(plan?.code ?? `plan_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`);
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [productKind, setProductKind] = useState<"subscription" | "addon">(plan?.productKind ?? "subscription");
  const [duration, setDuration] = useState(plan ? String(plan.durationDays ?? "") : "30");
  const [price, setPrice] = useState(String((plan?.priceKopecks ?? 0) / 100));
  const [active, setActive] = useState(plan?.isActive ?? true);
  const [reason, setReason] = useState("");
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      numericFields.map(([key, , scale]) => [
        key,
        plan ? (plan[key] === null ? "" : String(plan[key]! / scale)) : key === "arItemLimit" ? "100" : "",
      ]),
    ),
  );
  const mutation = useMutation({
    mutationFn: async () => {
      if (!/^[a-z][a-z0-9_]{1,31}$/.test(code))
        throw new Error("Код: 2–32 символа, латинские буквы, цифры и _; начало — буква.");
      if (!name.trim() || name.trim().length > 80) throw new Error("Введите название до 80 символов.");
      const days = duration.trim() === "" ? null : Number(duration);
      if (days !== null && (!Number.isInteger(days) || days < (productKind === "addon" ? 0 : 1) || days > 3650))
        throw new Error("Укажите срок от 1 до 3650 дней. Для пакета фото можно 0 дней.");
      if (!/^\d+(?:[.,]\d{1,2})?$/.test(price))
        throw new Error("Введите стоимость в рублях, до двух знаков после запятой.");
      const priceKopecks = Math.round(Number(price.replace(",", ".")) * 100);
      if (priceKopecks > 100_000_000_000) throw new Error("Стоимость слишком велика.");
      const limits = Object.fromEntries(
        numericFields.map(([key, label, scale]) => {
          if (values[key].trim() === "") return [key, null];
          const n = Number(values[key]) * scale;
          const min = ["teamLimit", "videoDurationLimitSeconds", "maxVideoSizeBytes"].includes(key) ? 1 : 0;
          if (!Number.isSafeInteger(n) || n < min || n > (scale === 1 ? 2147483647 : Number.MAX_SAFE_INTEGER))
            throw new Error(`Проверьте поле «${label}».`);
          return [key, n];
        }),
      );
      if (
        productKind === "addon" &&
        (days === null || limits.arItemLimit === null || (Number(limits.arItemLimit) === 0 && !days))
      )
        throw new Error("Для дополнения укажите количество фото (0 для продления) и/или число дней.");
      const input = {
        ...limits,
        id: plan?.id,
        code,
        name: name.trim(),
        description,
        durationDays: days,
        priceKopecks,
        productKind,
        isActive: active,
        reason: reason.trim() || `${plan ? "Редактирование" : "Создание"} тарифа «${name.trim()}» администратором`,
      } as AdminPlanInput;
      await repository.upsertPlan(input);
    },
    onSuccess,
  });
  const mobile = useSyncExternalStore(subscribeMobile, mobileSnapshot, () => false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [discard, setDiscard] = useState(false);
  const dirty =
    name !== (plan?.name ?? "") ||
    description !== (plan?.description ?? "") ||
    productKind !== (plan?.productKind ?? "subscription") ||
    duration !== (plan ? String(plan.durationDays ?? "") : "30") ||
    price !== String((plan?.priceKopecks ?? 0) / 100) ||
    active !== (plan?.isActive ?? true) ||
    numericFields.some(
      ([key, , scale]) =>
        values[key] !==
        (plan ? (plan[key] === null ? "" : String(plan[key]! / scale)) : key === "arItemLimit" ? "100" : ""),
    );
  const cancel = () => {
    if (mutation.isPending) return;
    if (dirty) setDiscard(true);
    else onClose();
  };
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !discard) cancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  const changeKind = (kind: "subscription" | "addon") => {
    setProductKind(kind);
    if (kind === "addon") {
      if (duration === "") setDuration("0");
      if (values.arItemLimit === "") setValues({ ...values, arItemLimit: "100" });
    }
  };
  return (
    <section
      className="admin-page admin-plan-editor-page"
      role="dialog"
      aria-modal="false"
      aria-label={plan ? "Редактировать тариф" : "Новый тариф или пакет"}
    >
      <button type="button" className="admin-back" onClick={cancel}>
        <ArrowLeft size={16} />
        Тарифы
      </button>
      <header className="admin-section-heading admin-page-heading">
        <div>
          <h1>Редактор тарифа</h1>
          <p>Создание и настройка тарифа.</p>
        </div>
      </header>
      <form
        className="admin-plan-editor-layout"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="admin-surface admin-plan-editor">
          <fieldset className="admin-product-kind">
            <legend>Тип продукта</legend>
            <div>
              {(["subscription", "addon"] as const).map((kind) => (
                <label key={kind} className={productKind === kind ? "is-selected" : ""}>
                  <input
                    type="radio"
                    name="plan-kind"
                    value={kind}
                    checked={productKind === kind}
                    onChange={() => changeKind(kind)}
                    disabled={mutation.isPending}
                  />
                  {kind === "subscription" ? "Тариф" : "Дополнение"}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Название" value={name} onChange={setName} disabled={mutation.isPending} />
          <div className="admin-price-duration">
            <Field label="Стоимость, ₽" value={price} onChange={setPrice} disabled={mutation.isPending} />
            <Field
              label="Срок, дней"
              value={duration}
              onChange={setDuration}
              disabled={mutation.isPending || (productKind === "subscription" && duration === "")}
            />
          </div>
          <Field
            label="Добавления AR-фото"
            value={values.arItemLimit}
            onChange={(value) => setValues({ ...values, arItemLimit: value })}
            disabled={mutation.isPending || (productKind === "subscription" && values.arItemLimit === "")}
          />
          {productKind === "subscription" ? (
            <div className="admin-plan-options">
              <label>
                <input
                  type="checkbox"
                  checked={duration === ""}
                  onChange={(event) => setDuration(event.target.checked ? "" : "30")}
                  disabled={mutation.isPending}
                />
                <span>
                  <strong>Без срока</strong>
                  <small>Тариф действует без ограничения по времени.</small>
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={values.arItemLimit === ""}
                  onChange={(event) => setValues({ ...values, arItemLimit: event.target.checked ? "" : "100" })}
                  disabled={mutation.isPending}
                />
                <span>
                  <strong>Без лимита фото</strong>
                  <small>Неограниченное количество добавлений фото.</small>
                </span>
              </label>
            </div>
          ) : null}
          <details>
            <summary className="min-h-12 cursor-pointer py-3 text-sm font-semibold">Дополнительные настройки</summary>
            <div className="grid gap-4">
              <Field label="Код тарифа" value={code} onChange={setCode} />
              <Field label="Описание" value={description} onChange={setDescription} />
              {productKind === "subscription"
                ? numericFields
                    .filter(([key]) => key !== "arItemLimit")
                    .map(([key, label]) => (
                      <Field
                        key={key}
                        label={label}
                        value={values[key]}
                        onChange={(v) => setValues({ ...values, [key]: v })}
                      />
                    ))
                : null}
              <p className="text-sm text-muted">
                Код заполняется автоматически. Пустые технические лимиты — без ограничений. Ранее выданные фото и срок
                сохраняются; прочие лимиты меняются у всех аккаунтов на этом тарифе.
              </p>
              <label className="flex min-h-12 items-center gap-3 text-sm">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Доступен для назначения
              </label>
              <Field label="Причина изменения (необязательно)" value={reason} onChange={setReason} />
            </div>
          </details>
          {mutation.error ? (
            <p role="alert" className="text-sm text-rose-700">
              {mutation.error.message}
            </p>
          ) : null}
        </div>
        <details
          className="admin-surface admin-plan-preview"
          open={!mobile || previewExpanded}
          onToggle={(event) => {
            if (mobile) setPreviewExpanded(event.currentTarget.open);
          }}
        >
          <summary>
            <h2>Предпросмотр тарифа</h2>
            <ChevronRight size={17} aria-hidden="true" />
          </summary>
          <p className="admin-plan-preview-description">Так тариф будет отображаться при выборе пакета.</p>
          <div className="admin-preview-card">
            <span className="admin-badge">{productKind === "subscription" ? "Тариф" : "Дополнение"}</span>
            <h3>{name || "Новый тариф"}</h3>
            <strong className="admin-price">{price || "0"} ₽</strong>
            <p>
              <CalendarDays size={17} />
              {duration === "" ? "Без срока" : `Срок: ${duration} дней`}
            </p>
            <p>
              <Image size={17} />
              {values.arItemLimit === "" ? "Без лимита фото" : `Добавлений фото: ${values.arItemLimit}`}
            </p>
          </div>
        </details>
        <p className="admin-plan-warning">
          Удаление уже созданных фото не возвращает добавления. Для дополнения 0 дней означает пакет только фото.
        </p>
        <footer className="admin-editor-footer">
          <Button type="submit" icon={<Save size={16} />} disabled={mutation.isPending || !name.trim()}>
            {mutation.isPending ? "Сохраняем…" : "Сохранить тариф"}
          </Button>
          <Button type="button" variant="quiet" onClick={cancel} disabled={mutation.isPending}>
            Отмена
          </Button>
        </footer>
      </form>
      <Modal
        open={discard}
        title="Отменить изменения?"
        description="Введённые условия тарифа ещё не сохранены."
        onClose={() => setDiscard(false)}
        actions={
          <Button type="button" variant="danger" onClick={onClose}>
            Не сохранять
          </Button>
        }
      />
    </section>
  );
}
function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold">
      {label}
      <Input value={value} onValueChange={onChange} disabled={disabled} />
    </label>
  );
}

function subscribeMobile(listener: () => void) {
  const media = window.matchMedia?.("(max-width:700px)");
  media?.addEventListener("change", listener);
  return () => media?.removeEventListener("change", listener);
}
function mobileSnapshot() {
  return window.matchMedia?.("(max-width:700px)").matches ?? false;
}
