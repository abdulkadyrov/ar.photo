import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostcardBuyerApi, PostcardBuyerError } from "../postcards/buyer/postcardBuyerApi";
import { parseDiagnosticQr, type DiagnosticQr } from "./diagnosticQr";
import { startQrCamera, stopMediaStream, waitForQr } from "./qrProjectScanner";
import "./ArDiagnosticEntryPage.css";

export function ArDiagnosticEntryRoute() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"idle" | "scanning" | "resolving">("idle");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const camera = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const operation = useRef<AbortController | null>(null);
  const stop = useCallback(() => {
    operation.current?.abort();
    operation.current = null;
    stopMediaStream(stream.current);
    stream.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  const parse = (value: string) => parseDiagnosticQr(value, window.location.origin, import.meta.env.BASE_URL);
  const open = async (qr: DiagnosticQr, signal: AbortSignal) => {
    setMode("resolving");
    stopMediaStream(stream.current);
    stream.current = null;
    let slug = qr.id;
    if (qr.kind === "card") {
      const snapshot = await new PostcardBuyerApi().lookup(qr.id, null, signal);
      signal.throwIfAborted();
      if (snapshot.card.state !== "published" || !snapshot.card.publicSlug) {
        throw new Error("Для диагностики нужна открытка с уже сохранённым и опубликованным видео.");
      }
      slug = snapshot.card.publicSlug;
    }
    signal.throwIfAborted();
    navigate(`/ar/${slug}?diagnostics=1`);
  };
  const run = async (scan: boolean) => {
    stop();
    const controller = new AbortController();
    operation.current = controller;
    setMessage("");
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      let qr: DiagnosticQr | null;
      if (scan) {
        setMode("scanning");
        if (!camera.current) throw new Error("Не удалось открыть камеру. Повторите попытку.");
        const next = await startQrCamera(camera.current, controller.signal);
        if (controller.signal.aborted) {
          stopMediaStream(next);
          return;
        }
        stream.current = next;
        qr = await waitForQr(camera.current, {
          signal: controller.signal,
          accept: parse,
          onRejected: () => setMessage("Нужен QR-код открытки Хан Зама с этого сайта."),
        });
      } else {
        qr = parse(link);
        if (!qr) throw new Error("Вставьте ссылку из QR-кода открытки Хан Зама с этого сайта.");
      }
      timeout = setTimeout(() => controller.abort(new DOMException("Lookup timeout", "TimeoutError")), 30000);
      await open(qr, controller.signal);
    } catch (error) {
      if (controller.signal.aborted && controller.signal.reason?.name !== "TimeoutError") return;
      stopMediaStream(stream.current);
      stream.current = null;
      setMode("idle");
      if (controller.signal.reason?.name === "TimeoutError")
        setMessage("Ответ не получен. Проверьте интернет и повторите.");
      else if (error instanceof DOMException && error.name === "NotAllowedError")
        setMessage("Разрешите доступ к камере в Safari или вставьте ссылку из QR-кода ниже.");
      else if (error instanceof PostcardBuyerError) setMessage(error.message);
      else setMessage(error instanceof Error ? error.message : "Не удалось открыть открытку. Повторите попытку.");
    } finally {
      clearTimeout(timeout);
    }
  };

  return (
    <main className="ar-diagnostic-entry">
      <a className="ar-diagnostic-brand" href={import.meta.env.BASE_URL}>
        KHANZAMA
      </a>
      <h1>Проверка AR на iPhone</h1>
      <p>Откройте эту страницу в Safari и приготовьте открытку с уже сохранённым видео.</p>
      <ol>
        <li>Нажмите «Сканировать QR» и наведите камеру на код открытки.</li>
        <li>В AR-просмотре нажмите «Начать диагностику».</li>
        <li>Снимайте около 30 секунд: прямо, под наклоном, вблизи и с небольшими движениями руки.</li>
        <li>Завершите запись и сохраните файл для отправки в этот чат.</li>
      </ol>
      <p className="ar-diagnostic-privacy">
        Записываются исходные кадры камеры и работа отслеживания. Микрофон не используется. Файл остаётся на устройстве,
        пока вы сами его не отправите. Снимайте только открытку, без личных вещей в кадре.
      </p>
      <video
        ref={camera}
        className="ar-diagnostic-camera"
        hidden={mode !== "scanning"}
        autoPlay
        muted
        playsInline
        aria-label="Камера для сканирования QR-кода"
      />
      {mode === "scanning" && <p role="status">Наведите камеру на QR-код открытки.</p>}
      {mode === "resolving" && <p role="status">Открываем диагностику…</p>}
      {message && (
        <p className="ar-diagnostic-message" role="alert">
          {message}
        </p>
      )}
      {mode === "idle" ? (
        <button className="ar-diagnostic-primary" type="button" onClick={() => void run(true)}>
          Сканировать QR
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            stop();
            setMode("idle");
            setMessage("");
          }}
        >
          Отмена
        </button>
      )}
      <details>
        <summary>Или вставьте ссылку из QR-кода</summary>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void run(false);
          }}
        >
          <label htmlFor="diagnostic-card-link">Ссылка на открытку</label>
          <input
            id="diagnostic-card-link"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://khanzama.ru/ar.photo/card/…"
            required
            disabled={mode !== "idle"}
          />
          <button type="submit" disabled={mode !== "idle" || !link.trim()}>
            Открыть диагностику
          </button>
        </form>
      </details>
    </main>
  );
}
