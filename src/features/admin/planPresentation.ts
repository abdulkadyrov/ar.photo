import type { AdminPlan } from "./adminSchemas";

export function packageSummary(plan: AdminPlan) {
  const photos = plan.arItemLimit === null ? "Безлимит фото" : `${plan.arItemLimit} добавлений фото`;
  const duration = plan.durationDays === null ? "без срока" : `${plan.durationDays} дней`;
  return `${photos} · ${duration} · ${(plan.priceKopecks / 100).toLocaleString("ru-RU")} ₽`;
}
