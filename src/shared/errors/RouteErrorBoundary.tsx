import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportOperationalError } from "../observability/errorReporter";
import { Button, ErrorState } from "../ui";

export class RouteErrorBoundary extends Component<
  { children: ReactNode; resetKey: string },
  { error: Error | null; reference: string | null }
> {
  state: { error: Error | null; reference: string | null } = { error: null, reference: null };

  static getDerivedStateFromError(error: Error) {
    return { error, reference: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const event = reportOperationalError("route_render_failed", "route", error, {
      componentBoundary: info.componentStack ? "available" : "unavailable",
    });
    this.setState({ reference: event.id });
    if (import.meta.env.DEV) console.error("Route render failed", event.id);
  }

  componentDidUpdate(previousProps: { resetKey: string }) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null, reference: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-ink">
        <ErrorState
          title="Раздел временно недоступен"
          text={`Интерфейс не удалось отобразить. Обновите страницу; если ошибка повторится, сообщите поддержке код ${this.state.reference ?? "pending"}.`}
          action={<Button onClick={() => window.location.reload()}>Обновить страницу</Button>}
        />
      </main>
    );
  }
}
