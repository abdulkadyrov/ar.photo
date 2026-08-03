import { describe, expect, it } from "vitest";
import { capabilityMessage, classifyViewerError, detectViewerCapabilities } from "./viewerCapabilities";

describe("public AR viewer capabilities", () => {
  it("requires HTTPS, camera access and WebGL", () => {
    expect(detectViewerCapabilities({ secureContext: true, cameraAvailable: true, webglAvailable: true })).toEqual({
      supported: true,
      issues: [],
    });
    expect(detectViewerCapabilities({ secureContext: false, cameraAvailable: false, webglAvailable: false })).toEqual({
      supported: false,
      issues: ["insecure_context", "camera_unavailable", "webgl_unavailable"],
    });
  });

  it("returns actionable capability and permission messages", () => {
    expect(capabilityMessage("camera_unavailable")).toMatch(/камер/i);
    expect(classifyViewerError(new DOMException("denied", "NotAllowedError"))).toMatch(/запрещён/i);
    expect(classifyViewerError(new DOMException("missing", "NotFoundError"))).toMatch(/не найдена/i);
    expect(classifyViewerError(new Error("private technical detail"))).not.toContain("private technical detail");
  });
});
