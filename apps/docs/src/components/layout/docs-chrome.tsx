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
    <div className="docs-shell">
      <Suspense
        fallback={
          <header className="top-nav">
            <div className="top-nav-brand">
              <span>qeetmart</span>
              <span>Documentation</span>
            </div>
          </header>
        }
      >
        <TopNav version={version} />
      </Suspense>
      <div className="docs-body">
        <aside className="docs-sidebar">
          <SidebarNav sections={sections} />
        </aside>
        <main className="docs-main">{children}</main>
      </div>
    </div>
  );
}
