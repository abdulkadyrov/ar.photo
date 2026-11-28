/** Frame identity for the filter; currentTime can advance between decoded frames. */
export function createVideoFrameClock(video: HTMLVideoElement, signal: AbortSignal) {
  let stamp = performance.now();
  let mediaTime = video.currentTime;
  let presented = -1;
  let handle: number | undefined;
  const frameCallbacks = typeof video.requestVideoFrameCallback === "function";
  const frame: VideoFrameRequestCallback = (now, metadata) => {
    if (signal.aborted) return;
    // Safari live camera streams can report mediaTime=0 for every frame.
    if (metadata.presentedFrames !== presented) {
      presented = metadata.presentedFrames;
      stamp = now;
    }
    handle = video.requestVideoFrameCallback(frame);
  };
  const dispose = () => {
    if (handle !== undefined) video.cancelVideoFrameCallback?.(handle);
    handle = undefined;
    signal.removeEventListener("abort", dispose);
  };
  if (!signal.aborted && frameCallbacks) handle = video.requestVideoFrameCallback(frame);
  signal.addEventListener("abort", dispose, { once: true });
  return {
    read() {
      if (!frameCallbacks && video.currentTime !== mediaTime) {
        mediaTime = video.currentTime;
        stamp = performance.now();
      }
      return stamp;
    },
    dispose,
  };
}
