import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Camera, ScanLine, X } from "lucide-react";
import { Button } from "../../shared/ui";
import "./PostcardScanner.css";

import { postcardCameraError, startPostcardScanner, type PostcardScanResult } from "./postcardScannerCamera";

export function PostcardScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => PostcardScanResult | Promise<PostcardScanResult>;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controller = useRef<AbortController | null>(null);
  const closed = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState<"starting" | "scanning" | "error">("starting");
  const [message, setMessage] = useState("");
  const [detectedCount, setDetectedCount] = useState(0);
  const [feedback, setFeedback] = useState<PostcardScanResult | null>(null);
  const feedbackSequence = useRef(0);
  const detected = useEffectEvent((code: string) => {
    const lifetime = controller.current;
    const sequence = ++feedbackSequence.current;
    void Promise.resolve()
      .then(() => onDetected(code))
      .then((result) => {
        if (!lifetime || lifetime.signal.aborted) return;
        if (result?.accepted) setDetectedCount((old) => old + 1);
        if (sequence === feedbackSequence.current)
          setFeedback({
            accepted: Boolean(result?.accepted),
            message:
              result?.message ||
              (result?.accepted
                ? "Открытка добавлена в выбор."
                : "Открытка не добавлена. Проверьте тираж и выбранное действие."),
          });
      })
      .catch(() => {
        if (!lifetime || lifetime.signal.aborted || sequence !== feedbackSequence.current) return;
        setFeedback({
          accepted: false,
          message: "Не удалось добавить открытку. Повторите сканирование или введите номер вручную.",
        });
      });
  });
  const close = () => {
    if (closed.current) return;
    closed.current = true;
    controller.current?.abort();
    if (dialog.current?.open) {
      if (typeof dialog.current.close === "function") dialog.current.close();
      else dialog.current.removeAttribute("open");
    }
    onClose();
  };
  useEffect(() => {
    const previousFocus = document.activeElement;
    const element = dialog.current;
    if (element && !element.open) {
      if (typeof element.showModal === "function") element.showModal();
      else element.setAttribute("open", "");
    }
    return () => {
      controller.current?.abort();
      if (element?.open && typeof element.close === "function") element.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  useEffect(() => {
    const lifetime = new AbortController();
    controller.current = lifetime;
    let cancelled = false;
    // StrictMode must not prompt twice during its setup/cleanup probe.
    queueMicrotask(() => {
      if (cancelled || lifetime.signal.aborted) return;
      setMode("starting");
      setMessage("");
      setFeedback(null);
      const target = video.current;
      if (!target) return;
      void startPostcardScanner(target, {
        signal: lifetime.signal,
        onDetected: detected,
        onReady: () => {
          if (!lifetime.signal.aborted) setMode("scanning");
        },
        onError: (error) => {
          if (!lifetime.signal.aborted) {
            setMessage(postcardCameraError(error));
            setMode("error");
          }
        },
      }).catch((error) => {
        if (!lifetime.signal.aborted) {
          setMessage(postcardCameraError(error));
          setMode("error");
        }
      });
    });
    return () => {
      cancelled = true;
      lifetime.abort();
    };
  }, [attempt]);
  return (
    <dialog
      ref={dialog}
      className="postcard-scanner-dialog"
      aria-labelledby="postcard-scanner-title"
      aria-describedby="postcard-scanner-description"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section className="postcard-scanner-content">
        <header>
          <h2 id="postcard-scanner-title">
            <ScanLine size={21} />
            Сканировать открытки
          </h2>
          <Button variant="quiet" aria-label="Закрыть камеру" onClick={close}>
            <X size={22} />
          </Button>
        </header>
        <p id="postcard-scanner-description">
          Наведите камеру на QR открытки. После считывания переходите к следующей — окно можно не закрывать.
        </p>
        <div className="postcard-scanner-camera">
          <video ref={video} autoPlay muted playsInline aria-label="Камера для сканирования QR" />
          <span className="postcard-scanner-guide" aria-hidden="true" />
        </div>
        {mode === "starting" && (
          <p className="postcard-scanner-status" role="status">
            <Camera size={18} />
            Открываем камеру… Разрешите доступ в запросе браузера.
          </p>
        )}
        {mode === "scanning" && (
          <p className="postcard-scanner-status" role="status">
            {detectedCount
              ? `Добавлено открыток: ${detectedCount}. Уберите код из кадра и наведите на следующую открытку.`
              : "Держите QR полностью в кадре и дождитесь считывания."}
          </p>
        )}
        {feedback && (
          <p
            className={`postcard-scanner-feedback ${feedback.accepted ? "postcard-scanner-feedback-accepted" : "postcard-scanner-feedback-rejected"}`}
            role={feedback.accepted ? "status" : "alert"}
          >
            {feedback.message}
          </p>
        )}
        {mode === "error" && (
          <div className="postcard-scanner-error" role="alert">
            <p>{message}</p>
            <Button variant="ghost" onClick={() => setAttempt((old) => old + 1)}>
              Повторить запуск камеры
            </Button>
          </div>
        )}
        <footer>
          <span>
            Кадры обрабатываются на устройстве. Сканирование только выбирает экземпляры и не активирует открытку.
          </span>
          <Button variant="ghost" onClick={close}>
            Готово, закрыть камеру
          </Button>
        </footer>
      </section>
    </dialog>
  );
}
