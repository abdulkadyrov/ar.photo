export type ViewerCapabilityIssue = "insecure_context" | "camera_unavailable" | "webgl_unavailable";

export type ViewerCapabilities = {
  supported: boolean;
  issues: ViewerCapabilityIssue[];
};

export function detectViewerCapabilities(input?: {
  secureContext?: boolean;
  cameraAvailable?: boolean;
  webglAvailable?: boolean;
}): ViewerCapabilities {
  const issues: ViewerCapabilityIssue[] = [];
  const secureContext = input?.secureContext ?? window.isSecureContext;
  const cameraAvailable = input?.cameraAvailable ?? typeof navigator.mediaDevices?.getUserMedia === "function";
  const webglAvailable = input?.webglAvailable ?? hasWebGl();

  if (!secureContext) issues.push("insecure_context");
  if (!cameraAvailable) issues.push("camera_unavailable");
  if (!webglAvailable) issues.push("webgl_unavailable");
  return { supported: issues.length === 0, issues };
}

export function capabilityMessage(issue: ViewerCapabilityIssue) {
  if (issue === "insecure_context") return "Откройте ссылку по HTTPS, чтобы браузер разрешил камеру.";
  if (issue === "camera_unavailable") return "Этот браузер не предоставляет доступ к камере.";
  return "На устройстве недоступен WebGL, необходимый для AR.";
}

export function classifyViewerError(error: unknown) {
  const name = error instanceof DOMException ? error.name : error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Доступ к камере запрещён. Разрешите камеру в настройках браузера или откройте обычное видео.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "Камера не найдена. Можно открыть обычное видео.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Камера занята другим приложением. Закройте его или откройте обычное видео.";
  }
  if (name === "TimeoutError") {
    return "Камера запускается слишком долго. Повторите попытку или откройте обычное видео.";
  }
  return "AR не удалось запустить. Откройте обычное видео или повторите попытку.";
}

function hasWebGl() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
