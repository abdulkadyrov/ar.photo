import { useEffect, useRef, useState } from "react";
import { type VideoSegment } from "./mediaEdits";

// Decode a bounded set of small frames with a separate player, without moving the preview.
function useFilmstrip(url: string, duration: number) {
  const [frames, setFrames] = useState<{ url: string; images: string[] }>({ url, images: [] });
  useEffect(() => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    let cancelled = false;
    let cancelWait = () => {};
    const wait = (event: string) =>
      new Promise<void>((resolve, reject) => {
        const finish = (failed = false) => {
          clearTimeout(timeout);
          video.removeEventListener(event, loaded);
          video.removeEventListener("error", failedLoad);
          if (failed) reject(new Error("Frame unavailable"));
          else resolve();
        };
        const loaded = () => finish();
        const failedLoad = () => finish(true);
        const timeout = window.setTimeout(failedLoad, 8000);
        cancelWait = () => finish(true);
        video.addEventListener(event, loaded, { once: true });
        video.addEventListener("error", failedLoad, { once: true });
      });
    const generate = async () => {
      try {
        const ready = wait("loadeddata");
        video.src = url;
        await ready;
        const canvas = document.createElement("canvas");
        canvas.width = 120;
        canvas.height = 80;
        const ctx = canvas.getContext("2d")!;
        const count = Math.min(32, Math.max(8, Math.ceil(duration / 2)));
        const images: string[] = [];
        for (let i = 0; i < count && !cancelled; i++) {
          const time = (duration * (i + 0.5)) / count;
          const sought = wait("seeked");
          video.currentTime = time;
          await sought;
          if (cancelled) break;
          const scale = Math.max(120 / video.videoWidth, 80 / video.videoHeight);
          const w = video.videoWidth * scale,
            h = video.videoHeight * scale;
          ctx.drawImage(video, (120 - w) / 2, (80 - h) / 2, w, h);
          images.push(canvas.toDataURL("image/jpeg", 0.65));
          setFrames({ url, images: [...images] });
        }
      } catch {
        /* Editing still works if this browser cannot decode thumbnails. */
      } finally {
        video.removeAttribute("src");
        video.load();
      }
    };
    void generate();
    return () => {
      cancelled = true;
      cancelWait();
      video.removeAttribute("src");
      video.load();
    };
  }, [url, duration]);
  return frames.url === url ? frames.images : [];
}

export function VideoTimeline({
  url,
  duration,
  segments,
  selected,
  cursor,
  onSeek,
  onSelect,
  onTrim,
  onTrimCommit,
}: {
  url: string;
  duration: number;
  segments: VideoSegment[];
  selected: number;
  cursor: number;
  onSeek(time: number): void;
  onSelect(index: number): void;
  onTrim(edge: "start" | "end", time: number): void;
  onTrimCommit(previous: VideoSegment[]): void;
}) {
  const frames = useFilmstrip(url, duration);
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [zoom, setZoom] = useState(1);
  const [trimming, setTrimming] = useState(false);
  const expectedScroll = useRef<number | undefined>(undefined);
  const pan = useRef<{ x: number; scroll: number; moved: boolean } | undefined>(undefined);
  const drag = useRef<
    { edge: "start" | "end"; x: number; time: number; segments: VideoSegment[]; scroll: number } | undefined
  >(undefined);
  const trackWidth = Math.max(width - 44, Math.min(2400, duration * 48)) * zoom;
  const scale = trackWidth / duration;
  useEffect(() => {
    const el = viewport.current!;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const el = viewport.current;
    if (!el || drag.current) return;
    const target = cursor * scale;
    if (Math.abs(el.scrollLeft - target) > 1) {
      expectedScroll.current = target;
      el.scrollLeft = target;
    }
  }, [cursor, scale, width]);
  const selection = segments[selected];
  const gaps = [
    ...segments.map((s, i) => ({ start: segments[i - 1]?.end ?? 0, end: s.start })),
    { start: segments.at(-1)!.end, end: duration },
  ].filter((s) => s.end > s.start);
  const finishDrag = () => {
    if (!drag.current) return;
    const previous = drag.current.segments;
    drag.current = undefined;
    setTrimming(false);
    expectedScroll.current = cursor * scale;
    if (viewport.current) viewport.current.scrollLeft = cursor * scale;
    onTrimCommit(previous);
  };
  return (
    <div className="media-filmstrip-editor">
      <div className="media-filmstrip-toolbar">
        <span>Двигайте ленту · тяните края фрагмента</span>
        <button type="button" aria-label="Масштаб ленты кадров" onClick={() => setZoom(zoom === 4 ? 1 : zoom * 2)}>
          {zoom}×
        </button>
      </div>
      <div className="media-filmstrip-window">
        <div
          className="media-filmstrip-scroll"
          ref={viewport}
          aria-label="Лента кадров видео"
          onPointerDown={(e) => {
            pan.current = undefined;
            if (e.pointerType !== "mouse" || (e.target as HTMLElement).closest('[role="slider"]')) return;
            pan.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft, moved: false };
          }}
          onPointerMove={(e) => {
            if (!e.buttons) return;
            const p = pan.current;
            if (!p) return;
            if (Math.abs(e.clientX - p.x) > 4) {
              p.moved = true;
              e.currentTarget.setPointerCapture(e.pointerId);
            }
            if (p.moved) e.currentTarget.scrollLeft = p.scroll + p.x - e.clientX;
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
            pan.current = undefined;
          }}
          onClickCapture={(e) => {
            if (pan.current?.moved) {
              e.preventDefault();
              e.stopPropagation();
            }
            pan.current = undefined;
          }}
          onScroll={(e) => {
            const left = e.currentTarget.scrollLeft;
            if (expectedScroll.current !== undefined && Math.abs(left - expectedScroll.current) <= 1) {
              expectedScroll.current = undefined;
              return;
            }
            expectedScroll.current = undefined;
            if (!drag.current) onSeek(Math.max(0, Math.min(duration, left / scale)));
          }}
        >
          <div className="media-filmstrip-space" style={{ width: trackWidth + width }}>
            <div className="media-filmstrip-track" style={{ left: width / 2, width: trackWidth }}>
              <div className="media-filmstrip-images" aria-hidden="true">
                {Array.from({ length: Math.max(8, Math.ceil(trackWidth / 72)) }, (_, i) => {
                  const src =
                    frames[
                      Math.min(
                        frames.length - 1,
                        Math.floor((i / Math.max(8, Math.ceil(trackWidth / 72))) * frames.length),
                      )
                    ];
                  return src ? <img key={i} src={src} alt="" draggable={false} /> : <span key={i} />;
                })}
              </div>
              {gaps.map((gap, i) => (
                <div
                  key={i}
                  className="media-filmstrip-gap"
                  aria-hidden="true"
                  style={{ left: gap.start * scale, width: (gap.end - gap.start) * scale }}
                />
              ))}
              {segments.map((s, i) => (
                <button
                  type="button"
                  key={i}
                  className="media-filmstrip-segment"
                  aria-label={`Фрагмент ${i + 1}`}
                  aria-pressed={selected === i}
                  style={{ left: s.start * scale, width: (s.end - s.start) * scale }}
                  onClick={(e) => {
                    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                    onSelect(i);
                    onSeek(Math.max(s.start, Math.min(s.end, (e.clientX - rect.left) / scale)));
                  }}
                >
                  <span>{i + 1}</span>
                </button>
              ))}
              {(["start", "end"] as const).map((edge) => (
                <div
                  key={edge}
                  role="slider"
                  tabIndex={0}
                  aria-label={edge === "start" ? "Начало выбранного фрагмента" : "Конец выбранного фрагмента"}
                  aria-valuemin={edge === "start" ? (segments[selected - 1]?.end ?? 0) : selection.start + 0.1}
                  aria-valuemax={edge === "start" ? selection.end - 0.1 : (segments[selected + 1]?.start ?? duration)}
                  aria-valuenow={Number(selection[edge].toFixed(2))}
                  aria-valuetext={`${selection[edge].toFixed(2)} сек`}
                  className={`media-trim-handle ${edge}`}
                  style={{ left: selection[edge] * scale }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    drag.current = {
                      edge,
                      x: e.clientX,
                      time: selection[edge],
                      segments,
                      scroll: viewport.current!.scrollLeft,
                    };
                    setTrimming(true);
                    onSeek(selection[edge]);
                  }}
                  onPointerMove={(e) => {
                    const d = drag.current;
                    if (!d) return;
                    onTrim(d.edge, d.time + (e.clientX - d.x + viewport.current!.scrollLeft - d.scroll) / scale);
                  }}
                  onPointerUp={finishDrag}
                  onPointerCancel={finishDrag}
                  onLostPointerCapture={finishDrag}
                  onKeyDown={(e) => {
                    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                    e.preventDefault();
                    const time =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? duration
                          : selection[edge] + (e.key === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 1 : 0.1);
                    onTrim(edge, time);
                    onTrimCommit(segments);
                  }}
                >
                  <span aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {!trimming && <div className="media-filmstrip-playhead" aria-hidden="true" />}
      </div>
      <input
        aria-label="Позиция разреза"
        className="media-filmstrip-seek"
        type="range"
        min="0"
        max={duration}
        step="0.01"
        value={cursor}
        onChange={(e) => onSeek(Number(e.target.value))}
      />
    </div>
  );
}
