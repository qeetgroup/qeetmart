"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { NavSection } from "@/lib/docs/config";
import { SidebarNav } from "./sidebar-nav";
import { TopNav } from "./top-nav";

type TrustSignal = {
  label: string;
  value: string;
};

type DocsChromeClientProps = {
  version: string;
  sections: NavSection[];
  trustSignals: TrustSignal[];
  children: ReactNode;
};

export function DocsChromeClient({ version, sections, trustSignals, children }: DocsChromeClientProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [mobileNavOpen]);

  return (
    <div className="docs-shell" data-nav-open={mobileNavOpen ? "true" : "false"}>
      <div className="trust-bar" role="status">
        {trustSignals.map((signal) => (
          <span className="trust-pill" key={signal.label}>
            <strong>{signal.label}:</strong> {signal.value}
          </span>
        ))}
      </div>
      <TopNav
        isNavOpen={mobileNavOpen}
        onToggleNav={() => setMobileNavOpen((state) => !state)}
        version={version}
      />
      <div className="docs-body">
        <div aria-hidden="true" className="docs-mobile-backdrop" onClick={() => setMobileNavOpen(false)} />
        <aside className="docs-sidebar">
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} sections={sections} />
        </aside>
        <main className="docs-main">{children}</main>
      </div>
    </div>
  );
}
