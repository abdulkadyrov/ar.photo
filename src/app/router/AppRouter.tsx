import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "../layout/AppShell";
import { Panel } from "../../shared/ui";
import { getRouterBasename } from "./routerBase";

const PrototypeHomeRoute = lazy(() =>
  import("../../features/prototype/PrototypeApp").then((module) => ({ default: module.PrototypeHomeRoute })),
);
const PrototypeDashboardRoute = lazy(() =>
  import("../../features/prototype/PrototypeApp").then((module) => ({ default: module.PrototypeDashboardRoute })),
);
const PrototypeProjectRoute = lazy(() =>
  import("../../features/prototype/PrototypeApp").then((module) => ({ default: module.PrototypeProjectRoute })),
);
const PrototypeViewerRoute = lazy(() =>
  import("../../features/prototype/PrototypeApp").then((module) => ({ default: module.PrototypeViewerRoute })),
);
const PrototypeTestViewerRoute = lazy(() =>
  import("../../features/prototype/PrototypeApp").then((module) => ({ default: module.PrototypeTestViewerRoute })),
);

export function AppRouter() {
  return (
    <BrowserRouter basename={getRouterBasename(import.meta.env.BASE_URL)}>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<PrototypeHomeRoute />} />
          <Route path="/dashboard" element={<PrototypeDashboardRoute />} />
          <Route path="/projects" element={<PrototypeDashboardRoute />} />
          <Route path="/groups" element={<FoundationPlaceholder title="Группы" />} />
          <Route path="/qr-codes" element={<FoundationPlaceholder title="QR-коды" />} />
          <Route path="/settings" element={<FoundationPlaceholder title="Настройки" />} />
          <Route path="/project/:projectId" element={<PrototypeProjectRoute />} />
          <Route path="/viewer/test" element={<PrototypeTestViewerRoute />} />
          <Route path="/viewer/:livePhotoId" element={<PrototypeViewerRoute />} />
          <Route path="*" element={<RouteNotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function FoundationPlaceholder({ title }: { title: string }) {
  return (
    <AppShell
      eyebrow="Этап 1"
      title={title}
      description="Раздел подключён к новой навигации и будет наполнен рабочими сценариями на соответствующем продуктовом этапе."
    >
      <Panel className="mt-7">
        <p className="text-sm leading-6 text-muted">
          Каркас маршрута, адаптивная навигация и состояния интерфейса уже готовы. Здесь нет фиктивных действий —
          доступные операции появятся вместе с защищённым backend.
        </p>
      </Panel>
    </AppShell>
  );
}

function RouteLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-ink">
      <div className="rounded-card border border-line bg-card p-5 shadow-soft">
        <p className="font-semibold">Загружаем AR Photo…</p>
      </div>
    </main>
  );
}

function RouteNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-ink">
      <div className="max-w-md rounded-card border border-line bg-card p-5 text-center shadow-soft">
        <h1 className="text-2xl font-semibold">Страница не найдена</h1>
        <a className="mt-4 inline-flex font-semibold text-primary" href={`${import.meta.env.BASE_URL}`}>
          Вернуться на главную
        </a>
      </div>
    </main>
  );
}
