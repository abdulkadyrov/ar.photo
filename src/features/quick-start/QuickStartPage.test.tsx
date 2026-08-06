import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { QrCode } from "../../entities/ar-item/model";
import { MediaPicker, QuickResult, QuickStepper } from "./QuickStartPage";

const qr: QrCode = {
  account_id: "20000000-0000-4000-8000-000000000001",
  ar_item_id: "70000000-0000-4000-8000-000000000001",
  created_at: "2026-08-06T00:00:00.000Z",
  id: "90000000-0000-4000-8000-000000000001",
  png_path: null,
  public_url: "https://example.test/ar/memory-token",
  style: {},
  svg_path: null,
  updated_at: "2026-08-06T00:00:00.000Z",
  version: 1,
};

describe("quick-start design", () => {
  it("marks the processing step as current", () => {
    render(<QuickStepper currentStep={2} />);

    const navigation = screen.getByRole("navigation", { name: "Этапы создания AR-фото" });
    expect(within(navigation).getByText("Создаём AR").closest("li")).toHaveAttribute("aria-current", "step");
    expect(within(navigation).getByText("Добавьте файлы").closest("li")).not.toHaveAttribute("aria-current");
  });

  it("renders an accessible empty media picker", () => {
    render(<MediaPicker kind="marker" disabled={false} onPick={vi.fn()} />);

    expect(screen.getByLabelText("Выбрать фотографию-маркер")).toBeEnabled();
    expect(screen.getByText("Чёткое фото без бликов даст лучший трекинг")).toBeVisible();
  });

  it("renders the complete QR result actions", () => {
    render(<QuickResult title="Семейный момент" qr={qr} onReset={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Всё готово" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Семейный момент" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Открыть AR" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Скачать QR" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Копировать публичную ссылку" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Создать ещё" })).toBeEnabled();
    expect(screen.getByText(qr.public_url)).toBeVisible();
  });
});
