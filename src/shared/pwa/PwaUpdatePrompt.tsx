import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { activateServiceWorkerUpdate, registerServiceWorker } from "./serviceWorker";

export function PwaUpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => registerServiceWorker(setWaitingWorker), []);
  if (!waitingWorker) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed inset-x-4 bottom-24 z-[80] mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-primary/40 bg-surface-strong p-4 shadow-2xl sm:bottom-6"
    >
      <RefreshCw className="shrink-0 text-primary-soft" size={20} />
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-ink">Доступно обновление AR Photo</div>
        <div className="mt-0.5 text-sm text-muted">
          Примените его в безопасный момент. Открытая работа не прервётся.
        </div>
      </div>
      <button
        type="button"
        className="min-h-10 rounded-xl bg-primary px-3 text-sm font-semibold text-white"
        onClick={() => activateServiceWorkerUpdate(waitingWorker)}
      >
        Обновить
      </button>
      <button
        type="button"
        aria-label="Отложить обновление"
        className="grid size-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-white/[0.05] hover:text-ink"
        onClick={() => setWaitingWorker(null)}
      >
        <X size={18} />
      </button>
    </aside>
  );
}
