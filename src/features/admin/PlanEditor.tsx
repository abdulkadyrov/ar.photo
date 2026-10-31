import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Input, Modal, Select } from "../../shared/ui";
import { getAdminRepository } from "./adminRepository";
import type { AdminPlan, AdminPlanInput } from "./adminSchemas";

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
  return (
    <Modal
      open
      title={plan ? "Редактировать тариф" : "Новый тариф или пакет"}
      onClose={onClose}
      description="Укажите название, цену, срок и количество новых AR-фото."
      actions={
        <Button disabled={mutation.isPending || !name.trim()} onClick={() => mutation.mutate()}>
          {mutation.isPending ? "Сохраняем…" : "Сохранить тариф"}
        </Button>
      }
    >
      <div className="grid gap-4">
        <Select
          label="Тип"
          value={productKind}
          onChange={(e) => setProductKind(e.target.value as typeof productKind)}
          options={[
            { value: "subscription", label: "Тариф: фото и срок" },
            { value: "addon", label: "Дополнение: фото и/или время" },
          ]}
        />
        <Field label="Название" value={name} onChange={setName} />
        <Field label="Стоимость, ₽" value={price} onChange={setPrice} />
        <Field label="Срок, дней (30 — месяц, 365 — год)" value={duration} onChange={setDuration} />
        <Field
          label="Добавления AR-фото"
          value={values.arItemLimit}
          onChange={(v) => setValues({ ...values, arItemLimit: v })}
        />
        <p className="text-sm text-muted">
          Удаление фото не возвращает добавление. Пустой лимит фото или срок — без ограничений для тарифа; 0 дней —
          пакет только фото.
        </p>
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
      </div>
      {mutation.error ? (
        <p role="alert" className="mt-3 text-sm text-rose-700">
          {mutation.error.message}
        </p>
      ) : null}
    </Modal>
  );
}
function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold">
      {label}
      <Input value={value} onValueChange={onChange} />
    </label>
  );
}
