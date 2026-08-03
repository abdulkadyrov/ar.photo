import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "../../features/auth/AuthProvider";
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
const ArItemsRoute = lazy(() =>
  import("../../features/ar-items/ArItemPages").then((module) => ({ default: module.ArItemsRoute })),
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
const PrototypeTestViewerRoute = lazy(() =>
  import("../../features/prototype/PrototypeApp").then((module) => ({ default: module.PrototypeTestViewerRoute })),
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
const LoginRoute = lazy(() =>
  import("../../features/auth/AuthPages").then((module) => ({ default: module.LoginRoute })),
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
const AnalyticsRoute = lazy(() =>
  import("../../features/analytics/AnalyticsPage").then((module) => ({ default: module.AnalyticsRoute })),
);
const AdminRoute = lazy(() =>
  import("../../features/admin/AdminPage").then((module) => ({ default: module.AdminRoute })),
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
          <Route path="/items" element={<Protected element={<ArItemsRoute />} />} />
          <Route path="/items/new" element={<Protected element={<NewArItemRoute />} />} />
          <Route path="/items/:itemId/edit" element={<Protected element={<EditArItemRoute />} />} />
          <Route path="/items/:itemId/qr" element={<Protected element={<QrPublicationRoute />} />} />
          <Route path="/qr-codes" element={<Protected element={<QrCodesRoute />} />} />
          <Route path="/analytics" element={<Protected element={<AnalyticsRoute />} />} />
          <Route path="/admin" element={<Protected element={<AdminRoute />} />} />
          <Route path="/settings" element={<Protected element={<SettingsRoute />} />} />
          <Route path="/settings/subscription" element={<Protected element={<SubscriptionRoute />} />} />
          <Route path="/settings/team" element={<Protected element={<TeamRoute />} />} />
          <Route path="/project/:projectId" element={<Protected element={<PrototypeProjectRoute />} />} />
          <Route path="/viewer/test" element={<PrototypeTestViewerRoute />} />
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
