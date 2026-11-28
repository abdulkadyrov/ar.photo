import { useEffect, useRef, useState } from "react";
import type { ArDiagnosticFile, ArDiagnosticsEngine, ArDiagnosticState } from "./arDiagnostics";
import "./ArDiagnosticPanel.css";

export function ArDiagnosticPanel({
  engine,
  state,
}: {
  engine: ArDiagnosticsEngine | null;
  state: ArDiagnosticState | null;
}) {
  const [notice, setNotice] = useState("");
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const result = state?.result;
  useEffect(() => {
    if (!result) return;
    const next = URL.createObjectURL(result.blob);
    if (downloadRef.current) downloadRef.current.href = next;
    return () => URL.revokeObjectURL(next);
  }, [result]);
  const share = async () => {
    if (!result) return;
    const files = (result.warning ? result.files : [result]).map(
      (file) => new File([file.blob], file.fileName, { type: file.blob.type }),
    );
    if (!navigator.canShare?.({ files })) {
      setNotice("Нажмите «Скачать файл» и сохраните его в «Файлы».");
      return;
    }
    try {
      await navigator.share({ files, title: "Диагностика AR" });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setNotice("Не удалось поделиться. Скачайте файл по ссылке ниже.");
    }
  };
  const start = () => {
    setNotice("");
    try {
      engine?.start();
    } catch {
      setNotice("Не удалось начать запись. Откройте страницу в Safari и повторите.");
    }
  };
  const stop = async () => {
    try {
      await engine?.stop();
    } catch {
      setNotice("Не удалось завершить запись. Сообщите код ошибки ниже в чат.");
    }
  };
  return (
    <section className="ar-diagnostic-panel" aria-label="Диагностика AR">
      <strong>Диагностика камеры · 2</strong>
      <p role="status">
        {state?.status === "recording"
          ? `Запись · ${Math.floor(state.elapsedMs / 1000)} / 45 с. Прямо → наклон → ближе → движение.`
          : state?.status === "processing"
            ? "Готовим файл… Не закрывайте страницу."
            : result
              ? result.warning || "Запись готова. Сохраните файл и прикрепите его в чат."
              : "Снимите открытку 30 секунд. Без микрофона; файл остаётся на телефоне."}
      </p>
      {state?.status === "recording" ? (
        <button type="button" onClick={() => void stop()}>
          Завершить запись
        </button>
      ) : state?.status === "processing" ? null : result ? (
        <div className="ar-diagnostic-actions">
          <button type="button" onClick={() => void share()}>
            Поделиться файлом
          </button>
          <a ref={downloadRef} download={result.fileName}>
            {result.warning ? "Скачать журнал" : "Скачать архив"}
          </a>
          {result.files
            .filter((file) => file.fileName !== result.fileName)
            .map((file) => (
              <DiagnosticFileLink key={file.fileName} file={file} />
            ))}
          <button type="button" onClick={start}>
            Записать ещё раз
          </button>
        </div>
      ) : (
        <button type="button" disabled={!engine?.supported} onClick={start}>
          Начать диагностику
        </button>
      )}
      {engine && !engine.supported ? (
        <p role="alert">Запись камеры недоступна в этом браузере. Откройте ссылку в Safari.</p>
      ) : null}
      {notice || state?.message ? <p role="alert">{state?.message || notice}</p> : null}
    </section>
  );
}

function DiagnosticFileLink({ file }: { file: ArDiagnosticFile }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file.blob);
    if (ref.current) ref.current.href = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <a ref={ref} download={file.fileName}>
      {file.fileName.startsWith("camera.")
        ? "Скачать видео"
        : file.fileName === "diagnostics.json"
          ? "Скачать журнал"
          : "Данные распознавания"}
    </a>
  );
}
