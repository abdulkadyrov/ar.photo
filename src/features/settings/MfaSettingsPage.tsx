import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import { Button, ErrorState, Input, Panel, Skeleton, Toast } from "../../shared/ui";
import { getMfaSettingsRepository, MfaSettingsError, type MfaEnrollment } from "./mfaRepository";

const mfaRepository = getMfaSettingsRepository();

export function SecurityRoute() {
  const queryClient = useQueryClient();
  const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const statusQuery = useQuery({ queryKey: ["settings", "mfa"], queryFn: () => mfaRepository.getStatus() });
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
      title="Безопасность"
      description="Подключите приложение-аутентификатор для доступа к операциям супер-администратора."
    >
      <SettingsSecurityNavigation />

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
        <Panel className="mt-6 max-w-3xl">
          <div className="flex items-start gap-4">
            <span className="metric-icon bg-emerald-300/10 text-emerald-200">
              <ShieldCheck size={23} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Подключено</p>
              <h2 className="mt-2 text-2xl font-semibold">TOTP защищает ваш аккаунт</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                При открытии супер-админки введите актуальный код из приложения-аутентификатора.
              </p>
              <Link className="btn btn-primary mt-5" to="/admin">
                Перейти в супер-админ
              </Link>
            </div>
          </div>
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
                Пароль остаётся основным способом входа. Для удаления пользователей, блокировок и изменения подписок
                дополнительно потребуется одноразовый код.
              </p>
              <Button className="mt-5" disabled={enrollMutation.isPending} onClick={() => enrollMutation.mutate()}>
                {enrollMutation.isPending ? "Создаём QR-код…" : "Настроить MFA"}
              </Button>
              {enrollMutation.error ? <ErrorMessage error={enrollMutation.error} /> : null}
            </div>
          </div>
        </Panel>
      )}

      <p className="mt-4 max-w-3xl text-xs leading-5 text-muted">
        QR-код и секрет показываются только во время настройки. AR Photo не записывает их в профиль, проекты или журнал
        действий.
      </p>
    </AppShell>
  );
}

function SettingsSecurityNavigation() {
  return (
    <nav aria-label="Разделы настроек" className="mt-6 flex gap-2 overflow-x-auto pb-1">
      <Link className="btn btn-quiet whitespace-nowrap" to="/settings">
        Аккаунт
      </Link>
      <Link className="btn btn-quiet whitespace-nowrap" to="/settings/subscription">
        Тариф и лимиты
      </Link>
      <Link className="btn btn-quiet whitespace-nowrap" to="/settings/team">
        Команда
      </Link>
      <span className="btn btn-primary whitespace-nowrap" aria-current="page">
        Безопасность
      </span>
    </nav>
  );
}

function ErrorMessage({ error }: { error: unknown }) {
  return (
    <p className="mt-3 text-sm text-rose-300" role="alert">
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
