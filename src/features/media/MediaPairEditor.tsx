import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Crop, Download, Scissors, X, Undo2, Play, Pause, Trash2 } from "lucide-react";
import { cropImageFile } from "./cropImage";
import {
  aspectPresets,
  aspectsDiffer,
  cropForAspect,
  editedAspect,
  fullCrop,
  MAX_SEGMENTS,
  segmentsDuration,
  splitSegment,
  type CropRect,
  type MediaSize,
  type PairEdits,
  type VideoEdits,
  type VideoSegment,
} from "./mediaEdits";
import "./MediaPairEditor.css";

type Info = MediaSize & { url: string; duration: number; file: File };
function useMediaInfo(file: File | undefined, kind: "marker" | "video") {
  const [state, setState] = useState<{ info?: Info; error?: string; file?: File }>({});
  useEffect(() => {
    if (!file) return;
    let active = true;
    const url = URL.createObjectURL(file);
    const element = kind === "marker" ? new Image() : document.createElement("video");
    const loaded = () => {
      if (!active) return;
      clearTimeout(timeout);
      const video = element instanceof HTMLVideoElement;
      const width = video ? element.videoWidth : (element as HTMLImageElement).naturalWidth;
      const height = video ? element.videoHeight : (element as HTMLImageElement).naturalHeight;
      const duration = video ? element.duration : 0;
      if (width && height && (!video || (Number.isFinite(duration) && duration > 0)))
        setState({ file, info: { file, url, width, height, duration } });
      else failed();
    };
    const failed = () =>
      active &&
      setState({
        file,
        error: "Браузер не открыл предпросмотр. Можно загрузить оригинал или выбрать другой файл для редактирования.",
      });
    element.addEventListener(kind === "marker" ? "load" : "loadedmetadata", loaded);
    element.addEventListener("error", failed);
    if (element instanceof HTMLVideoElement) {
      element.preload = "metadata";
      element.muted = true;
      element.playsInline = true;
    }
    element.src = url;
    const timeout = window.setTimeout(failed, 15000);
    return () => {
      active = false;
      clearTimeout(timeout);
      element.removeAttribute("src");
      if (element instanceof HTMLVideoElement) element.load();
      URL.revokeObjectURL(url);
    };
  }, [file, kind]);
  return {
    info: state.info?.file === file ? state.info : undefined,
    error: state.file === file ? state.error : undefined,
  };
}

export function MediaPairEditor({
  markerFile,
  videoFile,
  value,
  onChange,
  disabled,
}: {
  markerFile?: File;
  videoFile?: File;
  value: PairEdits;
  onChange(value: PairEdits): void;
  disabled: boolean;
}) {
  const marker = useMediaInfo(markerFile, "marker"),
    video = useMediaInfo(videoFile, "video");
  const [editing, setEditing] = useState<"marker" | "video">();
  const [downloadError, setDownloadError] = useState("");
  const [downloading, setDownloading] = useState(false);
  if (!markerFile && !videoFile) return null;
  const ma = marker.info && editedAspect(marker.info, value.markerCrop);
  const va = video.info && editedAspect(video.info, value.video?.crop);
  const mismatch = ma && va && aspectsDiffer(ma, va);
  const active = editing === "marker" ? marker.info : video.info;
  return (
    <div className="media-pair-editor">
      {mismatch ? (
        <div className="media-ratio-warning" role="status">
          <strong>Пропорции фото и видео отличаются</strong>
          <p>
            Выберите общий формат в редакторе. Если оставить как есть, видео заполнит фотографию с обрезкой краёв по
            центру, без растягивания.
          </p>
        </div>
      ) : ma && va ? (
        <p className="media-ratio-match">Фото и видео совпадают по пропорциям</p>
      ) : null}
      <div className="media-edit-actions">
        <button type="button" disabled={disabled || !marker.info} onClick={() => setEditing("marker")}>
          <Crop size={18} /> Кадрировать фото
        </button>
        <button type="button" disabled={disabled || !video.info} onClick={() => setEditing("video")}>
          <Scissors size={18} /> Кадр и монтаж видео
        </button>
        {value.markerCrop && markerFile ? (
          <button
            type="button"
            disabled={downloading}
            onClick={async () => {
              setDownloading(true);
              setDownloadError("");
              try {
                const file = await cropImageFile(markerFile, value.markerCrop!);
                const url = URL.createObjectURL(file);
                const a = document.createElement("a");
                a.href = url;
                a.download = file.name;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 60000);
              } catch (error) {
                setDownloadError(error instanceof Error ? error.message : "Не удалось скачать фото");
              } finally {
                setDownloading(false);
              }
            }}
          >
            <Download size={18} /> {downloading ? "Готовим фото…" : "Скачать фото для печати"}
          </button>
        ) : null}
      </div>
      {(value.markerCrop || value.video) && marker.info && video.info ? (
        <div className="media-prepared-pair" aria-label="Подготовленные кадры">
          {(
            [
              { kind: "marker", info: marker.info, crop: value.markerCrop },
              { kind: "video", info: video.info, crop: value.video?.crop },
            ] as const
          ).map((item) => {
            const rect = item.crop ?? fullCrop;
            const aspect = editedAspect(item.info, rect);
            const style: CSSProperties = {
              width: `${100 / rect.width}%`,
              height: `${100 / rect.height}%`,
              left: `${(-100 * rect.x) / rect.width}%`,
              top: `${(-100 * rect.y) / rect.height}%`,
            };
            return (
              <figure key={item.kind}>
                <figcaption>
                  {item.kind === "marker" ? "Фото после кадрирования" : "Кадр видео после монтажа"}
                </figcaption>
                <div className="media-crop-stage">
                  <div
                    className="media-crop-preview"
                    style={{ aspectRatio: aspect, width: `min(100%, ${180 * aspect}px)` }}
                  >
                    {item.kind === "marker" ? (
                      <img src={item.info.url} alt="Подготовленная фотография" style={style} />
                    ) : (
                      <video
                        key={`${item.info.url}-${value.video?.segments?.[0]?.start ?? 0}`}
                        src={item.info.url}
                        muted
                        playsInline
                        preload="auto"
                        style={style}
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = value.video?.segments?.[0]?.start ?? 0;
                        }}
                      />
                    )}
                  </div>
                </div>
              </figure>
            );
          })}
        </div>
      ) : null}
      <div className="media-edit-summary">
        {marker.info ? (
          <span>
            Фото: {Math.round(marker.info.width * (value.markerCrop?.width ?? 1))} ×{" "}
            {Math.round(marker.info.height * (value.markerCrop?.height ?? 1))}
          </span>
        ) : null}
        {video.info ? (
          <span>
            Видео: {Math.round(video.info.width * (value.video?.crop?.width ?? 1))} ×{" "}
            {Math.round(video.info.height * (value.video?.crop?.height ?? 1))} ·{" "}
            {timeLabel(value.video?.segments ? segmentsDuration(value.video.segments) : video.info.duration)}
          </span>
        ) : null}
      </div>
      {value.markerCrop ? (
        <p className="media-edit-note">
          Для распознавания используйте подготовленное фото. Если фотография уже напечатана, сохраняйте её кадр и
          подгоняйте видео под фото.
        </p>
      ) : null}
      {marker.error || video.error || downloadError ? (
        <p role="alert" className="media-edit-note">
          {downloadError || marker.error || video.error}
        </p>
      ) : null}
      {editing && active ? (
        <MediaEditor
          key={active.url}
          info={active}
          kind={editing}
          crop={editing === "marker" ? value.markerCrop : value.video?.crop}
          videoEdits={value.video}
          otherAspect={editing === "marker" ? va : ma}
          onClose={() => setEditing(undefined)}
          onApply={(crop, segments) => {
            onChange(
              editing === "marker"
                ? { ...value, markerCrop: crop }
                : { ...value, video: crop || segments ? { version: 1, crop, segments } : undefined },
            );
            setEditing(undefined);
          }}
        />
      ) : null}
    </div>
  );
}

function MediaEditor({
  info,
  kind,
  crop: initialCrop,
  videoEdits,
  otherAspect,
  onClose,
  onApply,
}: {
  info: Info;
  kind: "marker" | "video";
  crop?: CropRect;
  videoEdits?: VideoEdits;
  otherAspect?: number;
  onClose(): void;
  onApply(crop: CropRect | undefined, segments: VideoSegment[] | undefined): void;
}) {
  const isVideo = kind === "video";
  const [crop, setCrop] = useState(initialCrop ?? fullCrop);
  const [segments, setSegments] = useState<VideoSegment[]>(videoEdits?.segments ?? [{ start: 0, end: info.duration }]);
  const [selected, setSelected] = useState(0);
  const [cursor, setCursor] = useState(segments[0].start);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<VideoSegment[][]>([]);
  const dialog = useRef<HTMLDialogElement>(null),
    video = useRef<HTMLVideoElement>(null);
  const pointer = useRef<{ x: number; y: number; crop: CropRect; width: number; height: number } | undefined>(
    undefined,
  );
  useEffect(() => {
    const el = dialog.current!;
    el.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const el = video.current;
      if (!el || el.paused) return;
      const time = el.currentTime;
      if (!segments.some((s) => time >= s.start && time < s.end)) {
        const next = segments.find((s) => s.start > time);
        if (next) el.currentTime = next.start;
        else {
          el.pause();
          el.currentTime = segments[0].start;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, segments]);
  const ratio = editedAspect(info, crop);
  const base = cropForAspect(info, ratio);
  const zoom = base.width / crop.width;
  const currentSegment = segments[selected];
  const seek = (time: number) => {
    setCursor(time);
    if (video.current) video.current.currentTime = time;
  };
  const pause = () => {
    video.current?.pause();
    setPlaying(false);
  };
  const changeSegments = (next: VideoSegment[]) => {
    if (next === segments) return;
    pause();
    setHistory((h) => [...h.slice(-49), segments]);
    setSegments(next);
    setSelected(0);
    seek(next[0].start);
    setError("");
  };
  const updateEdge = (edge: "start" | "end", time: number) => {
    if (!Number.isFinite(time)) return;
    const low = edge === "start" ? (segments[selected - 1]?.end ?? 0) : currentSegment.start + 0.1;
    const high = edge === "start" ? currentSegment.end - 0.1 : (segments[selected + 1]?.start ?? info.duration);
    const bounded = Math.max(low, Math.min(high, time));
    changeSegments(segments.map((s, i) => (i === selected ? { ...s, [edge]: bounded } : s)));
    setSelected(selected);
    seek(edge === "start" ? bounded : currentSegment.start);
  };
  const mediaStyle: CSSProperties = {
    width: `${100 / crop.width}%`,
    height: `${100 / crop.height}%`,
    left: `${(-100 * crop.x) / crop.width}%`,
    top: `${(-100 * crop.y) / crop.height}%`,
  };
  const isOriginal = ["x", "y", "width", "height"].every(
    (k) => Math.abs(crop[k as keyof CropRect] - fullCrop[k as keyof CropRect]) < 1e-6,
  );
  return createPortal(
    <dialog ref={dialog} className="media-editor-dialog" aria-labelledby="media-editor-title" onCancel={onClose}>
      <header className="media-editor-header">
        <div>
          <span>Подготовка AR-фото</span>
          <h2 id="media-editor-title">{isVideo ? "Кадр и монтаж видео" : "Кадрирование фото"}</h2>
        </div>
        <button type="button" aria-label="Закрыть редактор" onClick={onClose}>
          <X size={22} />
        </button>
      </header>
      <div className="media-editor-body">
        <div className="media-editor-preview-column">
          <div className="media-crop-stage">
            <div
              className="media-crop-preview"
              style={{ aspectRatio: ratio, maxHeight: "48vh", width: `min(100%, ${48 * ratio}vh)` }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                const rect = e.currentTarget.getBoundingClientRect();
                pointer.current = { x: e.clientX, y: e.clientY, crop, width: rect.width, height: rect.height };
              }}
              onPointerMove={(e) => {
                const p = pointer.current;
                if (!p) return;
                setCrop({
                  ...p.crop,
                  x: clamp(p.crop.x - ((e.clientX - p.x) / p.width) * p.crop.width, 0, 1 - p.crop.width),
                  y: clamp(p.crop.y - ((e.clientY - p.y) / p.height) * p.crop.height, 0, 1 - p.crop.height),
                });
              }}
              onPointerUp={() => {
                pointer.current = undefined;
              }}
              onPointerCancel={() => {
                pointer.current = undefined;
              }}
            >
              {isVideo ? (
                <video
                  ref={video}
                  src={info.url}
                  style={mediaStyle}
                  playsInline
                  preload="auto"
                  onPause={() => setPlaying(false)}
                  onPlay={() => setPlaying(true)}
                  onEnded={() => setPlaying(false)}
                  onTimeUpdate={() => {
                    const el = video.current!;
                    const t = el.currentTime;
                    setCursor(t);
                    if (el.paused) return;
                    const segment = segments.find((s) => t >= s.start - 0.02 && t < s.end - 0.025);
                    if (!segment) {
                      const next = segments.find((s) => s.start > t);
                      if (next) el.currentTime = next.start;
                      else {
                        el.pause();
                        seek(segments[0].start);
                      }
                    }
                  }}
                />
              ) : (
                <img src={info.url} alt="Результат кадрирования фотографии" style={mediaStyle} draggable={false} />
              )}
              <div className="media-crop-grid" aria-hidden="true" />
            </div>
          </div>
          <p className="media-edit-note">
            Перемещайте изображение в рамке или используйте ползунки. Пропорции содержимого сохраняются.
          </p>
          {isVideo ? (
            <div className="media-video-playback">
              <button
                type="button"
                onClick={async () => {
                  if (playing) pause();
                  else {
                    if (!segments.some((s) => cursor >= s.start && cursor < s.end)) seek(segments[0].start);
                    try {
                      await video.current?.play();
                    } catch {
                      setError("Не удалось воспроизвести видео в этом браузере");
                    }
                  }
                }}
              >
                {playing ? <Pause size={18} /> : <Play size={18} />}
                {playing ? "Пауза" : "Смотреть монтаж"}
              </button>
              <output>
                {timeLabel(cursor)} / {timeLabel(info.duration)}
              </output>
            </div>
          ) : null}
        </div>
        <div className="media-editor-controls">
          <h3>Формат кадра</h3>
          <div className="media-aspect-presets">
            <button type="button" aria-pressed={isOriginal} onClick={() => setCrop(fullCrop)}>
              Оригинал
            </button>
            {otherAspect ? (
              <button
                type="button"
                className="media-match-aspect"
                onClick={() => setCrop(cropForAspect(info, otherAspect))}
              >
                {isVideo ? "Соотношение фото" : "Соотношение видео"}
              </button>
            ) : null}
            {aspectPresets.map((preset) => (
              <button
                type="button"
                key={preset.label}
                aria-pressed={Math.abs(ratio - preset.ratio) < 0.001}
                onClick={() => setCrop(cropForAspect(info, preset.ratio))}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <label className="media-range-label">
            Увеличение <output>{zoom.toFixed(1)}×</output>
            <input
              aria-label="Увеличение кадра"
              type="range"
              min="1"
              max="4"
              step="0.01"
              value={zoom}
              onChange={(e) =>
                setCrop(
                  cropForAspect(
                    info,
                    ratio,
                    Number(e.target.value),
                    crop.width < 1 ? crop.x / (1 - crop.width) : 0.5,
                    crop.height < 1 ? crop.y / (1 - crop.height) : 0.5,
                  ),
                )
              }
            />
          </label>
          <label className="media-range-label">
            По горизонтали
            <input
              aria-label="Положение кадра по горизонтали"
              type="range"
              min="0"
              max="1"
              step="0.001"
              disabled={crop.width >= 0.9999}
              value={crop.width < 1 ? crop.x / (1 - crop.width) : 0.5}
              onChange={(e) => setCrop({ ...crop, x: Number(e.target.value) * (1 - crop.width) })}
            />
          </label>
          <label className="media-range-label">
            По вертикали
            <input
              aria-label="Положение кадра по вертикали"
              type="range"
              min="0"
              max="1"
              step="0.001"
              disabled={crop.height >= 0.9999}
              value={crop.height < 1 ? crop.y / (1 - crop.height) : 0.5}
              onChange={(e) => setCrop({ ...crop, y: Number(e.target.value) * (1 - crop.height) })}
            />
          </label>
          <p className="media-edit-note">
            {Math.round(info.width * crop.width)} × {Math.round(info.height * crop.height)} пикселей
            {!isVideo ? " · после кадрирования скачайте фото для печати" : " · звук сохранится"}
          </p>
        </div>
        {isVideo ? (
          <section className="media-timeline-section" aria-label="Монтаж видео">
            <div className="media-timeline-heading">
              <h3>Фрагменты видео</h3>
              <strong>Итого {timeLabel(segmentsDuration(segments))}</strong>
            </div>
            <label className="media-range-label">
              Позиция разреза: {timeLabel(cursor)}
              <input
                aria-label="Позиция разреза"
                type="range"
                min="0"
                max={info.duration}
                step="0.01"
                value={cursor}
                onChange={(e) => {
                  pause();
                  seek(Number(e.target.value));
                }}
              />
            </label>
            <div className="media-segment-strip">
              {segments.map((segment, index) => (
                <button
                  type="button"
                  key={`${index}-${segment.start}`}
                  aria-pressed={index === selected}
                  style={{ flexGrow: segment.end - segment.start }}
                  onClick={() => {
                    pause();
                    setSelected(index);
                    seek(segment.start);
                  }}
                >
                  <span>Фрагмент {index + 1}</span>
                  <small>
                    {timeLabel(segment.start)} — {timeLabel(segment.end)}
                  </small>
                </button>
              ))}
            </div>
            <div className="media-edit-actions">
              <button
                type="button"
                disabled={segments.length >= MAX_SEGMENTS || splitSegment(segments, cursor) === segments}
                onClick={() => changeSegments(splitSegment(segments, cursor))}
              >
                <Scissors size={18} /> Разрезать здесь
              </button>
              <button
                type="button"
                disabled={segments.length <= 1}
                onClick={() => changeSegments(segments.filter((_, i) => i !== selected))}
              >
                <Trash2 size={18} /> Удалить фрагмент {selected + 1}
              </button>
              <button
                type="button"
                disabled={!history.length}
                onClick={() => {
                  pause();
                  const previous = history.at(-1)!;
                  setHistory(history.slice(0, -1));
                  setSegments(previous);
                  setSelected(0);
                  seek(previous[0].start);
                }}
              >
                <Undo2 size={18} /> Отменить
              </button>
              <button type="button" onClick={() => changeSegments([{ start: 0, end: info.duration }])}>
                Восстановить всё видео
              </button>
            </div>
            <div className="media-edit-actions">
              <button
                type="button"
                disabled={cursor < (segments[selected - 1]?.end ?? 0) || cursor > currentSegment.end - 0.1}
                onClick={() => updateEdge("start", cursor)}
              >
                Начать фрагмент здесь
              </button>
              <button
                type="button"
                disabled={
                  cursor < currentSegment.start + 0.1 || cursor > (segments[selected + 1]?.start ?? info.duration)
                }
                onClick={() => updateEdge("end", cursor)}
              >
                Закончить фрагмент здесь
              </button>
            </div>
            <div className="media-trim-fields">
              <label>
                Начало фрагмента {selected + 1}, сек
                <input
                  aria-label="Начало фрагмента, секунды"
                  type="number"
                  min={segments[selected - 1]?.end ?? 0}
                  max={currentSegment.end - 0.1}
                  step="0.01"
                  value={Number(currentSegment.start.toFixed(2))}
                  onChange={(e) => updateEdge("start", e.target.valueAsNumber)}
                />
              </label>
              <label>
                Конец фрагмента {selected + 1}, сек
                <input
                  aria-label="Конец фрагмента, секунды"
                  type="number"
                  min={currentSegment.start + 0.1}
                  max={segments[selected + 1]?.start ?? info.duration}
                  step="0.01"
                  value={Number(currentSegment.end.toFixed(2))}
                  onChange={(e) => updateEdge("end", e.target.valueAsNumber)}
                />
              </label>
            </div>
            <p className="media-edit-note">
              Поставьте разрезы по краям паузы, выберите этот фрагмент и удалите. Оставшиеся части соединятся по порядку
              вместе со звуком. До {MAX_SEGMENTS} фрагментов.
            </p>
          </section>
        ) : null}
        {error ? <p role="alert">{error}</p> : null}
      </div>
      <footer className="media-editor-footer">
        <button type="button" onClick={onClose}>
          Отмена
        </button>
        <button
          className="media-editor-apply"
          type="button"
          onClick={() =>
            onApply(
              isOriginal ? undefined : crop,
              isVideo && !(segments.length === 1 && segments[0].start === 0 && segments[0].end === info.duration)
                ? segments
                : undefined,
            )
          }
        >
          Применить изменения
        </button>
      </footer>
    </dialog>,
    document.body,
  );
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function timeLabel(seconds: number) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(1).padStart(4, "0")}`;
}
