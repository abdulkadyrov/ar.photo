import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Input, Select } from "../../shared/ui";
import { getAdminRepository } from "./adminRepository";
import type { AdminAccountDetail, AdminPlan } from "./adminSchemas";
import { packageSummary } from "./planPresentation";

const repository = getAdminRepository();
export function PackageGrant({
  detail,
  plans,
  onSuccess,
}: {
  detail: AdminAccountDetail;
  plans: AdminPlan[];
  onSuccess: () => Promise<void>;
}) {
  const [planId, setPlanId] = useState("");
  const [previewNow, setPreviewNow] = useState(() => Date.now());
  const [reason, setReason] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const product = plans.find((p) => p.id === planId);
  const mutation = useMutation({
    mutationFn: () => repository.applyPackage(detail.account.id, planId, requestId, reason),
    onSuccess: async () => {
      setRequestId(crypto.randomUUID());
      setPlanId("");
      setReason("");
      await onSuccess();
    },
  });
  const expires =
    product?.durationDays === null && product.productKind === "subscription"
      ? "Без окончания"
      : product?.productKind === "addon" && !detail.subscription.expiresAt
        ? "Без окончания"
        : product
          ? new Date(
              Math.max(previewNow, Date.parse(detail.subscription.expiresAt ?? "") || 0) +
                (product.durationDays ?? 0) * 86400000,
            ).toLocaleDateString("ru-RU")
          : "—";
  return (
    <section className="mt-6 grid gap-4 border-t border-line pt-5">
      <h3 className="text-lg font-semibold">Назначить тариф или дополнительный пакет</h3>
      <p className="text-sm text-muted">
        Пакет прибавляет фото к оставшимся добавлениям. Время прибавляется к текущему окончанию; если срок истёк — к
        сегодняшнему дню. Деньги автоматически не списываются.
      </p>
      <Select
        label="Тариф или пакет"
        disabled={mutation.isPending}
        value={planId}
        onChange={(e) => {
          setPlanId(e.target.value);
          setPreviewNow(Date.now());
          setRequestId(crypto.randomUUID());
          mutation.reset();
        }}
        options={[
          { value: "", label: "Выберите пакет" },
          ...plans.filter((p) => p.isActive).map((p) => ({ value: p.id, label: `${p.name} · ${packageSummary(p)}` })),
        ]}
      />
      {product ? (
        <div className="rounded-xl border border-line p-4 text-sm">
          <p>{packageSummary(product)}</p>
          <p className="mt-2">Окончание после назначения: {expires}</p>
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-semibold">
        Причина назначения (от 10 символов)
        <Input value={reason} onValueChange={setReason} disabled={mutation.isPending} />
      </label>
      <Button disabled={!product || reason.trim().length < 10 || mutation.isPending} onClick={() => mutation.mutate()}>
        {mutation.isPending ? "Применяем…" : "Подтвердить и начислить пакет"}
      </Button>
      {mutation.error ? (
        <p role="alert" className="text-sm text-rose-700">
          {mutation.error.message}
        </p>
      ) : null}
      {mutation.isSuccess ? (
        <p role="status" className="text-sm text-emerald-700">
          Пакет начислен. Срок и добавления обновлены.
        </p>
      ) : null}
    </section>
  );
}
