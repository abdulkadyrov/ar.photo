import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  Info,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm, type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { Button, Panel } from "../../shared/ui";
import { useAuth } from "./authContext";
import { getSignUpErrorMessage } from "./authErrors";
import "./AuthPages.css";
import { MfaVerificationCard } from "./MfaVerificationPage";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  type LoginValues,
  type RegisterValues,
  type ResetPasswordValues,
  type UpdatePasswordValues,
} from "./authSchemas";

export function LoginRoute() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: auth.mode === "demo" ? "demo@arphoto.local" : "", password: "" },
  });

  if (auth.mode === "unconfigured") {
    return (
      <AuthLayout
        title="Конфигурация сервиса недоступна"
        description="AR Photo временно не может подключиться к backend."
      >
        <FormNotice tone="error">Вход отключён. Повторите попытку позже или сообщите службе поддержки.</FormNotice>
      </AuthLayout>
    );
  }

  if (auth.status === "authenticated") return <Navigate replace to={returnTo} />;

  const submit = handleSubmit(async (values) => {
    setFormError("");
    try {
      await auth.signIn(values.email, values.password);
      navigate(returnTo, { replace: true });
    } catch {
      setFormError("Не удалось войти. Проверьте email и пароль и повторите попытку.");
    }
  });

  return (
    <AuthLayout title="Вход в кабинет" description="Войдите, чтобы создавать и управлять AR-работами.">
      <form className="space-y-4" onSubmit={submit} noValidate>
        <AuthField
          label="Email"
          icon={<Mail size={17} />}
          error={errors.email}
          inputProps={register("email")}
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
        />
        <AuthField
          label="Пароль"
          icon={<LockKeyhole size={17} />}
          error={errors.password}
          inputProps={register("password")}
          type="password"
          autoComplete="current-password"
          placeholder="Не менее 8 символов"
        />
        <Link className="auth-recovery-link" to="/reset-password">
          Забыли пароль?
        </Link>
        {formError ? <FormNotice tone="error">{formError}</FormNotice> : null}
        <Button
          full
          disabled={isSubmitting}
          icon={isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : undefined}
        >
          {isSubmitting ? "Входим…" : "Войти"}
        </Button>
      </form>
      <Link className="btn btn-ghost auth-register-link" to="/register">
        Создать аккаунт
      </Link>
    </AuthLayout>
  );
}

export function RegisterRoute() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  if (auth.status === "authenticated") return <Navigate replace to="/dashboard" />;

  const submit = handleSubmit(async (values) => {
    setFormError("");
    try {
      const result = await auth.signUp(values);
      if (result.confirmationRequired) {
        setConfirmationEmail(values.email);
        return;
      }
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFormError(getSignUpErrorMessage(error));
    }
  });

  return (
    <AuthLayout
      variant="register"
      icon={<UserRoundPlus size={26} />}
      title="Регистрация кабинета"
      description="Создайте кабинет, чтобы добавлять фото и видео и публиковать AR-работы."
    >
      {confirmationEmail ? (
        <div aria-live="polite">
          <FormNotice tone="success">
            Письмо отправлено на {confirmationEmail}. Подтвердите email, затем войдите — рабочее пространство создастся
            автоматически.
          </FormNotice>
          <Link className="btn btn-ghost mt-5 w-full" to="/login">
            Перейти ко входу
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit} noValidate>
          <AuthField
            label="Ваше имя"
            icon={<UserRound size={17} />}
            error={errors.fullName}
            inputProps={register("fullName")}
            autoComplete="name"
            placeholder="Имя и фамилия"
          />
          <AuthField
            label="Email"
            icon={<Mail size={17} />}
            error={errors.email}
            inputProps={register("email")}
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
          />
          <AuthField
            label="Пароль"
            icon={<LockKeyhole size={17} />}
            error={errors.password}
            inputProps={register("password")}
            type="password"
            autoComplete="new-password"
            placeholder="8+ символов, A–Z, a–z и цифра"
          />
          <AuthField
            label="Повторите пароль"
            icon={<LockKeyhole size={17} />}
            error={errors.confirmPassword}
            inputProps={register("confirmPassword")}
            type="password"
            autoComplete="new-password"
            placeholder="Повторите пароль"
          />
          <PasswordRequirements />
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-muted">
            <input className="mt-1 h-4 w-4 accent-primary" type="checkbox" {...register("termsAccepted")} />
            <span>
              Я подтверждаю право использовать загружаемые фотографии и видео.{" "}
              <Link to="/privacy">Конфиденциальность</Link>
            </span>
          </label>
          {errors.termsAccepted ? (
            <p className="text-xs font-medium text-rose-700">{errors.termsAccepted.message}</p>
          ) : null}
          {formError ? <FormNotice tone="error">{formError}</FormNotice> : null}
          <Button
            full
            disabled={isSubmitting}
            icon={isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : undefined}
          >
            {isSubmitting ? "Создаём…" : "Создать кабинет"}
          </Button>
          <p className="auth-existing">
            Уже есть кабинет? <Link to="/login">Войти</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPasswordRoute() {
  const auth = useAuth();
  const emailEnabled = auth.mode === "demo" || import.meta.env.VITE_AUTH_EMAIL_ENABLED !== "false";
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { email: "" } });

  const submit = handleSubmit(async ({ email }) => {
    setFormError("");
    try {
      await auth.requestPasswordReset(email);
      setSent(true);
    } catch {
      setFormError("Не удалось отправить письмо. Повторите попытку позже.");
    }
  });

  return (
    <AuthLayout
      variant="reset"
      title="Восстановление доступа к кабинету"
      description={
        emailEnabled
          ? "Укажите email своего аккаунта."
          : "Восстановление доступа через персональную ссылку смены пароля."
      }
    >
      {!emailEnabled ? (
        <div>
          <FormNotice tone="error">
            Письма восстановления ещё не настроены. Для восстановления доступа нужна персональная ссылка от
            администратора AR Photo.
          </FormNotice>
          <Link className="btn btn-ghost mt-5 w-full" to="/login">
            Вернуться ко входу
          </Link>
        </div>
      ) : sent ? (
        <div aria-live="polite">
          <FormNotice tone="success">
            Если такой аккаунт существует, инструкция уже отправлена. Проверьте входящие и папку «Спам».
          </FormNotice>
          <Link className="btn btn-ghost mt-5 w-full" to="/login">
            <ArrowLeft size={17} /> Вернуться ко входу
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit} noValidate>
          <AuthField
            label="Email"
            icon={<Mail size={17} />}
            error={errors.email}
            inputProps={register("email")}
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
          />
          {formError ? <FormNotice tone="error">{formError}</FormNotice> : null}
          <Button
            full
            disabled={isSubmitting}
            icon={isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : undefined}
          >
            {isSubmitting ? "Отправляем…" : "Получить ссылку"}
          </Button>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted" to="/login">
            <ArrowLeft size={16} /> Вернуться ко входу
          </Link>
        </form>
      )}
      <div className="auth-help">
        <Info size={19} />
        <p>Если электронная почта недоступна, обратитесь к администратору для восстановления доступа к кабинету.</p>
      </div>
    </AuthLayout>
  );
}

export function UpdatePasswordRoute({ recovery = false }: { recovery?: boolean }) {
  const auth = useAuth();
  const [recoveryToken] = useState(() =>
    recovery ? new URLSearchParams(window.location.hash.slice(1)).get("token_hash") : null,
  );
  const [recoveryVerified, setRecoveryVerified] = useState(false);
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [confirmingMfa, setConfirmingMfa] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const submit = handleSubmit(async ({ password }) => {
    setFormError("");
    try {
      if (recovery && !recoveryVerified) {
        const client = getSupabaseBrowserClient();
        if (!client || !recoveryToken) throw new Error("Recovery link missing");
        const { error } = await client.auth.verifyOtp({ token_hash: recoveryToken, type: "recovery" });
        if (error) throw error;
        setRecoveryVerified(true);
        window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      }
      await auth.updatePassword(password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : "";
      setMfaRequired(code === "insufficient_aal");
      setFormError(
        code === "same_password"
          ? "Новый пароль должен отличаться от текущего."
          : code === "insufficient_aal"
            ? "Для смены пароля подтвердите код MFA в разделе безопасности."
            : "Не удалось сохранить пароль. Ссылка могла устареть; запросите новую ссылку у администратора.",
      );
    }
  });

  return (
    <AuthLayout
      variant={confirmingMfa ? "mfa" : "password"}
      icon={confirmingMfa ? undefined : <LockKeyhole size={26} />}
      title={confirmingMfa ? "Подтвердите вход" : "Новый пароль"}
      description={confirmingMfa ? "Второй фактор (MFA)" : "Задайте новый пароль для своего аккаунта KHANZAMA."}
    >
      {confirmingMfa ? (
        <MfaVerificationCard
          onVerified={() => {
            setConfirmingMfa(false);
            setMfaRequired(false);
            setFormError("");
          }}
          onBack={() => setConfirmingMfa(false)}
        />
      ) : (
        <>
          {recovery && !recoveryToken && !recoveryVerified ? (
            <FormNotice tone="error">
              Откройте персональную ссылку восстановления. Если вы уже вошли,{" "}
              <Link to="/update-password">продолжите смену пароля</Link>.
            </FormNotice>
          ) : null}
          <form className="space-y-4" onSubmit={submit} noValidate>
            <AuthField
              label="Новый пароль"
              icon={<LockKeyhole size={17} />}
              error={errors.password}
              inputProps={register("password")}
              type="password"
              autoComplete="new-password"
              placeholder="8+ символов, A–Z, a–z и цифра"
            />
            <AuthField
              label="Повторите пароль"
              icon={<LockKeyhole size={17} />}
              error={errors.confirmPassword}
              inputProps={register("confirmPassword")}
              type="password"
              autoComplete="new-password"
              placeholder="Повторите новый пароль"
            />
            <PasswordRequirements detailed />
            {mfaRequired ? (
              <div className="auth-mfa-needed" role="alert">
                <ShieldCheck size={24} />
                <div>
                  <strong>Требуется подтверждение MFA</strong>
                  <p>Подтвердите второй фактор. Введённый пароль сохранится в этой форме.</p>
                  <Button type="button" onClick={() => setConfirmingMfa(true)}>
                    Подтвердить MFA
                  </Button>
                </div>
              </div>
            ) : null}
            {formError && !mfaRequired ? <FormNotice tone="error">{formError}</FormNotice> : null}
            <Button
              full
              disabled={isSubmitting || mfaRequired || (recovery && !recoveryToken && !recoveryVerified)}
              icon={isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : undefined}
            >
              {isSubmitting ? "Сохраняем…" : "Сохранить пароль"}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}

export function AuthLayout({
  title,
  description,
  children,
  variant = "login",
  icon,
}: {
  title: string;
  description: string;
  children: ReactNode;
  variant?: "login" | "register" | "reset" | "password" | "mfa";
  icon?: ReactNode;
}) {
  const auth = useAuth();
  return (
    <main className={`auth-page auth-page-${variant}`}>
      <header className="auth-page-header">
        <Link className="auth-wordmark" to="/">
          KHANZAMA
        </Link>
        <span>{variant === "login" ? "Вход в кабинет" : "AR живые фотографии"}</span>
        {auth.mode === "demo" ? (
          <details className="auth-demo-help">
            <summary>Демо-режим</summary>
            <p>Локальный demo-режим: используйте предзаполненный email и любой пароль от 8 символов.</p>
          </details>
        ) : null}
      </header>
      <div className="auth-page-content">
        <Panel className="auth-panel">
          <div className="auth-intro">
            {icon ? <span className="auth-intro-icon">{icon}</span> : null}
            <div>
              <h1>{title}</h1>
              <p className="auth-description">{description}</p>
            </div>
          </div>
          <div className="auth-form-content">{children}</div>
        </Panel>
      </div>
    </main>
  );
}

export function MfaVerificationRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const requested = new URLSearchParams(location.search).get("returnTo");
  const returnTo =
    requested &&
    /^\/(?:settings\/security|update-password|admin)\/?(?:[?#][^\\]*)?$/.test(requested) &&
    !Array.from(requested).some((character) => character.charCodeAt(0) < 32)
      ? requested
      : "/settings/security";
  return (
    <AuthLayout variant="mfa" title="Подтвердите вход" description="Второй фактор (MFA)">
      <MfaVerificationCard onBack={() => navigate(returnTo)} onVerified={() => navigate(returnTo, { replace: true })} />
    </AuthLayout>
  );
}

function PasswordRequirements({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="auth-password-requirements">
      <strong>Требования к паролю:</strong>
      <ul>
        <li>
          <Check size={14} />
          Не менее 8 символов
        </li>
        <li>
          <Check size={14} />
          {detailed ? "Хотя бы одна заглавная латинская буква" : "Заглавная и строчная латинские буквы"}
        </li>
        {detailed ? (
          <li>
            <Check size={14} />
            Хотя бы одна строчная латинская буква
          </li>
        ) : null}
        <li>
          <Check size={14} />
          Хотя бы одна цифра
        </li>
      </ul>
    </div>
  );
}

function AuthField({
  label,
  icon,
  error,
  inputProps,
  ...props
}: {
  label: string;
  icon: ReactNode;
  error?: FieldError;
  inputProps: UseFormRegisterReturn;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const [visible, setVisible] = useState(false);
  const password = props.type === "password";
  return (
    <label className="block text-sm font-semibold">
      <span>{label}</span>
      <span className="relative mt-2 block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        <input
          {...props}
          {...inputProps}
          type={password && visible ? "text" : props.type}
          className={`field-control auth-field-control ${password ? "auth-password-field" : ""}`}
          aria-label={label}
          aria-invalid={Boolean(error)}
        />
        {password ? (
          <button
            type="button"
            className="auth-password-toggle"
            aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </span>
      {error ? <span className="mt-1.5 block text-xs font-medium text-rose-700">{error.message}</span> : null}
    </label>
  );
}

function FormNotice({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <div
      className={`rounded-xl border p-3 text-sm leading-5 ${tone === "error" ? "border-rose-400/30 bg-rose-50 text-rose-800" : "border-emerald-400/30 bg-emerald-50 text-emerald-800"}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
