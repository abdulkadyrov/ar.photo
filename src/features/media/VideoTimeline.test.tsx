import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VideoTimeline } from "./VideoTimeline";

function pointer(element: HTMLElement, type: string, clientX: number, buttons = 1) {
  const event = new MouseEvent(type, { bubbles: true, clientX, buttons });
  Object.defineProperties(event, { pointerType: { value: "mouse" }, pointerId: { value: 1 } });
  fireEvent(element, event);
}

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  Object.defineProperties(HTMLElement.prototype, {
    setPointerCapture: { configurable: true, value: vi.fn() },
    hasPointerCapture: { configurable: true, value: () => true },
    releasePointerCapture: { configurable: true, value: vi.fn() },
  });
});
afterEach(async () => {
  await act(async () => cleanup());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const segments = [{ start: 0, end: 10 }];

describe("filmstrip mouse pan", () => {
  it("ignores a delayed decoded cursor while dragging and commits the final release coordinate", () => {
    const onSeek = vi.fn();
    const props = {
      url: "blob:timeline-test",
      duration: 10,
      segments,
      selected: 0,
      onSeek,
      onSelect: vi.fn(),
      onTrim: vi.fn(),
      onTrimCommit: vi.fn(),
    };
    const { rerender } = render(<VideoTimeline {...props} cursor={5} />);
    const strip = screen.getByLabelText("Лента кадров видео");
    // Duration 10 × 48px/sec = 480px. At 5sec the viewport starts at 240px.
    expect(strip.scrollLeft).toBe(240);
    pointer(strip, "pointerdown", 200);
    pointer(strip, "pointermove", 152);
    expect(strip.scrollLeft).toBe(288);
    // WebKit may publish a decoded time from an earlier seek during this pan.
    rerender(<VideoTimeline {...props} cursor={5.2} />);
    expect(strip.scrollLeft).toBe(288);
    // There need not be a final pointermove or scroll event before release.
    pointer(strip, "pointerup", 104, 0);
    expect(strip.scrollLeft).toBe(336);
    expect(onSeek).toHaveBeenLastCalledWith(7);
    // A finished pan must not block later keyboard/player seeks.
    rerender(<VideoTimeline {...props} cursor={8} />);
    expect(strip.scrollLeft).toBe(384);
  });
});
