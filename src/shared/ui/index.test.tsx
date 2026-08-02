import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, FileDropzone, Input, MetricCard, Modal, Select, StatusBadge, Toast } from ".";

describe("shared UI primitives", () => {
  it("exposes accessible button and metric content", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <>
        <Button onClick={onClick}>Создать проект</Button>
        <MetricCard icon={<span aria-hidden>AR</span>} label="AR-фото" value={12} />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Создать проект" }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByText("AR-фото")).toBeVisible();
    expect(screen.getByText("12")).toBeVisible();
  });

  it("reports input changes and media status", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <>
        <Input aria-label="Название проекта" value="" onValueChange={onValueChange} />
        <StatusBadge ok label="Фото" />
      </>,
    );

    await user.type(screen.getByRole("textbox", { name: "Название проекта" }), "A");

    expect(onValueChange).toHaveBeenCalledWith("A");
    expect(screen.getByText("Фото: ✓")).toBeVisible();
  });

  it("supports keyboard modal dismissal and labelled selects", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <>
        <Select label="Категория" options={[{ label: "Выпускной", value: "graduation" }]} />
        <Modal open title="Удалить проект?" onClose={onClose} />
      </>,
    );

    expect(screen.getByRole("combobox", { name: "Категория" })).toHaveValue("graduation");
    expect(screen.getByRole("dialog", { name: "Удалить проект?" })).toBeVisible();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("accepts files and exposes live notifications", async () => {
    const onPick = vi.fn();
    const user = userEvent.setup();

    render(
      <>
        <FileDropzone accept="image/*" onPick={onPick} />
        <Toast title="Файл загружен" tone="success" />
      </>,
    );

    const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByLabelText(/Перетащите файлы/), file);

    expect(onPick).toHaveBeenCalledWith([file]);
    expect(screen.getByRole("status")).toHaveTextContent("Файл загружен");
  });
});
