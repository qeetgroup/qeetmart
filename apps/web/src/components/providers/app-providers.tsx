"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { getQueryClient } from "@/lib/query-client";
import { AnalyticsDebugPanel } from "@/components/analytics/analytics-debug-panel";
import { RouteAnalyticsTracker } from "@/components/analytics/route-analytics-tracker";
import { ExitIntentModal } from "@/components/modals/exit-intent-modal";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <RouteAnalyticsTracker />
        <ServiceWorkerRegister />
        <InstallPrompt />
        <ExitIntentModal />
        <AnalyticsDebugPanel />
        <Toaster richColors closeButton />
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
