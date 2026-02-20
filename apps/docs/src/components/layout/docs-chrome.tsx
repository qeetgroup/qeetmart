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
      <div className="mx-auto grid w-full max-w-[1600px] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="border-b border-border/80 bg-sidebar/70 px-3 py-4 lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-4 lg:py-6">
          <SidebarNav sections={sections} />
        </aside>
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
