import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getMfaSettingsRepository } from "../settings/mfaRepository";
import { Button } from "../../shared/ui";
import { useAuth } from "./authContext";

export function MfaVerificationCard({ onVerified, onBack }: { onVerified: () => void; onBack?: () => void }) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const repository = getMfaSettingsRepository();
  const status = useQuery({ queryKey: ["mfa-settings", auth.session?.user.id], queryFn: () => repository.getStatus() });
  const verification = useMutation({
    mutationFn: async () => {
      if (!status.data?.verifiedFactorId) throw new Error("Подключите второй фактор в настройках безопасности.");
      await repository.verifyEnrollment(status.data.verifiedFactorId, code);
    },
    onSuccess: async () => {
      setCode("");
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      onVerified();
    },
  });
  return (
    <div className="auth-mfa-card">
      {onBack ? (
        <button type="button" className="auth-back" onClick={onBack}>
          <ArrowLeft size={16} />
          Назад
        </button>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (/^\d{6}$/.test(code)) verification.mutate();
        }}
      >
        <label htmlFor="access-mfa-code">Код из приложения-аутентификатора</label>
        <div className="auth-code-input">
          <div className="auth-code-cells" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index} className={index === code.length ? "auth-code-current" : ""}>
                {code[index] ?? ""}
              </span>
            ))}
          </div>
          <input
            id="access-mfa-code"
            aria-label="Код MFA"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            disabled={verification.isPending}
          />
        </div>
        {status.isError ? (
          <p role="alert">
            Не удалось проверить второй фактор.{" "}
            <button type="button" onClick={() => void status.refetch()}>
              Повторить
            </button>
          </p>
        ) : null}
        {status.data && !status.data.configured ? (
          <p role="status">
            Второй фактор ещё не подключён. <Link to="/settings/security">Настроить MFA</Link>
          </p>
        ) : null}
        {verification.error ? <p role="alert">{verification.error.message}</p> : null}
        <Button
          full
          type="submit"
          disabled={code.length !== 6 || !status.data?.verifiedFactorId || verification.isPending}
          icon={verification.isPending ? <LoaderCircle size={17} className="animate-spin" /> : undefined}
        >
          {verification.isPending ? "Проверяем…" : "Подтвердить"}
        </Button>
      </form>
      <Link className="auth-mfa-recovery" to="/support">
        Нет доступа к приложению?
      </Link>
      <p className="auth-mfa-caption">Обратитесь к администратору для восстановления доступа.</p>
    </div>
  );
}
