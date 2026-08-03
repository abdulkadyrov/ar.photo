export function getSignUpErrorMessage(error: unknown) {
  const code = getErrorCode(error);

  if (code === "weak_password") {
    return "Пароль не соответствует требованиям: минимум 10 символов, строчная и заглавная латинские буквы и цифра.";
  }
  if (code === "user_already_exists" || code === "email_exists") {
    return "Аккаунт с этим email уже существует. Перейдите ко входу или восстановите пароль.";
  }
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit") {
    return "Слишком много попыток регистрации. Подождите несколько минут и повторите.";
  }
  if (code === "signup_disabled") {
    return "Регистрация временно отключена. Попробуйте позже.";
  }

  return "Не удалось создать аккаунт. Проверьте данные и повторите попытку.";
}

function getErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return "";
  return typeof error.code === "string" ? error.code : "";
}
