import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, Input, MetricCard, StatusBadge } from ".";

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
});
