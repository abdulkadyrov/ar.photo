import { CheckCircle2, ChevronDown, Clipboard, Headphones, Mail, Search, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "../../app/layout/AppShell";
import { Button, Input, Panel, Toast } from "../../shared/ui";
import { useAuth } from "../auth/authContext";

const faq = [
  [
    "Как создать AR-фото?",
    "Откройте «Создать», укажите название, добавьте фотографию и видео, затем нажмите «Оживить фото». QR-код появится после четырёх этапов обработки.",
  ],
  [
    "Какие форматы поддерживаются?",
    "Для фотографий подходят JPG, PNG и WebP. Для видео — MP4, MOV и WebM. Сервис автоматически подготавливает совместимую версию для мобильных браузеров.",
  ],
  [
    "Почему видео не появляется на фотографии?",
    "Фотография должна целиком попадать в кадр, быть достаточно освещённой и без сильных бликов. Для первого открытия публичного проекта сначала отсканируйте его QR-код внутри AR Photo.",
  ],
  [
    "Почему нет звука?",
    "На iPhone звук разрешается только после действия пользователя. Нажмите кнопку запуска AR или коснитесь видео один раз; громкость телефона также должна быть включена.",
  ],
  [
    "Нужно ли каждый раз сканировать QR-код?",
    "Нет. После первого pairing проект сохраняется в локальном хранилище браузера. Повторная загрузка нужна только после обновления проекта или очистки данных сайта.",
  ],
  [
    "Как работает подписка?",
    "Срок и доступные лимиты показаны в разделе «Настройки → Тариф». Публичные QR продолжают работать согласно условиям вашего тарифа.",
  ],
] as const;

export function SupportRoute() {
  const auth = useAuth();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [mailto, setMailto] = useState("");
  const [notice, setNotice] = useState<"diagnostic" | "message" | null>(null);
  const visibleFaq = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ru");
    return needle ? faq.filter((item) => item.join(" ").toLocaleLowerCase("ru").includes(needle)) : faq;
  }, [query]);

  const copyDiagnostics = async () => {
    const diagnostic = [
      "AR Photo diagnostics",
      `Path: ${window.location.pathname}`,
      `Online: ${navigator.onLine ? "yes" : "no"}`,
      `Language: ${navigator.language}`,
      `Browser: ${navigator.userAgent}`,
      `Time: ${new Date().toISOString()}`,
    ].join("\n");
    await navigator.clipboard.writeText(diagnostic);
    setNotice("diagnostic");
  };

  const prepareMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const body = `${message.trim()}\n\nАккаунт: ${auth.session?.user.email ?? "не указан"}`;
    setMailto(`mailto:support@ar.photo?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`);
    setNotice("message");
  };

  return (
    <AppShell
      eyebrow="Мы рядом"
      title="Поддержка"
      description="Быстрые ответы по созданию, QR-кодам и AR-камере. Если ответа нет — подготовьте сообщение для команды."
      actions={
        <Button variant="quiet" icon={<Clipboard size={17} />} onClick={() => void copyDiagnostics()}>
          Скопировать диагностику
        </Button>
      }
    >
      <div className="support-grid">
        <section aria-labelledby="support-faq-title">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">База знаний</p>
              <h2 id="support-faq-title">Частые вопросы</h2>
            </div>
          </div>
          <label className="support-search">
            <Search size={18} />
            <Input
              aria-label="Поиск по вопросам"
              placeholder="Поиск по вопросам"
              value={query}
              onValueChange={setQuery}
            />
          </label>
          <div className="support-faq-list">
            {visibleFaq.map(([title, answer]) => (
              <details key={title} className="support-faq-item">
                <summary>
                  <span>{title}</span>
                  <ChevronDown size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
            {!visibleFaq.length ? (
              <Panel>
                <p className="text-sm text-muted">По вашему запросу ничего не найдено.</p>
              </Panel>
            ) : null}
          </div>
        </section>

        <Panel className="support-contact-card">
          <span className="support-contact-icon">
            <Headphones size={24} />
          </span>
          <p className="section-kicker">Связаться с нами</p>
          <h2>Написать в поддержку</h2>
          <p className="support-contact-intro">
            Опишите, на каком шаге возникла проблема. Не отправляйте пароль, токены или приватные ссылки.
          </p>
          <form onSubmit={prepareMessage} className="support-form">
            <label>
              <span>Ваш email</span>
              <input className="field-control" value={auth.session?.user.email ?? ""} readOnly />
            </label>
            <label>
              <span>Тема</span>
              <input
                className="field-control"
                required
                minLength={3}
                maxLength={120}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Например, не открывается камера"
              />
            </label>
            <label>
              <span>Сообщение</span>
              <textarea
                className="field-control"
                required
                minLength={10}
                maxLength={3000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Опишите проблему и модель телефона"
              />
            </label>
            <Button full icon={<Send size={17} />}>
              Подготовить письмо
            </Button>
          </form>
          {mailto ? (
            <a className="btn btn-ghost mt-3 w-full" href={mailto}>
              <Mail size={17} /> Открыть почтовое приложение
            </a>
          ) : null}
          <div className="support-privacy">
            <CheckCircle2 size={16} />
            <span>Диагностика не содержит пароли, токены и загруженные файлы.</span>
          </div>
        </Panel>
      </div>
      {notice ? (
        <div className="fixed bottom-24 right-5 z-50 lg:bottom-6">
          <Toast
            tone="success"
            title={notice === "diagnostic" ? "Диагностика скопирована" : "Письмо подготовлено"}
            message={notice === "message" ? "Откройте почтовое приложение и отправьте сообщение." : undefined}
            onDismiss={() => setNotice(null)}
          />
        </div>
      ) : null}
    </AppShell>
  );
}
