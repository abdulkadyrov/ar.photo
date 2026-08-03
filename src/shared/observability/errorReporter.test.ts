import { describe, expect, it, vi } from "vitest";
import { configureOperationalErrorSink, reportOperationalError } from "./errorReporter";

describe("operational error reporting", () => {
  it("redacts credentials, PII, signed queries and internal ids", () => {
    const sink = vi.fn();
    const restore = configureOperationalErrorSink(sink);
    const event = reportOperationalError(
      "Upload Failed!",
      "operation",
      new Error("owner@example.com https://storage.example.test/object?id=secret 123e4567-e89b-12d3-a456-426614174000"),
      { password: "do-not-log", retry: 2, detail: "safe" },
    );
    restore();

    const serialized = JSON.stringify(event);
    expect(event.code).toBe("upload_failed");
    expect(event.context).toEqual({ password: "[REDACTED]", retry: 2, detail: "safe" });
    expect(serialized).not.toContain("owner@example.com");
    expect(serialized).not.toContain("?id=secret");
    expect(serialized).not.toContain("123e4567-e89b-12d3-a456-426614174000");
    expect(serialized).not.toContain("do-not-log");
    expect(serialized).not.toContain("stack");
    expect(sink).toHaveBeenCalledWith(event);
  });

  it("never throws when an observability provider fails", () => {
    const restore = configureOperationalErrorSink(() => {
      throw new Error("provider unavailable");
    });
    expect(() => reportOperationalError("route_render_failed", "route", new Error("render failed"))).not.toThrow();
    restore();
  });
});
