import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, LoaderCircle, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm, type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Panel } from "../../shared/ui";
import { useAuth } from "./authContext";
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

  if (auth.status === "authenticated") return <Navigate replace to="/dashboard" />;

  const submit = handleSubmit(async (values) => {
    setFormError("");
    try {
      await auth.signIn(values.email, values.password);
      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? "/dashboard", { replace: true });
    } catch {
      setFormError("Не удалось войти. Проверьте email и пароль и повторите попытку.");
    }
  });

  return (
    <AuthLayout title="Добро пожаловать" description="Войдите в защищённое пространство AR Photo.">
      {auth.mode === "demo" ? (
        <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm leading-5 text-[#b8afff]">
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
        {formError ? <FormNotice tone="error">{formError}</FormNotice> : null}
        <Button
          full
          disabled={isSubmitting}
          icon={isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : <KeyRound size={18} />}
        >
          {isSubmitting ? "Входим…" : "Войти"}
        </Button>
      </form>
      <Link className="mt-5 inline-flex text-sm font-semibold text-primary" to="/reset-password">
        Забыли пароль?
      </Link>
      <p className="mt-4 text-sm text-muted">
        Нет аккаунта?{" "}
        <Link className="font-semibold text-primary" to="/register">
          Зарегистрироваться
        </Link>
      </p>
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
    } catch {
      setFormError("Не удалось создать аккаунт. Проверьте данные или попробуйте войти с этим email.");
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
            placeholder="Не менее 10 символов"
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
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-muted">
            <input className="mt-1 h-4 w-4 accent-primary" type="checkbox" {...register("termsAccepted")} />
            <span>Я подтверждаю право использовать загружаемые фотографии и видео.</span>
          </label>
          {errors.termsAccepted ? (
            <p className="text-xs font-medium text-rose-300">{errors.termsAccepted.message}</p>
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
    <AuthLayout title="Восстановление доступа" description="Отправим безопасную ссылку на подтверждённый email.">
      {sent ? (
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

export function UpdatePasswordRoute() {
  const auth = useAuth();
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
      await auth.updatePassword(password);
      navigate("/dashboard", { replace: true });
    } catch {
      setFormError("Ссылка устарела или пароль не удалось обновить. Запросите новое письмо.");
    }
  });

  return (
    <AuthLayout title="Новый пароль" description="Придумайте новый пароль для аккаунта AR Photo.">
      <form className="space-y-4" onSubmit={submit} noValidate>
        <AuthField
          label="Новый пароль"
          icon={<LockKeyhole size={17} />}
          error={errors.password}
          inputProps={register("password")}
          type="password"
          autoComplete="new-password"
          placeholder="Не менее 10 символов"
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
        {formError ? <FormNotice tone="error">{formError}</FormNotice> : null}
        <Button
          full
          disabled={isSubmitting}
          icon={isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : <KeyRound size={18} />}
        >
          {isSubmitting ? "Сохраняем…" : "Сохранить пароль"}
        </Button>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5 py-10 text-ink">
      <div className="pointer-events-none absolute left-1/2 top-[-20rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]" />
      <div className="relative w-full max-w-md">
        <Link className="brand-mark mb-7 justify-center" to="/">
          <span className="brand-symbol">
            <Sparkles size={20} />
          </span>
          <span>
            <strong>AR</strong> Photo
          </span>
        </Link>
        <Panel className="p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Личный кабинет</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          <div className="mt-6">{children}</div>
        </Panel>
        <p className="mt-5 text-center text-xs leading-5 text-muted">
          Продолжая, вы подтверждаете, что имеете право работать с загружаемыми материалами.
        </p>
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
  return (
    <label className="block text-sm font-semibold">
      <span>{label}</span>
      <span className="relative mt-2 block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        <input {...props} {...inputProps} className="field-control auth-field-control" aria-invalid={Boolean(error)} />
      </span>
      {error ? <span className="mt-1.5 block text-xs font-medium text-rose-300">{error.message}</span> : null}
    </label>
  );
}

function FormNotice({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <div
      className={`rounded-xl border p-3 text-sm leading-5 ${tone === "error" ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
