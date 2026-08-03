import {
  useEffect,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

export function Button({
  children,
  icon,
  variant = "primary",
  full = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: "primary" | "ghost" | "quiet" | "danger";
  full?: boolean;
}) {
  return (
    <button {...props} className={`btn btn-${variant} ${full ? "w-full" : ""} ${props.className ?? ""}`}>
      {icon}
      {children}
    </button>
  );
}

export function FileButton({
  children,
  accept,
  icon,
  onPick,
}: {
  children: ReactNode;
  accept: string;
  icon: ReactNode;
  onPick: (file?: File) => void;
}) {
  return (
    <label className="btn btn-ghost cursor-pointer">
      {icon}
      {children}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onPick(event.currentTarget.files?.[0])}
      />
    </label>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`surface-card min-w-0 rounded-card border border-line p-4 shadow-soft ${className}`}>
      {children}
    </section>
  );
}

export function Input({
  value,
  onValueChange,
  className = "",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <input
      {...props}
      className={`field-control ${className}`}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    />
  );
}

export function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`status-badge ${ok ? "status-badge-success" : "status-badge-muted"}`}>
      {label}: {ok ? "✓" : "○"}
    </span>
  );
}

export function StatusPanel({ title, text }: { title: string; text: string }) {
  return (
    <Panel>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-muted">{text}</p>
    </Panel>
  );
}

export function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Panel className="min-h-[132px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <strong className="mt-3 block text-3xl font-semibold tracking-tight text-ink">{value}</strong>
          {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
        </div>
        <span className="metric-icon">{icon}</span>
      </div>
    </Panel>
  );
}

export function Select({
  label,
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ label: string; value: string }>;
}) {
  const id = useId();
  return (
    <label className="block text-sm font-semibold" htmlFor={id}>
      <span>{label}</span>
      <select {...props} className={`field-control mt-2 ${props.className ?? ""}`} id={id}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Modal({
  open,
  title,
  description,
  children,
  actions,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid overflow-y-auto bg-black/70 p-5 backdrop-blur-sm" onMouseDown={onClose}>
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="surface-card my-auto max-h-[calc(100dvh-2.5rem)] w-full max-w-lg overflow-y-auto rounded-card border border-line p-5 shadow-soft"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        tabIndex={-1}
      >
        <h2 className="text-2xl font-semibold" id={titleId}>
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted" id={descriptionId}>
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-5">{children}</div> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="quiet" onClick={onClose}>
            Отмена
          </Button>
          {actions}
        </div>
      </section>
    </div>
  );
}

export function Toast({
  title,
  message,
  tone = "info",
  onDismiss,
}: {
  title: string;
  message?: string;
  tone?: "info" | "success" | "error";
  onDismiss?: () => void;
}) {
  return (
    <div className={`toast toast-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {message ? <p className="mt-1 text-sm text-muted">{message}</p> : null}
      </div>
      {onDismiss ? (
        <button aria-label="Закрыть уведомление" className="text-lg leading-none text-muted" onClick={onDismiss}>
          ×
        </button>
      ) : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`skeleton block ${className}`} />;
}

export function ErrorState({
  title = "Что-то пошло не так",
  text,
  action,
}: {
  title?: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <Panel className="mx-auto max-w-lg text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-400/10 text-xl text-rose-300">
        !
      </span>
      <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Panel>
  );
}

export function FileDropzone({
  accept,
  disabled = false,
  hint,
  onPick,
}: {
  accept: string;
  disabled?: boolean;
  hint?: string;
  onPick: (files: File[]) => void;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);

  const pick = (files: FileList | null) => {
    if (disabled || !files?.length) return;
    onPick(Array.from(files));
  };

  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files);
  };

  return (
    <label
      className={`file-dropzone ${dragging ? "file-dropzone-active" : ""} ${disabled ? "pointer-events-none opacity-50" : ""}`}
      htmlFor={id}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={drop}
    >
      <span className="text-sm font-semibold">Перетащите файлы сюда или выберите на устройстве</span>
      {hint ? <span className="mt-2 text-xs leading-5 text-muted">{hint}</span> : null}
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        multiple
        onChange={(event) => pick(event.currentTarget.files)}
      />
    </label>
  );
}
