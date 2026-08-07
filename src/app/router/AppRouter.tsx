import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "../../features/auth/AuthProvider";
import { useAuth } from "../../features/auth/authContext";
import { RouteErrorBoundary } from "../../shared/errors/RouteErrorBoundary";
import { getPublicRuntimeConfig } from "../../shared/config/env";
import { getRouterBasename } from "./routerBase";

const QuickStartRoute = lazy(() =>
  import("../../features/quick-start/QuickStartPage").then((module) => ({ default: module.QuickStartRoute })),
);
const DashboardRoute = lazy(() =>
  import("../../features/dashboard/DashboardPage").then((module) => ({ default: module.DashboardRoute })),
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
const ArItemsRoute = lazy(() =>
  import("../../features/ar-items/ArItemPages").then((module) => ({ default: module.ArItemsRoute })),
);
const ArItemDetailRoute = lazy(() =>
  import("../../features/ar-items/ArItemPages").then((module) => ({ default: module.ArItemDetailRoute })),
);
const NewArItemRoute = lazy(() =>
  import("../../features/ar-items/ArItemPages").then((module) => ({ default: module.NewArItemRoute })),
);
const EditArItemRoute = lazy(() =>
  import("../../features/ar-items/ArItemPages").then((module) => ({ default: module.EditArItemRoute })),
);
const QrCodesRoute = lazy(() =>
  import("../../features/qr/QrPublicationPage").then((module) => ({ default: module.QrCodesRoute })),
);
const QrPublicationRoute = lazy(() =>
  import("../../features/qr/QrPublicationPage").then((module) => ({ default: module.QrPublicationRoute })),
);
const PrototypeViewerRoute = lazy(() =>
  import("../../features/prototype/PrototypeApp").then((module) => ({ default: module.PrototypeViewerRoute })),
);
const PublicArViewerRoute = lazy(() =>
  import("../../features/public-ar/PublicArViewerPage").then((module) => ({ default: module.PublicArViewerRoute })),
);
const PublicArPrivacyRoute = lazy(() =>
  import("../../features/public-ar/PublicArViewerPage").then((module) => ({ default: module.PublicArPrivacyRoute })),
);
const PublicArUnsupportedRoute = lazy(() =>
  import("../../features/public-ar/PublicArViewerPage").then((module) => ({
    default: module.PublicArUnsupportedRoute,
  })),
);
const ArCameraEntryRoute = lazy(() =>
  import("../../features/public-ar/ArCameraEntryPage").then((module) => ({ default: module.ArCameraEntryRoute })),
);
const LoginRoute = lazy(() =>
  import("../../features/auth/AuthPages").then((module) => ({ default: module.LoginRoute })),
);
const RegisterRoute = lazy(() =>
  import("../../features/auth/AuthPages").then((module) => ({ default: module.RegisterRoute })),
);
const ResetPasswordRoute = lazy(() =>
  import("../../features/auth/AuthPages").then((module) => ({ default: module.ResetPasswordRoute })),
);
const UpdatePasswordRoute = lazy(() =>
  import("../../features/auth/AuthPages").then((module) => ({ default: module.UpdatePasswordRoute })),
);
const SettingsRoute = lazy(() =>
  import("../../features/settings/SettingsPages").then((module) => ({ default: module.SettingsRoute })),
);
const SubscriptionRoute = lazy(() =>
  import("../../features/settings/SettingsPages").then((module) => ({ default: module.SubscriptionRoute })),
);
const TeamRoute = lazy(() =>
  import("../../features/settings/SettingsPages").then((module) => ({ default: module.TeamRoute })),
);
const SecurityRoute = lazy(() =>
  import("../../features/settings/MfaSettingsPage").then((module) => ({ default: module.SecurityRoute })),
);
const AnalyticsRoute = lazy(() =>
  import("../../features/analytics/AnalyticsPage").then((module) => ({ default: module.AnalyticsRoute })),
);
const AdminRoute = lazy(() =>
  import("../../features/admin/AdminPage").then((module) => ({ default: module.AdminRoute })),
);
const SupportRoute = lazy(() =>
  import("../../features/support/SupportPage").then((module) => ({ default: module.SupportRoute })),
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
  const runtime = getPublicRuntimeConfig();
  const configurationIndependent = location.pathname === "/privacy" || location.pathname === "/unsupported";
  if (runtime.authMode === "unconfigured" && !configurationIndependent) return <RuntimeConfigurationUnavailable />;
  return (
    <RouteErrorBoundary resetKey={location.key}>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<RegisterRoute />} />
          <Route path="/reset-password" element={<ResetPasswordRoute />} />
          <Route path="/update-password" element={<Protected element={<UpdatePasswordRoute />} />} />
          <Route path="/dashboard" element={<Protected element={<DashboardRoute />} />} />
          <Route path="/create" element={<Protected element={<QuickStartRoute />} />} />
          <Route path="/projects" element={<Protected element={<ProjectsRoute />} />} />
          <Route path="/projects/:projectId" element={<Protected element={<ProjectDetailsRoute />} />} />
          <Route path="/groups" element={<Protected element={<GroupsRoute />} />} />
          <Route path="/media" element={<Protected element={<MediaUploadRoute />} />} />
          <Route path="/items" element={<Protected element={<ArItemsRoute />} />} />
          <Route path="/items/new" element={<Protected element={<NewArItemRoute />} />} />
          <Route path="/items/:itemId" element={<Protected element={<ArItemDetailRoute />} />} />
          <Route path="/items/:itemId/edit" element={<Protected element={<EditArItemRoute />} />} />
          <Route path="/items/:itemId/qr" element={<Protected element={<QrPublicationRoute />} />} />
          <Route path="/qr-codes" element={<Protected element={<QrCodesRoute />} />} />
          <Route path="/analytics" element={<Protected element={<AnalyticsRoute />} />} />
          <Route path="/admin" element={<Protected element={<AdminRoute />} />} />
          <Route path="/support" element={<Protected element={<SupportRoute />} />} />
          <Route path="/camera" element={<Protected element={<ArCameraEntryRoute />} />} />
          <Route path="/settings" element={<Protected element={<SettingsRoute />} />} />
          <Route path="/settings/subscription" element={<Protected element={<SubscriptionRoute />} />} />
          <Route path="/settings/team" element={<Protected element={<TeamRoute />} />} />
          <Route path="/settings/security" element={<Protected element={<SecurityRoute />} />} />
          <Route path="/project/:projectId" element={<Protected element={<PrototypeProjectRoute />} />} />
          <Route path="/viewer/test" element={<Navigate replace to="/camera" />} />
          <Route path="/viewer/:livePhotoId" element={<PrototypeViewerRoute />} />
          <Route path="/ar/:publicSlug" element={<PublicArViewerRoute />} />
          <Route path="/privacy" element={<PublicArPrivacyRoute />} />
          <Route path="/unsupported" element={<PublicArUnsupportedRoute />} />
          <Route path="*" element={<RouteNotFound />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}

function RootRoute() {
  const auth = useAuth();
  if (auth.status === "loading") return <RouteLoading />;
  return <Navigate replace to={auth.session ? "/dashboard" : "/login"} />;
}

function RuntimeConfigurationUnavailable() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-ink">
      <div className="max-w-md rounded-card border border-line bg-card p-6 text-center shadow-soft">
        <h1 className="text-2xl font-semibold">Конфигурация сервиса недоступна</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          AR Photo временно не может подключиться к backend. Повторите попытку позже или сообщите службе поддержки.
        </p>
      </div>
    </main>
  );
}

function Protected({ element }: { element: ReactNode }) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
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
