import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { QrCode } from "../../entities/ar-item/model";
import {
  AdditionalArPhotoPair,
  MediaPicker,
  ProgressStatus,
  QuickResult,
  QuickStepper,
  QuickStopwatch,
} from "./QuickStartPage";
import { formatElapsedTime } from "./quickStartTimer";

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

  it("restricts the video chooser to video files and accepts a dropped video", () => {
    const onPick = vi.fn();
    render(<MediaPicker kind="video" disabled={false} onPick={onPick} />);

    const input = screen.getByLabelText("Выбрать видео");
    expect(input.getAttribute("accept")).toContain("video/*");

    const video = new File(["video"], "family.avi", { type: "video/x-msvideo" });
    fireEvent.drop(screen.getByTestId("video-media-picker"), {
      dataTransfer: { files: [video], types: ["Files"] },
    });

    expect(onPick).toHaveBeenCalledWith(video);
  });

  it("rejects a photo dropped into the video picker", () => {
    const onPick = vi.fn();
    render(<MediaPicker kind="video" disabled={false} onPick={onPick} />);

    const photo = new File(["photo"], "family.jpg", { type: "image/jpeg" });
    fireEvent.drop(screen.getByTestId("video-media-picker"), {
      dataTransfer: { files: [photo], types: ["Files"] },
    });

    expect(onPick).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Перетащите сюда видеофайл");
  });

  it("opens the selected video in a full preview", () => {
    const video = new File(["video"], "family.mp4", { type: "video/mp4" });
    render(
      <MediaPicker
        kind="video"
        file={video}
        previewUrl="blob:https://example.test/video"
        disabled={false}
        onPick={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Просмотреть видео family.mp4" }));

    expect(screen.getByRole("dialog", { name: "family.mp4" })).toBeVisible();
    expect(screen.getByLabelText("Видео family.mp4")).toHaveAttribute("controls");
    fireEvent.click(screen.getByRole("button", { name: "Закрыть предпросмотр" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders an optional second photo and keeps it in the same QR", () => {
    const onRemove = vi.fn();
    render(
      <AdditionalArPhotoPair
        index={2}
        pair={{ id: "pair-two" }}
        disabled={false}
        onChange={vi.fn()}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText("AR-фото 2")).toBeVisible();
    expect(screen.getByText("Тот же QR-код")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Удалить AR-фото 2" }));
    expect(onRemove).toHaveBeenCalledOnce();
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

  it("shows only the compact four-step creation progress", () => {
    render(<ProgressStatus step={3} />);

    expect(screen.getByText("3/4")).toBeVisible();
    expect(screen.getByRole("status")).toHaveAccessibleName("Этап 3 из 4");
    expect(screen.queryByText(/target\.mind/i)).not.toBeInTheDocument();
  });

  it("shows a stopwatch while the quick creation is running", () => {
    render(<QuickStopwatch elapsedSeconds={83} running />);

    expect(screen.getByRole("timer")).toHaveAccessibleName("Прошло 01:23");
    expect(screen.getByText("01:23")).toBeVisible();
    expect(formatElapsedTime(3_661)).toBe("01:01:01");
  });
});
