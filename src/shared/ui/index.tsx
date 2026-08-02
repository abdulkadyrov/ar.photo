import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

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
    <section className={`surface-card rounded-card border border-line p-4 shadow-soft ${className}`}>
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
