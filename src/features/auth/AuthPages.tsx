import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, LoaderCircle, LockKeyhole, Mail, Eye, EyeOff, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm, type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { Button, Panel } from "../../shared/ui";
import { useAuth } from "./authContext";
import { getSignUpErrorMessage } from "./authErrors";
import "./AuthPages.css";
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
      {auth.mode === "demo" ? (
        <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm leading-5 text-[#5140b8]">
          Локальный demo-режим: используйте предзаполненный email и любой пароль от 8 символов.
        </div>
      ) : null}
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
          icon={isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : <KeyRound size={18} />}
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
    <AuthLayout title="Создать аккаунт" description="Регистрация по email и паролю, без номера телефона.">
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
          <p className="-mt-2 text-xs leading-5 text-muted">
            Минимум 8 символов: строчная и заглавная латинские буквы и хотя бы одна цифра.
          </p>
          <AuthField
            label="Повторите пароль"
            icon={<LockKeyhole size={17} />}
            error={errors.confirmPassword}
            inputProps={register("confirmPassword")}
            type="password"
            autoComplete="new-password"
            placeholder="Повторите пароль"
          />
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-muted">
            <input className="mt-1 h-4 w-4 accent-primary" type="checkbox" {...register("termsAccepted")} />
            <span>Я подтверждаю право использовать загружаемые фотографии и видео.</span>
          </label>
          {errors.termsAccepted ? (
            <p className="text-xs font-medium text-rose-700">{errors.termsAccepted.message}</p>
          ) : null}
          {formError ? <FormNotice tone="error">{formError}</FormNotice> : null}
          <Button
            full
            disabled={isSubmitting}
            icon={isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : <UserRound size={18} />}
          >
            {isSubmitting ? "Создаём…" : "Зарегистрироваться"}
          </Button>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted" to="/login">
            <ArrowLeft size={16} /> Уже есть аккаунт
          </Link>
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
      title="Восстановление доступа"
      description={
        emailEnabled
          ? "Отправим безопасную ссылку на подтверждённый email."
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
            icon={isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : <Mail size={18} />}
          >
            {isSubmitting ? "Отправляем…" : "Получить ссылку"}
          </Button>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted" to="/login">
            <ArrowLeft size={16} /> Вернуться ко входу
          </Link>
        </form>
      )}
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
    <AuthLayout title="Новый пароль" description="Придумайте новый пароль для аккаунта AR Photo.">
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
        <p className="-mt-2 text-xs leading-5 text-muted">
          Минимум 8 символов: строчная и заглавная латинские буквы и хотя бы одна цифра.
        </p>
        <AuthField
          label="Повторите пароль"
          icon={<LockKeyhole size={17} />}
          error={errors.confirmPassword}
          inputProps={register("confirmPassword")}
          type="password"
          autoComplete="new-password"
          placeholder="Повторите новый пароль"
        />
        {formError ? <FormNotice tone="error">{formError}</FormNotice> : null}
        <Button
          full
          disabled={isSubmitting || (recovery && !recoveryToken && !recoveryVerified)}
          icon={isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : <KeyRound size={18} />}
        >
          {isSubmitting ? "Сохраняем…" : "Сохранить пароль"}
        </Button>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const auth = useAuth();
  return (
    <main className="auth-page">
      <header className="auth-page-header">
        <Link className="auth-wordmark" to="/">
          KHANZAMA
        </Link>
        <span>Кабинет студии</span>
        {auth.mode === "demo" ? <small>Демо-режим</small> : null}
      </header>
      <div className="auth-page-content">
        <Panel className="auth-panel">
          <h1>{title}</h1>
          <p className="auth-description">{description}</p>
          <div className="auth-form-content">{children}</div>
        </Panel>
        <p className="auth-legal">Продолжая, вы подтверждаете, что имеете право работать с загружаемыми материалами.</p>
      </div>
    </main>
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
