import { Suspense, type ReactNode } from "react";
import { getDocsNavigation, type DocVersion } from "@/lib/docs/config";
import { SidebarNav } from "./sidebar-nav";
import { TopNav } from "./top-nav";

type DocsChromeProps = {
  version: DocVersion;
  children: ReactNode;
};

export function DocsChrome({ version, children }: DocsChromeProps) {
  const sections = getDocsNavigation(version);

  return (
    <div className="min-h-dvh bg-background">
      <Suspense
        fallback={
          <header className="sticky top-0 z-40 border-b border-border/90 bg-card/95 backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="h-4 w-44 rounded bg-muted" />
              <div className="h-8 w-48 rounded bg-muted" />
            </div>
          </header>
        }
      >
        <TopNav version={version} />
      </Suspense>
      <div className="mx-auto grid w-full max-w-[1600px] lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-border/80 bg-sidebar/70 lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:px-4 lg:py-6">
          <SidebarNav idPrefix="desktop-sidebar-section" sections={sections} />
        </aside>
        <main className="px-3 py-5 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
          <details className="mb-4 rounded-lg border border-border bg-card lg:hidden">
            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-foreground">
              Browse documentation
            </summary>
            <div className="border-t border-border px-3 py-3">
              <SidebarNav idPrefix="mobile-sidebar-section" sections={sections} />
            </div>
          </details>
          {children}
        </main>
      </div>
    </div>
  );
}
