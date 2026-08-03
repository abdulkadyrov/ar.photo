import { AppProviders } from "./providers/AppProviders";
import { AppRouter } from "./router/AppRouter";
import { PwaUpdatePrompt } from "../shared/pwa/PwaUpdatePrompt";

export function App() {
  return (
    <AppProviders>
      <AppRouter />
      <PwaUpdatePrompt />
    </AppProviders>
  );
}
