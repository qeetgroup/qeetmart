"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { EnvironmentSwitcher } from "./environment-switcher";
import { SearchCommand } from "./search-command";
import { ThemeToggle } from "./theme-toggle";
import { VersionSwitcher } from "./version-switcher";

type TopNavProps = {
  version: string;
  isNavOpen: boolean;
  onToggleNav: () => void;
};

export function TopNav({ version, isNavOpen, onToggleNav }: TopNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentEnvironment = searchParams.get("env") ?? "local";
  const showApiEnvironment = pathname.startsWith("/reference/");

  return (
    <header className="top-nav">
      <div className="top-nav-brand">
        <button
          aria-expanded={isNavOpen}
          aria-label="Toggle documentation navigation"
          className="mobile-nav-toggle"
          onClick={onToggleNav}
          type="button"
        >
          Menu
        </button>
        <Link href="/">qeetmart</Link>
        <span>Documentation</span>
      </div>
      <div className="top-nav-controls">
        <VersionSwitcher currentVersion={version} />
        {showApiEnvironment ? <EnvironmentSwitcher currentEnvironment={currentEnvironment} /> : null}
        <ThemeToggle />
        <SearchCommand version={version} />
      </div>
    </header>
  );
}
