import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Download, Printer, X } from "lucide-react";
import { Button, Select } from "../../shared/ui";
import { createPostcardPdf, createPostcardPrintFrameHtml, type PostcardPrintPageSize } from "./postcardPrint";
import "./PostcardPrintReview.css";

export type PostcardReviewCard = { publicToken: string; ordinal: number; blob: Blob; url: string };
export type PostcardReview = {
  id: string;
  selection: string;
  cards: PostcardReviewCard[];
  pageSize: PostcardPrintPageSize;
  originFocus: HTMLElement | null;
  originScroll: number;
};

export default function PostcardPrintReview({
  review,
  open,
  templateCode,
  batchId,
  batchName,
  onClose,
}: {
  review: PostcardReview;
  open: boolean;
  templateCode: string;
  batchId: string;
  batchName: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const title = useId();
  const [included, setIncluded] = useState(() => review.cards.map((card) => card.publicToken));
  const [pageSize, setPageSize] = useState(review.pageSize);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [printReady, setPrintReady] = useState(false);
  const [pdf, setPdf] = useState<{ url: string; name: string; key: string } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const selected = useMemo(
    () => review.cards.filter((card) => included.includes(card.publicToken)),
    [included, review.cards],
  );
  const selectionKey = JSON.stringify([pageSize, selected.map((card) => card.publicToken)]);
  const printHtml = useMemo(
    () => (selected.length ? createPostcardPrintFrameHtml(selected, pageSize) : ""),
    [pageSize, selected],
  );
  const readyPdf = pdf?.key === selectionKey ? pdf : null;
  useEffect(
    () => () => {
      if (pdf) URL.revokeObjectURL(pdf.url);
    },
    [pdf],
  );
  useEffect(() => {
    const element = dialog.current!;
    if (!open) {
      controller.current?.abort();
      return;
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      controller.current?.abort();
      element.close();
      document.body.style.overflow = overflow;
      if (review.originFocus?.isConnected) review.originFocus.focus({ preventScroll: true });
      window.scrollTo(0, review.originScroll);
    };
  }, [open, review]);
  const change = (tokens: string[]) => {
    setIncluded(tokens);
    setPdf(null);
    setError("");
    setProgress("");
    setPrintReady(false);
  };
  const makePdf = async () => {
    setPending(true);
    setError("");
    setProgress("Готовим PDF…");
    const abort = new AbortController();
    controller.current = abort;
    try {
      const blob = await createPostcardPdf(templateCode, selected, pageSize, {
        signal: abort.signal,
        onProgress: (done, total) => setProgress(`Готовим PDF: ${done} из ${total}`),
      });
      abort.signal.throwIfAborted();
      const url = URL.createObjectURL(blob);
      const format = pageSize === "photo" ? "10x15" : pageSize === "a4" ? "A4-2up" : "A4-4up";
      const name = `postcards-${batchId}-${format}-${selected.length}.pdf`;
      setPdf({ url, name, key: selectionKey });
      setProgress("PDF готов к скачиванию.");
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
    } catch (cause) {
      if (!abort.signal.aborted)
        setError(cause instanceof Error ? cause.message : "Не удалось подготовить PDF. Повторите попытку.");
      else setProgress("");
    } finally {
      setPending(false);
      controller.current = null;
    }
  };
  return (
    <dialog
      ref={dialog}
      className="postcard-print-review"
      aria-labelledby={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="postcard-print-review-head">
        <div>
          <h2 id={title}>Проверка перед печатью</h2>
          <p>{batchName}</p>
        </div>
        <button
          autoFocus
          className="btn btn-ghost"
          type="button"
          aria-label="Закрыть проверку печати"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </header>
      <div className="postcard-print-review-options">
        <div className="postcard-print-review-selection">
          <Button
            variant="quiet"
            disabled={pending}
            onClick={() => change(review.cards.map((card) => card.publicToken))}
          >
            Выбрать все
          </Button>
          <Button variant="quiet" disabled={pending} onClick={() => change([])}>
            Снять выбор
          </Button>
          <span role="status">
            Выбрано {selected.length} из {review.cards.length}
          </span>
        </div>
        <Select
          label="Формат печати"
          value={pageSize}
          disabled={pending}
          options={[
            { value: "photo", label: "10 × 15 см · одна открытка на листе" },
            { value: "a4", label: "A4 · две открытки на листе" },
            { value: "a4-four", label: "A4 · четыре открытки на листе · 95%" },
          ]}
          onChange={(event) => {
            setPageSize(event.target.value as PostcardPrintPageSize);
            setPdf(null);
            setProgress("");
            setError("");
            setPrintReady(false);
          }}
        />
      </div>
      <div className="postcard-print-review-grid">
        {review.cards.map((card) => (
          <label
            key={card.publicToken}
            className={`postcard-print-review-card ${included.includes(card.publicToken) ? "is-selected" : ""}`}
          >
            <span>
              <input
                type="checkbox"
                disabled={pending}
                checked={included.includes(card.publicToken)}
                aria-label={`Печатать открытку ${card.ordinal}`}
                onChange={(event) =>
                  change(
                    event.target.checked
                      ? [...included, card.publicToken]
                      : included.filter((token) => token !== card.publicToken),
                  )
                }
              />
              Открытка № {card.ordinal}
            </span>
            <img
              src={card.url}
              width={1200}
              height={1800}
              alt={`Открытка № ${card.ordinal} для печати`}
              loading="lazy"
            />
          </label>
        ))}
      </div>
      <footer className="postcard-print-review-footer">
        <div className="postcards-actions">
          {readyPdf ? (
            <a className="btn btn-primary" href={readyPdf.url} download={readyPdf.name}>
              <Download size={17} aria-hidden="true" />
              Скачать PDF
            </a>
          ) : (
            <Button icon={<Download size={17} />} disabled={pending || !selected.length} onClick={() => void makePdf()}>
              {pending ? "Готовим PDF…" : "Скачать PDF"}
            </Button>
          )}
          <Button
            variant="ghost"
            icon={<Printer size={17} />}
            disabled={pending || !selected.length || !printReady}
            onClick={() => {
              try {
                frame.current?.contentWindow?.focus();
                frame.current?.contentWindow?.print();
              } catch {
                setError("Печать недоступна в этом браузере. Скачайте PDF.");
              }
            }}
          >
            Печатать
          </Button>
        </div>
        <p className="postcards-muted">
          {pageSize === "a4"
            ? `A4 · две открытки на листе · листов: ${Math.ceil(selected.length / 2)} · масштаб 100%`
            : pageSize === "a4-four"
              ? `A4 · четыре открытки на листе · листов: ${Math.ceil(selected.length / 4)} · масштаб 95% (95 × 142,5 мм)`
              : `10 × 15 см · листов: ${selected.length} · масштаб 100%`}
        </p>
        {progress && <p role="status">{progress}</p>}
        {error && <p role="alert">{error}</p>}
      </footer>
      <iframe
        key={selectionKey}
        ref={frame}
        title="Печатные листы открыток"
        sandbox="allow-same-origin allow-modals"
        className="postcard-print-review-frame"
        srcDoc={printHtml}
        onLoad={() => {
          const images = frame.current?.contentDocument?.images;
          setPrintReady(
            Boolean(
              selected.length &&
              images?.length === selected.length &&
              [...images].every((image) => image.complete && image.naturalWidth > 0),
            ),
          );
        }}
      />
    </dialog>
  );
}
