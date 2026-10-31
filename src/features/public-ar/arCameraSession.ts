export function stopCameraStream(stream?: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason ?? new DOMException("Camera cancelled", "AbortError"));
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}

export async function prepareArCamera(options: {
  video: HTMLVideoElement;
  constraints: MediaStreamConstraints;
  signal: AbortSignal;
  stream?: MediaStream;
}) {
  const { video, signal } = options;
  signal.throwIfAborted();
  video.autoplay = true;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  Object.assign(video.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    maxWidth: "none",
    zIndex: "0",
  });
  const requested = options.stream
    ? Promise.resolve(options.stream)
    : navigator.mediaDevices.getUserMedia(options.constraints);
  // Permission prompts can resolve after navigation/timeout. Never leak that camera.
  void requested.then(
    (stream) => {
      if (signal.aborted) stopCameraStream(stream);
    },
    () => undefined,
  );
  const stream = await abortable(requested, signal);
  const stop = () => {
    stopCameraStream(stream);
    video.srcObject = null;
  };
  signal.addEventListener("abort", stop, { once: true });
  video.srcObject = stream;
  try {
    await abortable(video.play(), signal);
    await waitForCameraFrame(video, signal);
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    return stream;
  } catch (error) {
    stop();
    throw error;
  }
}

export function waitForCameraFrame(video: HTMLVideoElement, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    let frame = 0;
    const clean = () => {
      cancelAnimationFrame(frame);
      signal.removeEventListener("abort", abort);
    };
    const abort = () => {
      clean();
      reject(signal.reason ?? new DOMException("Camera cancelled", "AbortError"));
    };
    const check = () => {
      if (signal.aborted) {
        abort();
        return;
      }
      if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        clean();
        resolve();
        return;
      }
      frame = requestAnimationFrame(check);
    };
    signal.addEventListener("abort", abort, { once: true });
    check();
  });
}

// MindAR 1.2.5 binds an unremovable resize listener in its constructor. We own
// viewport observation and teardown, so suppress only that synchronous listener.
export function constructWithManagedResize<T>(create: () => T): T {
  const add = window.addEventListener;
  window.addEventListener = ((
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    if (type !== "resize") add.call(window, type, listener, options);
  }) as typeof window.addEventListener;
  try {
    return create();
  } finally {
    window.addEventListener = add;
  }
}
