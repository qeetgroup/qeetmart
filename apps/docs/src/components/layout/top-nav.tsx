"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EnvironmentSwitcher } from "./environment-switcher";
import { SearchCommand } from "./search-command";
import { VersionSwitcher } from "./version-switcher";

type TopNavProps = {
  version: string;
};

export function TopNav({ version }: TopNavProps) {
  const searchParams = useSearchParams();
  const currentEnvironment = searchParams.get("env") ?? "local";

  return (
    <header className="top-nav">
      <div className="top-nav-brand">
        <Link href="/">qeetmart</Link>
        <span>Documentation</span>
      </div>
      <div className="top-nav-controls">
        <VersionSwitcher currentVersion={version} />
        <EnvironmentSwitcher currentEnvironment={currentEnvironment} />
        <SearchCommand version={version} />
      </div>
    </header>
  );
}
