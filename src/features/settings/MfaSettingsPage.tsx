import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, KeyRound, ShieldCheck, Smartphone, Monitor, ChevronRight } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import { Button, ErrorState, Input, Panel, Skeleton, Toast } from "../../shared/ui";
import { getMfaSettingsRepository, MfaSettingsError, type MfaEnrollment } from "./mfaRepository";
import "./SettingsPages.css";

const mfaRepository = getMfaSettingsRepository();

export function SecurityRoute() {
  const queryClient = useQueryClient();
  const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const statusQuery = useQuery({ queryKey: ["settings", "mfa"], queryFn: () => mfaRepository.getStatus() });
  const confirmMutation = useMutation({
    mutationFn: () => mfaRepository.verifyEnrollment(statusQuery.data!.verifiedFactorId!, code),
    onSuccess: async () => {
      setCode("");
      setSessionVerified(true);
      await queryClient.invalidateQueries({ queryKey: ["admin", "access"] });
    },
  });
  const enrollMutation = useMutation({
    mutationFn: () => mfaRepository.beginEnrollment(),
    onSuccess: (result) => {
      setEnrollment(result);
      setCode("");
    },
  });
  const verifyMutation = useMutation({
    mutationFn: () => mfaRepository.verifyEnrollment(enrollment!.factorId, code),
    onSuccess: async () => {
      setEnrollment(null);
      setCode("");
      setNotice("Второй фактор подключён. Защищённые операции теперь доступны после ввода одноразового кода.");
      await queryClient.invalidateQueries({ queryKey: ["settings", "mfa"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "access"] });
    },
  });
  const cancelMutation = useMutation({
    mutationFn: () => mfaRepository.cancelEnrollment(enrollment!.factorId),
    onSuccess: () => {
      setEnrollment(null);
      setCode("");
    },
  });

  return (
    <AppShell
      eyebrow="Защита аккаунта"
      title="Безопасность аккаунта"
      description="Пароль и двухфакторная защита вашего аккаунта"
      compactMobile
      breadcrumbs={<Link to="/settings">Настройки</Link>}
    >
      <Panel className="security-password-card mt-5">
        <span className="metric-icon">
          <KeyRound size={23} />
        </span>
        <div>
          <h2>Изменить пароль</h2>
          <p>Обновите пароль для входа в KHANZAMA.</p>
        </div>
        <Link className="btn btn-primary" to="/update-password">
          <span>Изменить пароль</span>
          <ChevronRight size={18} />
        </Link>
      </Panel>

      {notice ? (
        <div className="mt-5">
          <Toast title="MFA настроена" message={notice} tone="success" onDismiss={() => setNotice(null)} />
        </div>
      ) : null}

      {statusQuery.isPending ? (
        <Panel className="mt-6 max-w-3xl">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="mt-4 h-20 w-full" />
        </Panel>
      ) : statusQuery.error ? (
        <div className="mt-6 max-w-3xl">
          <ErrorState
            title="Не удалось проверить MFA"
            text={readableError(statusQuery.error)}
            action={<Button onClick={() => void statusQuery.refetch()}>Повторить</Button>}
          />
        </div>
      ) : statusQuery.data?.configured ? (
        <Panel className="security-factor-card mt-5">
          <div className="security-factor-heading">
            <span className="metric-icon">
              <Smartphone size={23} />
            </span>
            <div>
              <h2>Двухфакторная аутентификация (MFA)</h2>
              <p>Дополнительная защита аккаунта с подтверждением кода.</p>
            </div>
            <span className="security-enabled">
              <Check size={15} />
              Включена
            </span>
          </div>
          <form
            className="security-confirm-form"
            onSubmit={(event) => {
              event.preventDefault();
              confirmMutation.mutate();
            }}
          >
            <h3>Подтвердить сеанс</h3>
            <p>Введите код из приложения-аутентификатора, чтобы подтвердить, что это вы.</p>
            <label htmlFor="mfa-session-code">Одноразовый код</label>
            <div className="security-code-input">
              <div
                aria-hidden="true"
                className="security-code-cells"
                style={{ gridTemplateColumns: `repeat(${Math.max(6, code.length)},minmax(0,1fr))` }}
              >
                {Array.from({ length: Math.max(6, code.length) }, (_, index) => (
                  <span key={index}>{code[index] ?? "—"}</span>
                ))}
              </div>{" "}
              <Input
                id="mfa-session-code"
                className="security-code-native"
                aria-label="Одноразовый код"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={8}
                placeholder="000000"
                value={code}
                onValueChange={(value) => {
                  setCode(value.replace(/\D/g, ""));
                  setSessionVerified(false);
                }}
              />
            </div>
            <Button type="submit" disabled={confirmMutation.isPending || code.length < 6}>
              {confirmMutation.isPending ? "Проверяем…" : "Подтвердить сеанс"}
            </Button>
            {confirmMutation.error ? <ErrorMessage error={confirmMutation.error} /> : null}
            {sessionVerified ? (
              <p className="security-confirmed" role="status">
                <ShieldCheck size={16} />
                Сеанс подтверждён. Можно изменить пароль.
              </p>
            ) : null}
          </form>
        </Panel>
      ) : enrollment ? (
        <Panel className="mt-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="metric-icon">
              <Smartphone size={22} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Шаг 2 из 2</p>
              <h2 className="mt-1 text-2xl font-semibold">Отсканируйте QR-код</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr] md:items-start">
            <div className="mx-auto rounded-3xl bg-white p-4 shadow-soft">
              <QRCodeSVG aria-label="QR-код для подключения TOTP" value={enrollment.uri} size={208} />
            </div>
            <div>
              <ol className="grid gap-2 text-sm leading-6 text-muted">
                <li>1. Откройте Microsoft Authenticator, Google Authenticator или 1Password.</li>
                <li>2. Добавьте аккаунт и отсканируйте QR-код.</li>
                <li>3. Введите появившийся одноразовый код ниже.</li>
              </ol>
              <div className="mt-5 rounded-2xl border border-line bg-white/[0.025] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Ключ для ручного ввода</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all text-sm text-ink">{enrollment.secret}</code>
                  <Button
                    aria-label="Скопировать ключ"
                    variant="quiet"
                    onClick={() => void copySecret(enrollment.secret, setCopied)}
                  >
                    {copied ? <Check size={17} /> : <Copy size={17} />}
                  </Button>
                </div>
              </div>
              <form
                className="mt-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  verifyMutation.mutate();
                }}
              >
                <label className="text-sm font-semibold" htmlFor="mfa-enrollment-code">
                  Одноразовый код
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Input
                    id="mfa-enrollment-code"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="123456"
                    value={code}
                    onValueChange={(value) => setCode(value.replace(/\D/g, ""))}
                  />
                  <Button type="submit" disabled={verifyMutation.isPending || code.length < 6}>
                    {verifyMutation.isPending ? "Проверяем…" : "Подтвердить"}
                  </Button>
                </div>
              </form>
              {verifyMutation.error ? <ErrorMessage error={verifyMutation.error} /> : null}
              {cancelMutation.error ? <ErrorMessage error={cancelMutation.error} /> : null}
              <Button
                className="mt-4"
                variant="quiet"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                Отменить настройку
              </Button>
            </div>
          </div>
        </Panel>
      ) : (
        <Panel className="mt-6 max-w-3xl">
          <div className="flex items-start gap-4">
            <span className="metric-icon">
              <KeyRound size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Шаг 1 из 2</p>
              <h2 className="mt-2 text-2xl font-semibold">Подключите второй фактор</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Пароль остаётся основным способом входа. Второй фактор дополнительно защищает смену пароля и другие
                важные действия.
              </p>
              <Button className="mt-5" disabled={enrollMutation.isPending} onClick={() => enrollMutation.mutate()}>
                {enrollMutation.isPending ? "Создаём QR-код…" : "Настроить MFA"}
              </Button>
              {enrollMutation.error ? <ErrorMessage error={enrollMutation.error} /> : null}
            </div>
          </div>
        </Panel>
      )}

      <Panel className="security-current-session mt-5">
        <div>
          <span className="metric-icon">
            <Monitor size={22} />
          </span>
          <div>
            <h2>Текущий сеанс</h2>
            <p>Активный вход в кабинет сейчас.</p>
          </div>
        </div>
        <p>
          <span className="security-enabled">Активен сейчас</span>
          <span>Этот браузер</span>
        </p>
        <details>
          <summary>Мои устройства и сеансы</summary>
          <p>Список других устройств и завершение удалённых сеансов пока недоступны.</p>
        </details>
      </Panel>
      <p className="mt-4 max-w-3xl text-xs leading-5 text-muted">
        QR-код и секрет показываются только во время настройки. KHANZAMA не записывает их в профиль, проекты или журнал
        действий.
      </p>
    </AppShell>
  );
}

function ErrorMessage({ error }: { error: unknown }) {
  return (
    <p className="mt-3 text-sm text-rose-700" role="alert">
      {readableError(error)}
    </p>
  );
}

function readableError(error: unknown) {
  if (error instanceof MfaSettingsError) return error.message;
  return "Не удалось выполнить настройку MFA";
}

async function copySecret(secret: string, setCopied: (copied: boolean) => void) {
  await navigator.clipboard.writeText(secret);
  setCopied(true);
  window.setTimeout(() => setCopied(false), 1800);
}
