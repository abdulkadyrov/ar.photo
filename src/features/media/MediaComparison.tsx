import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Play, Pause, ChevronsLeftRight } from "lucide-react";
import { cropForAspect, editedAspect, fullCrop, type MediaSize, type PairEdits } from "./mediaEdits";

type Source = MediaSize & { url: string; duration: number };

export function MediaComparison({
  photo,
  video,
  edits,
  editing,
}: {
  photo: Source;
  video: Source;
  edits: PairEdits;
  editing: boolean;
}) {
  const [split, setSplit] = useState(50);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const player = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (editing) player.current?.pause();
  }, [editing]);
  const photoCrop = edits.markerCrop ?? fullCrop;
  const videoCrop = edits.video?.crop ?? fullCrop;
  const ratio = editedAspect(photo, photoCrop);
  // Match the AR surface: first apply the user's video crop, then center-cover the photo.
  const cover = cropForAspect({ width: video.width * videoCrop.width, height: video.height * videoCrop.height }, ratio);
  const fittedVideoCrop = {
    x: videoCrop.x + cover.x * videoCrop.width,
    y: videoCrop.y + cover.y * videoCrop.height,
    width: videoCrop.width * cover.width,
    height: videoCrop.height * cover.height,
  };
  const styleFor = (crop: typeof fullCrop): CSSProperties => ({
    width: `${100 / crop.width}%`,
    height: `${100 / crop.height}%`,
    left: `${(-100 * crop.x) / crop.width}%`,
    top: `${(-100 * crop.y) / crop.height}%`,
  });
  const segments = useMemo(
    () => edits.video?.segments ?? [{ start: 0, end: video.duration }],
    [edits.video?.segments, video.duration],
  );
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const el = player.current;
      if (!el || el.paused) return;
      if (!segments.some((s) => el.currentTime >= s.start && el.currentTime < s.end)) {
        const next = segments.find((s) => s.start > el.currentTime);
        if (next) el.currentTime = next.start;
        else {
          el.pause();
          el.currentTime = segments[0].start;
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, segments]);
  return (
    <section className="media-prepared-pair" aria-label="Подготовленные кадры">
      <div className="media-comparison-stage">
        <div className="media-comparison" style={{ aspectRatio: ratio, width: `min(100%, ${320 * ratio}px)` }}>
          <div className="media-comparison-layer">
            <img src={photo.url} alt="Подготовленная фотография" style={styleFor(photoCrop)} />
          </div>
          <div className="media-comparison-layer" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
            <video
              ref={player}
              key={`${video.url}-${JSON.stringify(edits.video?.segments)}`}
              src={video.url}
              style={styleFor(fittedVideoCrop)}
              playsInline
              preload="auto"
              onLoadedMetadata={(e) => {
                e.currentTarget.currentTime = segments[0].start;
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
          </div>
          <span className="media-comparison-label photo">Фото</span>
          <span className="media-comparison-label video">Видео</span>
          <div className="media-comparison-divider" style={{ left: `${split}%` }} aria-hidden="true">
            <ChevronsLeftRight size={22} />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
            aria-label="Линия сравнения фото и видео"
            className="media-comparison-slider"
          />
        </div>
      </div>
      <div className="media-comparison-caption">
        <p className="media-edit-note">Сдвигайте линию, чтобы сравнить края фото и видео.</p>
        <button
          type="button"
          onClick={async () => {
            if (playing) player.current?.pause();
            else {
              try {
                setError("");
                const el = player.current;
                if (el && !segments.some((s) => el.currentTime >= s.start && el.currentTime < s.end))
                  el.currentTime = segments[0].start;
                await el?.play();
              } catch {
                setError("Не удалось воспроизвести видео");
              }
            }
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? "Пауза" : "Сравнить с видео"}
        </button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
    </section>
  );
}
