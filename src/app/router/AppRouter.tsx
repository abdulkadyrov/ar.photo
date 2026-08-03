import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "../../features/auth/AuthProvider";
import { AppShell } from "../layout/AppShell";
import { Panel } from "../../shared/ui";
import { RouteErrorBoundary } from "../../shared/errors/RouteErrorBoundary";
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
const ProjectsRoute = lazy(() =>
  import("../../features/catalog/CatalogPages").then((module) => ({ default: module.ProjectsRoute })),
);
const ProjectDetailsRoute = lazy(() =>
  import("../../features/catalog/CatalogPages").then((module) => ({ default: module.ProjectDetailsRoute })),
);
const GroupsRoute = lazy(() =>
  import("../../features/catalog/CatalogPages").then((module) => ({ default: module.GroupsRoute })),
);
const MediaUploadRoute = lazy(() =>
  import("../../features/media/MediaUploadPage").then((module) => ({ default: module.MediaUploadRoute })),
);
const PrototypeViewerRoute = lazy(() =>
  import("../../features/prototype/PrototypeApp").then((module) => ({ default: module.PrototypeViewerRoute })),
);
const PrototypeTestViewerRoute = lazy(() =>
  import("../../features/prototype/PrototypeApp").then((module) => ({ default: module.PrototypeTestViewerRoute })),
);
const LoginRoute = lazy(() =>
  import("../../features/auth/AuthPages").then((module) => ({ default: module.LoginRoute })),
);
const ResetPasswordRoute = lazy(() =>
  import("../../features/auth/AuthPages").then((module) => ({ default: module.ResetPasswordRoute })),
);
const UpdatePasswordRoute = lazy(() =>
  import("../../features/auth/AuthPages").then((module) => ({ default: module.UpdatePasswordRoute })),
);

export function AppRouter() {
  return (
    <BrowserRouter basename={getRouterBasename(import.meta.env.BASE_URL)}>
      <RoutedContent />
    </BrowserRouter>
  );
}

function RoutedContent() {
  const location = useLocation();
  return (
    <RouteErrorBoundary resetKey={location.key}>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<PrototypeHomeRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/reset-password" element={<ResetPasswordRoute />} />
          <Route path="/update-password" element={<Protected element={<UpdatePasswordRoute />} />} />
          <Route path="/dashboard" element={<Protected element={<PrototypeDashboardRoute />} />} />
          <Route path="/projects" element={<Protected element={<ProjectsRoute />} />} />
          <Route path="/projects/:projectId" element={<Protected element={<ProjectDetailsRoute />} />} />
          <Route path="/groups" element={<Protected element={<GroupsRoute />} />} />
          <Route path="/media" element={<Protected element={<MediaUploadRoute />} />} />
          <Route path="/qr-codes" element={<Protected element={<FoundationPlaceholder title="QR-коды" />} />} />
          <Route path="/settings" element={<Protected element={<FoundationPlaceholder title="Настройки" />} />} />
          <Route path="/project/:projectId" element={<Protected element={<PrototypeProjectRoute />} />} />
          <Route path="/viewer/test" element={<PrototypeTestViewerRoute />} />
          <Route path="/viewer/:livePhotoId" element={<PrototypeViewerRoute />} />
          <Route path="*" element={<RouteNotFound />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}

function Protected({ element }: { element: ReactNode }) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
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
