import { describe, expect, it, vi } from "vitest";
import { classifyClientContext, createPublicArTelemetry, videoMilestones, viewerErrorCode } from "./telemetry";

describe("public AR telemetry", () => {
  it("deduplicates milestones and sends only the minimized payload", async () => {
    const transport = vi.fn();
    const telemetry = createPublicArTelemetry("ab".repeat(18), {
      transport,
      sessionToken: "session_token_with_adequate_entropy_123456789",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1",
      referrer: "https://school.example/album?student=private",
    });

    expect(telemetry.track("page_open")).toBe(true);
    expect(telemetry.track("page_open")).toBe(false);
    await Promise.resolve();

    expect(transport).toHaveBeenCalledTimes(1);
    const payload = transport.mock.calls[0][0];
    expect(payload.referrerDomain).toBe("school.example");
    expect(payload.deviceType).toBe("mobile");
    expect(payload.browserFamily).toBe("safari");
    expect(JSON.stringify(payload)).not.toContain("student=private");
    expect(JSON.stringify(payload)).not.toContain("Mozilla");
    expect(payload).not.toHaveProperty("ipAddress");
  });

  it("swallows synchronous and asynchronous transport failures", async () => {
    const synchronous = createPublicArTelemetry("ab".repeat(18), {
      transport: () => {
        throw new Error("offline");
      },
      sessionToken: "session_token_with_adequate_entropy_123456789",
      userAgent: "",
      referrer: "",
    });
    expect(() => synchronous.track("camera_started")).not.toThrow();
    await Promise.resolve();

    const asynchronous = createPublicArTelemetry("ab".repeat(18), {
      transport: () => Promise.reject(new Error("offline")),
      sessionToken: "another_session_token_with_adequate_entropy",
      userAgent: "",
      referrer: "",
    });
    expect(() => asynchronous.track("camera_started")).not.toThrow();
    await Promise.resolve();
  });

  it("classifies only coarse device, browser and OS families", () => {
    expect(
      classifyClientContext(
        "Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36",
      ),
    ).toEqual({ deviceType: "mobile", browserFamily: "chrome", osFamily: "android" });
    expect(classifyClientContext("Mozilla/5.0 (Windows NT 10.0) Edg/131.0")).toEqual({
      deviceType: "desktop",
      browserFamily: "edge",
      osFamily: "windows",
    });
  });

  it("emits idempotent video progress thresholds", () => {
    expect(videoMilestones(10, 100)).toEqual([]);
    expect(videoMilestones(51, 100)).toEqual(["progress_25", "progress_50"]);
    expect(videoMilestones(99, 100)).toEqual(["progress_25", "progress_50", "progress_75", "completed"]);
  });

  it("maps browser failures to bounded error codes", () => {
    expect(viewerErrorCode(new DOMException("denied", "NotAllowedError"))).toBe("camera_permission_denied");
    expect(viewerErrorCode(new Error("private detail"))).toBe("tracking_failed");
  });
});
