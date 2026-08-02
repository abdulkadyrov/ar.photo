import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, ErrorState } from "../ui";

export class RouteErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error("Route render failed", error, info.componentStack);
  }

  componentDidUpdate(previousProps: { resetKey: string }) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-ink">
        <ErrorState
          title="Раздел временно недоступен"
          text="Интерфейс не удалось отобразить. Обновите страницу; если ошибка повторится, вернитесь на главную."
          action={<Button onClick={() => window.location.reload()}>Обновить страницу</Button>}
        />
      </main>
    );
  }
}
