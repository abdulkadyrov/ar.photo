import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { Button, Input, Modal } from "../../shared/ui";
import type { AdminAccountDetail } from "./adminSchemas";
import { getAdminRepository } from "./adminRepository";

const repository = getAdminRepository();
export function AccountProfileEditor({
  detail,
  onCancel,
  onSaved,
}: {
  detail: AdminAccountDetail;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(detail.account.name);
  const [timezone, setTimezone] = useState(detail.account.timezone);
  const [discard, setDiscard] = useState(false);
  const dirty = name !== detail.account.name || timezone !== detail.account.timezone;
  const mutation = useMutation({
    mutationFn: () =>
      repository.updateAccount(
        detail.account.id,
        { name, timezone },
        `Редактирование профиля аккаунта «${detail.account.name}» администратором`,
      ),
    onSuccess: async () => {
      await onSaved();
      onCancel();
    },
  });
  const cancel = () => {
    if (mutation.isPending) return;
    if (dirty) setDiscard(true);
    else onCancel();
  };
  return (
    <div className="admin-page">
      <button type="button" className="admin-back" onClick={cancel}>
        <ArrowLeft size={16} />
        {detail.account.name}
      </button>
      <header className="admin-section-heading">
        <div>
          <h2>Редактирование аккаунта</h2>
          <p>Основные параметры организации. Владелец и права управляются отдельно.</p>
        </div>
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
        className="admin-editor-layout"
      >
        <section className="admin-surface">
          <h3 className="admin-subtitle">Основная информация</h3>
          <div className="admin-form-grid">
            <label>
              Название аккаунта *
              <Input
                autoFocus
                value={name}
                onValueChange={setName}
                maxLength={120}
                required
                disabled={mutation.isPending}
              />
            </label>
            <label>
              Часовой пояс *
              <Input
                value={timezone}
                onValueChange={setTimezone}
                placeholder="Europe/Moscow"
                maxLength={64}
                required
                disabled={mutation.isPending}
              />
              <small className="text-xs text-muted">
                Название IANA, например Europe/Moscow или Asia/Yekaterinburg.
              </small>
            </label>
            <label>
              Адрес аккаунта
              <Input value={detail.account.slug} onValueChange={() => {}} disabled />
            </label>
          </div>
        </section>
        <section className="admin-surface">
          <h3 className="admin-subtitle">Владелец и возможности</h3>
          <p className="text-sm text-muted">
            {detail.users.find((user) => user.role === "owner")?.emailDisplay ?? "Контакт владельца не указан"}
          </p>
          <p className="admin-note">
            Тариф меняет лимиты аккаунта. Роль администратора платформы выдаётся отдельно и не изменяется этой формой.
          </p>
          <p className="text-sm text-muted">
            Контакты, передача владения и разрешения участников не изменяются при сохранении.
          </p>
        </section>
        {mutation.error ? (
          <p role="alert" className="admin-danger">
            {mutation.error instanceof Error ? mutation.error.message : "Не удалось сохранить аккаунт"}
          </p>
        ) : null}
        <div className="admin-editor-footer">
          <Button type="button" variant="quiet" onClick={cancel} disabled={mutation.isPending}>
            Отмена
          </Button>
          <Button
            type="submit"
            icon={<Save size={16} />}
            disabled={mutation.isPending || !name.trim() || !timezone.trim() || !dirty}
          >
            {mutation.isPending ? "Сохраняем…" : "Сохранить изменения"}
          </Button>
        </div>
      </form>
      <DiscardModal open={discard} onClose={() => setDiscard(false)} onDiscard={onCancel} />
    </div>
  );
}
export function UserProfileEditor({
  accountId,
  user,
  onCancel,
  onSaved,
}: {
  accountId: string;
  user: AdminAccountDetail["users"][number];
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(user.fullName ?? "");
  const [discard, setDiscard] = useState(false);
  const mutation = useMutation({
    mutationFn: () =>
      repository.updateUser(
        accountId,
        user.id,
        { fullName: name },
        `Редактирование имени пользователя «${user.fullName ?? user.id}» администратором`,
      ),
    onSuccess: async () => {
      await onSaved();
      onCancel();
    },
  });
  const cancel = () => {
    if (mutation.isPending) return;
    if (name !== (user.fullName ?? "")) setDiscard(true);
    else onCancel();
  };
  return (
    <>
      <Modal
        open
        title="Редактирование пользователя"
        onClose={cancel}
        description="Имя профиля используется во всех аккаунтах этого пользователя. Email и права доступа сохраняются."
        actions={
          <Button
            disabled={mutation.isPending || !name.trim() || name === user.fullName}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Сохраняем…" : "Сохранить изменения"}
          </Button>
        }
      >
        <div className="admin-form-grid">
          <label>
            Имя пользователя *
            <Input
              autoFocus
              value={name}
              onValueChange={setName}
              required
              maxLength={120}
              disabled={mutation.isPending}
            />
          </label>
          <label>
            Email
            <Input value={user.emailDisplay ?? "Email скрыт"} onValueChange={() => {}} disabled />
          </label>
        </div>
        {mutation.error ? (
          <p role="alert" className="mt-3 text-sm text-rose-700">
            {mutation.error instanceof Error ? mutation.error.message : "Не удалось сохранить пользователя"}
          </p>
        ) : null}
      </Modal>
      <DiscardModal open={discard} onClose={() => setDiscard(false)} onDiscard={onCancel} />
    </>
  );
}
function DiscardModal({ open, onClose, onDiscard }: { open: boolean; onClose: () => void; onDiscard: () => void }) {
  return (
    <Modal
      open={open}
      title="Отменить изменения?"
      description="Введённые данные ещё не сохранены."
      onClose={onClose}
      actions={
        <Button type="button" variant="danger" onClick={onDiscard}>
          Не сохранять
        </Button>
      }
    />
  );
}
