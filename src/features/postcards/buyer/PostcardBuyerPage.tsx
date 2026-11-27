import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { Check, Copy, Download, Film, LockKeyhole, RefreshCw, Upload } from "lucide-react";
import { Link, UNSAFE_NavigationContext, useNavigate, useParams, type Navigator } from "react-router-dom";
import { Button } from "../../../shared/ui";
import {
  createEditToken,
  postcardEditLink,
  readEditToken,
  readPendingUploadId,
  rememberPendingUploadId,
  clearPendingUploadId,
} from "./postcardBuyerAccess";
import { registerBuyerHistoryGuard } from "./postcardBuyerHistory";
import { inspectBuyerVideo } from "./postcardBuyerMedia";
import {
  PostcardBuyerApi,
  PostcardBuyerError,
  publicCardTokenPattern,
  uploadSignedBlob,
  type BuyerMode,
  type BuyerSnapshot,
  type BuyerUpload,
  type BuyerVideoMetadata,
} from "./postcardBuyerApi";
import "./PostcardBuyerPage.css";

const stageNames: Record<string, string> = {
  marker_analysis: "Проверяем изображение открытки",
  video_inspection: "Проверяем видео",
  video_transcode: "Подготавливаем видео",
  marker_compilation: "Подготавливаем распознавание",
  thumbnail_generation: "Создаём предпросмотр",
};
type PickedVideo = { file: File; metadata: BuyerVideoMetadata; url: string; key: string };
type PendingUpload = { inputKey: string; requestId: string; registration?: BuyerUpload; uploaded: boolean };

export function PostcardBuyerRoute() {
  const { publicToken = "" } = useParams();
  return <PostcardBuyerPage key={publicToken} publicToken={publicToken} />;
}

export function PostcardBuyerPage({ publicToken }: { publicToken: string }) {
  const validToken = publicCardTokenPattern.test(publicToken);
  const api = useMemo(() => new PostcardBuyerApi(), []);
  const navigate = useNavigate();
  const initialAccess = useMemo(() => {
    if (!publicCardTokenPattern.test(publicToken))
      return { token: null, error: "Ссылка открытки повреждена. Отсканируйте QR на открытке заново." };
    try {
      return { token: readEditToken(publicToken), error: "" };
    } catch (error) {
      return { token: null, error: readableError(error) };
    }
  }, [publicToken]);
  const [editToken, setEditToken] = useState(initialAccess.token);
  const [snapshot, setSnapshot] = useState<BuyerSnapshot | null>(null);
  const [loading, setLoading] = useState(validToken);
  const [error, setError] = useState(initialAccess.error);
  const [notice, setNotice] = useState("");
  const [shopCode, setShopCode] = useState("");
  const [mode, setMode] = useState<BuyerMode>("frame");
  const [picked, setPicked] = useState<PickedVideo | null>(null);
  const [busy, setBusy] = useState<"claim" | "inspect" | "upload" | "publish" | "refresh" | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [completedInput, setCompletedInput] = useState<string | null>(null);
  const [pollingError, setPollingError] = useState("");
  const [uploadInterrupted, setUploadInterrupted] = useState(false);
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null);
  const operation = useRef<AbortController | null>(null);
  const pendingUpload = useRef<PendingUpload | null>(null);
  const owned = Boolean(snapshot?.owned && editToken);
  const inputKey = picked ? `${picked.key}:${mode}` : null;
  const changed = Boolean(
    owned && snapshot && (mode !== snapshot.card.mode || (picked && completedInput !== inputKey)),
  );
  const processing = snapshot?.card.state === "processing";
  const processingFailed = Boolean(
    snapshot?.jobs?.some((job) => job.status === "failed" || job.status === "cancelled"),
  );
  const processedPreview =
    (snapshot?.card.state === "ready" || snapshot?.card.state === "published") &&
    (!picked || completedInput === inputKey) &&
    mode === snapshot.card.mode;
  const videoUrl = processedPreview
    ? (snapshot?.videoPreviewUrl ?? picked?.url ?? null)
    : (picked?.url ?? snapshot?.videoPreviewUrl ?? null);
  const previewAvailable = Boolean(videoUrl && failedPreviewUrl !== videoUrl);

  useEffect(() => () => operation.current?.abort(), []);
  useEffect(
    () => () => {
      if (picked?.url) URL.revokeObjectURL(picked.url);
    },
    [picked],
  );
  useEffect(() => {
    if (!publicCardTokenPattern.test(publicToken)) return;
    const controller = new AbortController();
    api
      .lookup(publicToken, initialAccess.token, controller.signal)
      .then((data) => {
        setSnapshot(data);
        setMode(data.card.mode);
        if (!initialAccess.error) setError("");
      })
      .catch((problem) => {
        if (!controller.signal.aborted) setError(readableError(problem));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [api, publicToken, initialAccess]);

  useEffect(() => {
    if (!processing || !owned || !editToken || processingFailed) return;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const data = await api.state(publicToken, editToken, controller.signal);
        setSnapshot(data);
        setPollingError("");
      } catch (problem) {
        if (!controller.signal.aborted) setPollingError(readableError(problem));
      }
      if (!controller.signal.aborted) timeout = setTimeout(() => void poll(), 4000);
    };
    timeout = setTimeout(() => void poll(), 1500);
    return () => {
      controller.abort();
      if (timeout) clearTimeout(timeout);
    };
  }, [api, publicToken, editToken, processing, owned, processingFailed]);

  useEffect(() => {
    if (snapshot?.card.state === "published" && !snapshot.owned && snapshot.card.publicSlug)
      navigate(`/ar/${snapshot.card.publicSlug}`, { replace: true });
  }, [snapshot, navigate]);

  useBuyerDepartureGuard(Boolean(busy || changed), Boolean(busy));

  const begin = (kind: NonNullable<typeof busy>) => {
    operation.current?.abort();
    const controller = new AbortController();
    operation.current = controller;
    setBusy(kind);
    setError("");
    setNotice("");
    return controller;
  };
  const finish = (controller: AbortController) => {
    if (!controller.signal.aborted) setBusy(null);
  };
  const claim = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^(?:[0-9]{4}|[A-F0-9]{12})$/.test(shopCode.replace(/[\s·-]+/g, "").toUpperCase())) return;
    const controller = begin("claim");
    try {
      const token = editToken ?? createEditToken(publicToken);
      setEditToken(token);
      const data = await api.claim(publicToken, shopCode, token, controller.signal);
      setSnapshot(data);
      setMode(data.card.mode);
      setShopCode("");
      setNotice("Код принят. Выберите видео.");
    } catch (problem) {
      if (!controller.signal.aborted) setError(readableError(problem));
    } finally {
      finish(controller);
    }
  };
  const pickVideo = async (file?: File) => {
    if (!file || !snapshot) return;
    const controller = begin("inspect");
    try {
      const metadata = await inspectBuyerVideo(file, snapshot.limits, controller.signal);
      if (controller.signal.aborted) return;
      setPicked({ file, metadata, url: URL.createObjectURL(file), key: JSON.stringify(metadata) });
      setCompletedInput(null);
      setUploadInterrupted(false);
      pendingUpload.current = null;
    } catch (problem) {
      if (!controller.signal.aborted) setError(readableError(problem));
    } finally {
      finish(controller);
    }
  };
  const sendVideo = async () => {
    if (!picked || !snapshot || !editToken || !inputKey) return;
    if (
      snapshot.card.state === "published" &&
      !window.confirm(
        "Заменить видео в подарке? Пока новое видео обрабатывается, просмотр открытки будет временно недоступен.",
      )
    )
      return;
    const controller = begin("upload");
    setUploadProgress(null);
    try {
      let pending = pendingUpload.current;
      if (!pending || pending.inputKey !== inputKey) {
        pending = {
          inputKey,
          requestId: readPendingUploadId(publicToken, inputKey) ?? crypto.randomUUID(),
          uploaded: false,
        };
        rememberPendingUploadId(publicToken, inputKey, pending.requestId);
        pendingUpload.current = pending;
      }
      if (!pending.uploaded) {
        pending.registration = await api.upload(
          publicToken,
          editToken,
          pending.requestId,
          mode,
          picked.metadata,
          controller.signal,
        );
        setUploadProgress(0);
        // The marker is the publisher's immutable printed PNG. The buyer sends only video.
        await uploadSignedBlob(
          pending.registration.video.signedUrl,
          new Blob([picked.file], { type: picked.metadata.mimeType }),
          setUploadProgress,
          controller.signal,
          pending.registration.video.headers,
        );
        pending.uploaded = true;
      }
      if (!pending.registration) throw new PostcardBuyerError("upload_incomplete");
      const data = await api.completeUpload(publicToken, editToken, pending.registration.uploadId, controller.signal);
      setSnapshot(data);
      setCompletedInput(inputKey);
      clearPendingUploadId(publicToken);
      pendingUpload.current = null;
      setUploadInterrupted(false);
    } catch (problem) {
      if (
        problem instanceof PostcardBuyerError &&
        ["upload_expired", "request_conflict", "upload_superseded"].includes(problem.code)
      ) {
        clearPendingUploadId(publicToken);
        pendingUpload.current = null;
      }
      if (!controller.signal.aborted) {
        setError(readableError(problem));
        setUploadInterrupted(true);
      }
    } finally {
      finish(controller);
    }
  };
  const refresh = async () => {
    api.clearPreviewCache();
    const controller = begin("refresh");
    try {
      const data =
        owned && editToken
          ? await api.state(publicToken, editToken, controller.signal)
          : await api.lookup(publicToken, editToken, controller.signal);
      setSnapshot(data);
      if (!picked) setMode(data.card.mode);
      setPollingError("");
    } catch (problem) {
      if (!controller.signal.aborted) setError(readableError(problem));
    } finally {
      finish(controller);
    }
  };
  const publish = async () => {
    if (!editToken || snapshot?.card.state !== "ready" || changed || !previewAvailable) return;
    const controller = begin("publish");
    try {
      const data = await api.publish(publicToken, editToken, controller.signal);
      setSnapshot(data);
      setNotice("Открытка сохранена.");
    } catch (problem) {
      if (!controller.signal.aborted) setError(readableError(problem));
    } finally {
      finish(controller);
    }
  };
  const backup = useCallback(
    async (download: boolean) => {
      if (!editToken) return;
      const link = postcardEditLink(publicToken, editToken);
      try {
        if (download) {
          const file = new Blob(
            [
              `Хан Зама — личная ссылка управления открыткой\n\n${link}\n\nСохраните этот файл для замены видео. Получателю подарите открытку с обычным QR.\n`,
            ],
            { type: "text/plain;charset=utf-8" },
          );
          const url = URL.createObjectURL(file);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = "Хан-Зама-доступ-к-открытке.txt";
          anchor.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setNotice("Файл с личной ссылкой подготовлен. Сохраните его в надёжном месте.");
        } else {
          await navigator.clipboard.writeText(link);
          setNotice("Личная ссылка скопирована. Сохраните её для управления своим видео.");
        }
      } catch {
        setError("Не удалось скопировать ссылку. Скачайте файл доступа другой кнопкой.");
      }
    },
    [publicToken, editToken],
  );

  const state = snapshot?.card.state;
  const normalizedShopCode = shopCode.replace(/[\s·-]+/g, "").toUpperCase();
  const validShopCode = /^(?:[0-9]{4}|[A-F0-9]{12})$/.test(normalizedShopCode);
  const step = !owned ? 0 : state === "ready" || state === "published" ? 2 : 1;
  const editing = state === "claimed" || Boolean(picked && completedInput !== inputKey) || processingFailed;
  const videoEditor = snapshot ? (
    <section className="postcard-buyer-panel">
      <h2>Выберите видео</h2>
      <label
        className={`btn ${picked ? "btn-ghost" : "btn-primary"} postcard-buyer-picker ${busy || (processing && !processingFailed) ? "postcard-buyer-picker-disabled" : ""}`}
      >
        <Film size={18} />
        <span>{picked ? "Выбрать другое видео" : "Выбрать видео"}</span>
        <input
          className="sr-only"
          type="file"
          accept="video/mp4,video/quicktime,video/webm,.mp4,.m4v,.mov,.webm"
          aria-label="Выбрать видео для открытки"
          disabled={Boolean(busy) || (processing && !processingFailed)}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            void pickVideo(file);
          }}
        />
      </label>
      <p className="postcard-buyer-hint">
        MP4, MOV или WebM · до {Math.floor(snapshot.limits.maxVideoBytes / 1024 / 1024)} МБ · до{" "}
        {Math.floor(snapshot.limits.maxVideoSeconds)} секунд.
      </p>
      {(picked || videoUrl) && (
        <>
          <fieldset className="postcard-buyer-modes" disabled={Boolean(busy) || (processing && !processingFailed)}>
            <legend className="sr-only">Область видео</legend>
            {(["frame", "full"] as const).map((value) => (
              <label
                className={mode === value ? "postcard-buyer-mode postcard-buyer-mode-selected" : "postcard-buyer-mode"}
                key={value}
              >
                <input
                  type="radio"
                  name="postcard-video-mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                <span>
                  <strong>{value === "frame" ? "Внутри рамки" : "На всю открытку"}</strong>
                </span>
              </label>
            ))}
          </fieldset>
        </>
      )}
      {picked && (
        <p className="postcard-buyer-file">
          {picked.file.name}
          <small>
            {Math.ceil(picked.file.size / 1024 / 1024)} МБ · {Math.ceil(picked.metadata.durationSeconds)} с
          </small>
        </p>
      )}
      {busy === "inspect" && <p role="status">Читаем выбранное видео…</p>}
      {busy === "upload" && (
        <div className="postcard-buyer-progress" role="status">
          <p>{uploadProgress === null ? "Подготавливаем загрузку…" : `Загружаем видео: ${uploadProgress}%`}</p>
          <progress max={100} value={uploadProgress ?? undefined} aria-label="Загрузка видео" />
        </div>
      )}
      {picked && (!processing || processingFailed) && (
        <Button disabled={Boolean(busy)} icon={<Upload size={18} />} onClick={() => void sendVideo()}>
          {busy === "upload"
            ? "Загружаем…"
            : error && uploadInterrupted
              ? "Повторить загрузку"
              : state === "published"
                ? "Заменить видео"
                : "Загрузить видео"}
        </Button>
      )}
      {picked && !busy && <p className="postcard-buyer-hint">Видео пока видно только вам.</p>}
    </section>
  ) : null;
  return (
    <div className="postcard-buyer-page">
      <header className="postcard-buyer-header">
        <Link to="/" className="postcard-buyer-brand">
          KHANZAMA
        </Link>
        <span>Открытка с вашим видео</span>
      </header>
      <main className="postcard-buyer-main">
        {loading ? (
          <section className="postcard-buyer-panel" aria-busy="true">
            <h1>Открываем открытку</h1>
            <p role="status">Проверяем QR и доступ…</p>
          </section>
        ) : !snapshot ? (
          <section className="postcard-buyer-panel">
            <h1>Не удалось открыть открытку</h1>
            <p role="alert">{error}</p>
            <Button
              onClick={() => void refresh()}
              disabled={Boolean(busy) || !publicCardTokenPattern.test(publicToken)}
              icon={<RefreshCw size={18} />}
            >
              Повторить
            </Button>
          </section>
        ) : (
          <>
            <div className="postcard-buyer-heading">
              <h1>
                {owned
                  ? state === "published"
                    ? "Ваш подарок готов"
                    : state === "ready"
                      ? "Проверьте открытку"
                      : "Добавьте своё видео"
                  : "Открытка с видео"}
              </h1>
              <ol className="postcard-buyer-steps" aria-label="Подготовка открытки">
                {["Код", "Видео", state === "published" ? "Готово" : "Проверка"].map((label, index) => (
                  <li
                    key={index}
                    aria-current={step === index ? "step" : undefined}
                    className={step >= index ? "is-active" : ""}
                  >
                    <span aria-hidden="true">{step > index ? <Check size={14} /> : index + 1}</span>
                    {label}
                  </li>
                ))}
              </ol>
            </div>
            <div
              className={`postcard-buyer-layout ${owned ? "postcard-buyer-layout-owned" : "postcard-buyer-layout-activation"}`}
            >
              <section
                className={`postcard-buyer-preview-section ${owned && !videoUrl ? "postcard-buyer-preview-small" : ""}`}
                aria-label="Предпросмотр открытки"
              >
                <PostcardPreview
                  imageUrl={snapshot.previewImageUrl}
                  videoUrl={owned ? videoUrl : null}
                  frame={
                    snapshot.card.templateCode === "milka-gift"
                      ? { x: 0.053, y: 0.242, width: 0.894, height: 0.423 }
                      : snapshot.card.frame
                  }
                  roundedFrame={snapshot.card.templateCode === "milka-gift"}
                  mode={mode}
                  onVideoError={() => setFailedPreviewUrl(videoUrl)}
                  onVideoReady={() => setFailedPreviewUrl(null)}
                />
                {owned && videoUrl && (
                  <p className="postcard-buyer-hint">
                    {mode === "frame" ? "Видео внутри рамки" : "Видео на всю открытку"} · края могут обрезаться.
                  </p>
                )}
              </section>
              <div className="postcard-buyer-controls">
                {notice && (
                  <p role="status" className="postcard-buyer-notice">
                    <Check size={18} />
                    {notice}
                  </p>
                )}
                {error && (
                  <div className="postcard-buyer-error" role="alert">
                    <p>{error}</p>
                    {error.includes("попыток") && <p>Повторите позже; код магазина заново не сохраняется.</p>}
                  </div>
                )}
                {!owned ? (
                  state === "available" ? (
                    <section className="postcard-buyer-panel">
                      <h2>Активируйте открытку</h2>

                      <form onSubmit={(event) => void claim(event)} className="postcard-buyer-form">
                        <label htmlFor="postcard-shop-code">Код с вкладыша</label>
                        <input
                          className="field-control"
                          id="postcard-shop-code"
                          value={shopCode}
                          onChange={(event) => setShopCode(event.target.value)}
                          autoComplete="off"
                          inputMode="numeric"
                          spellCheck={false}
                          maxLength={64}
                          required
                          disabled={Boolean(busy)}
                          placeholder="4 цифры"
                          autoFocus
                        />
                        <Button
                          type="submit"
                          disabled={Boolean(busy) || !validShopCode}
                          icon={<LockKeyhole size={18} />}
                        >
                          {busy === "claim" ? "Закрепляем открытку…" : "Активировать открытку"}
                        </Button>
                      </form>
                      <p className="postcard-buyer-hint">Код — на вкладыше. Регистрация не нужна.</p>
                    </section>
                  ) : (
                    <section className="postcard-buyer-panel">
                      <LockKeyhole size={26} />
                      <h2>
                        {state === "published"
                          ? "Открываем ваш подарок"
                          : state === "unavailable"
                            ? "Открытка пока недоступна"
                            : "Открытка уже закреплена"}
                      </h2>
                      <p>
                        {state === "unavailable"
                          ? "Открытка пока недоступна. Обратитесь в магазин."
                          : "Если это ваша открытка, откройте сохранённую личную ссылку управления. Код магазина не открывает доступ к чужому видео."}
                      </p>
                      {state === "published" && snapshot.card.publicSlug && (
                        <Link className="btn btn-primary" to={`/ar/${snapshot.card.publicSlug}`}>
                          Открыть подарок
                        </Link>
                      )}
                      <Button variant="quiet" onClick={() => void refresh()} disabled={Boolean(busy)}>
                        Обновить состояние
                      </Button>
                    </section>
                  )
                ) : (
                  <>
                    {editing ? (
                      videoEditor
                    ) : (
                      <details className="postcard-buyer-editor">
                        <summary>Изменить видео</summary>
                        {videoEditor}
                      </details>
                    )}
                    {(processing || state === "ready" || state === "published") && (
                      <section className="postcard-buyer-panel" aria-label="Готовность подарка">
                        <h2>
                          {state === "published"
                            ? "Можно дарить"
                            : state === "ready"
                              ? "Готово к сохранению"
                              : processingFailed
                                ? "Нужно другое видео"
                                : "Подготавливаем подарок"}
                        </h2>
                        {processing && (
                          <>
                            <p>
                              {processingFailed
                                ? "Обработка не завершилась. Выберите видео заново и повторите загрузку."
                                : "Это займёт несколько минут. Страницу можно оставить открытой."}
                            </p>
                            <ul className="postcard-buyer-jobs">
                              {snapshot.jobs?.map((job, index) => (
                                <li key={`${job.stage}-${index}`}>
                                  <span>{stageNames[job.stage] ?? "Подготовка открытки"}</span>
                                  <strong>
                                    {job.status === "succeeded"
                                      ? "Готово"
                                      : job.status === "failed" || job.status === "cancelled"
                                        ? "Не завершено"
                                        : job.status === "processing" || job.status === "running"
                                          ? `${Math.round(job.progress)}%`
                                          : "В очереди"}
                                  </strong>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {pollingError && <p role="alert">{pollingError}</p>}
                        {state === "ready" && (
                          <>
                            <p>После сохранения видео откроется по QR на открытке.</p>
                            {changed && (
                              <p className="postcard-buyer-hint">
                                Вы изменили видео или область показа. Сначала загрузите выбранный вариант.
                              </p>
                            )}
                            {!previewAvailable && (
                              <p role="alert">
                                Предпросмотр видео временно недоступен. Обновите состояние и проверьте видео перед
                                публикацией.
                              </p>
                            )}
                            <Button
                              onClick={() => void publish()}
                              disabled={Boolean(busy) || changed || !previewAvailable}
                            >
                              {busy === "publish" ? "Сохраняем…" : "Сохранить открытку"}
                            </Button>
                          </>
                        )}
                        {state === "published" && snapshot.card.publicSlug && (
                          <>
                            <p>Подарите открытку получателю. Её QR откроет просмотр без регистрации.</p>
                            <Link className="btn btn-primary" to={`/ar/${snapshot.card.publicSlug}`}>
                              Посмотреть подарок
                            </Link>
                          </>
                        )}
                        {(processing || (state === "ready" && !previewAvailable)) && (
                          <Button
                            variant="quiet"
                            icon={<RefreshCw size={17} />}
                            disabled={Boolean(busy)}
                            onClick={() => void refresh()}
                          >
                            Обновить состояние
                          </Button>
                        )}
                      </section>
                    )}
                    <details className="postcard-buyer-access">
                      <summary>Сохранить доступ к видео</summary>
                      <h2>
                        <LockKeyhole size={18} />
                        Сохраните доступ к своему видео
                      </h2>
                      <p>Личная ссылка нужна для замены видео. Получателю подарите открытку с обычным QR.</p>
                      <div>
                        <Button
                          variant="ghost"
                          icon={<Copy size={17} />}
                          disabled={Boolean(busy)}
                          onClick={() => void backup(false)}
                        >
                          Скопировать личную ссылку
                        </Button>
                        <Button
                          variant="quiet"
                          icon={<Download size={17} />}
                          disabled={Boolean(busy)}
                          onClick={() => void backup(true)}
                        >
                          Скачать файл доступа
                        </Button>
                      </div>
                    </details>
                  </>
                )}
              </div>
            </div>
          </>
        )}
        <footer className="postcard-buyer-footer">
          <Link to="/privacy">Конфиденциальность</Link>
          <span>Хан Зама</span>
        </footer>
      </main>
    </div>
  );
}

function PostcardPreview({
  imageUrl,
  videoUrl,
  frame,
  roundedFrame,
  mode,
  onVideoError,
  onVideoReady,
}: {
  imageUrl?: string | null;
  videoUrl: string | null;
  frame: BuyerSnapshot["card"]["frame"];
  roundedFrame: boolean;
  mode: BuyerMode;
  onVideoError: () => void;
  onVideoReady: () => void;
}) {
  const viewport = mode === "full" ? { x: 0, y: 0, width: 1, height: 1 } : frame;
  const style: CSSProperties = {
    left: `${viewport.x * 100}%`,
    top: `${viewport.y * 100}%`,
    width: `${viewport.width * 100}%`,
    height: `${viewport.height * 100}%`,
    borderRadius: roundedFrame && mode === "frame" ? "7% / 10%" : undefined,
  };
  return (
    <div className="postcard-buyer-preview">
      {imageUrl ? (
        <img src={imageUrl} alt="Ваша печатная открытка" referrerPolicy="no-referrer" />
      ) : (
        <div className="postcard-buyer-preview-unavailable">
          <p>Изображение открытки временно недоступно.</p>
        </div>
      )}
      {videoUrl && (
        <video
          key={videoUrl}
          src={videoUrl}
          style={style}
          controls
          playsInline
          preload="metadata"
          aria-label="Предпросмотр вашего видео"
          onError={onVideoError}
          onLoadedData={onVideoReady}
        />
      )}
    </div>
  );
}

function readableError(error: unknown) {
  if (error instanceof PostcardBuyerError && error.retryAfterSeconds)
    return `${error.message} Повторите через ${Math.ceil(error.retryAfterSeconds)} с.`;
  return error instanceof Error ? error.message : "Не удалось выполнить действие. Повторите немного позже.";
}

/** Keep a selected File and its upload controller mounted until navigation is confirmed. */
function useBuyerDepartureGuard(active: boolean, uploading: boolean) {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const guard = useRef({ active, uploading });
  useLayoutEffect(() => {
    guard.current = { active, uploading };
  }, [active, uploading]);
  useEffect(() => installBuyerDepartureGuard(navigator, guard), [navigator]);
}

/** BrowserRouter has no blocker API: wrap only this mounted buyer lifetime and restore on cleanup. */
function installBuyerDepartureGuard(navigator: Navigator, guard: { current: { active: boolean; uploading: boolean } }) {
  const readIndex = (state: unknown): number | null =>
    state && typeof state === "object" && "idx" in state && typeof state.idx === "number" ? state.idx : null;
  let currentIndex = readIndex(window.history.state);
  let restoring: { originalIndex: number; delta: number } | null = null;
  let allowedPopIndex: number | null = null;
  const confirm = () =>
    !guard.current.active ||
    window.confirm(
      guard.current.uploading
        ? "Прервать подготовку или загрузку и уйти? Несохранённое видео не будет опубликовано."
        : "Уйти без загрузки? Выбранное видео и изменения области показа пока не сохранены.",
    );
  const originalPush = navigator.push;
  const originalReplace = navigator.replace;
  const push: typeof navigator.push = (...args) => {
    if (confirm()) {
      originalPush.apply(navigator, args);
      currentIndex = readIndex(window.history.state);
    }
  };
  const replace: typeof navigator.replace = (...args) => {
    if (confirm()) {
      originalReplace.apply(navigator, args);
      currentIndex = readIndex(window.history.state);
    }
  };
  navigator.push = push;
  navigator.replace = replace;
  const pop = (event: PopStateEvent) => {
    const targetIndex = readIndex(event.state);
    if (allowedPopIndex !== null && targetIndex === allowedPopIndex) {
      allowedPopIndex = null;
      currentIndex = targetIndex;
      return;
    }
    if (restoring) {
      // Suppress both the attempted POP and its restoration before BrowserRouter sees them.
      event.stopImmediatePropagation();
      if (targetIndex !== restoring.originalIndex) {
        if (targetIndex !== null) window.history.go(restoring.originalIndex - targetIndex);
        return;
      }
      const { delta, originalIndex } = restoring;
      restoring = null;
      if (confirm()) {
        allowedPopIndex = originalIndex - delta;
        window.history.go(-delta);
      }
      return;
    }
    if (!guard.current.active || currentIndex === null || targetIndex === null || currentIndex === targetIndex) {
      currentIndex = targetIndex;
      return;
    }
    event.stopImmediatePropagation();
    restoring = { originalIndex: currentIndex, delta: currentIndex - targetIndex };
    // Restore the exact history entry before asking; cancel never unmounts the File/upload state.
    window.history.go(restoring.delta);
  };
  const unload = (event: BeforeUnloadEvent) => {
    if (guard.current.active) {
      event.preventDefault();
      event.returnValue = "";
    }
  };
  const unregisterPop = registerBuyerHistoryGuard(pop);
  window.addEventListener("beforeunload", unload);
  return () => {
    if (navigator.push === push) navigator.push = originalPush;
    if (navigator.replace === replace) navigator.replace = originalReplace;
    unregisterPop();
    window.removeEventListener("beforeunload", unload);
  };
}
