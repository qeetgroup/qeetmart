"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MOTION, getReducedTransition } from "@/lib/motion";
import { EnvironmentSwitcher } from "./environment-switcher";
import { SearchCommand } from "./search-command";
import { ThemeSwitcher } from "./theme-switcher";
import { VersionSwitcher } from "./version-switcher";

type TopNavProps = {
  version: string;
};

export function TopNav({ version }: TopNavProps) {
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const currentEnvironment = searchParams.get("env") ?? "local";
  const transition = getReducedTransition(reduceMotion, {
    duration: MOTION.duration.component,
    ease: MOTION.ease.out,
  });

  return (
    <motion.header
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 border-b border-border/90 bg-card/95 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-md"
      initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
      transition={transition}
    >
      <div className="mx-auto w-full max-w-400 px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-col gap-2 py-2 md:flex-row md:flex-wrap md:items-center md:justify-between lg:flex-nowrap lg:gap-4 lg:py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              className="truncate text-base font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary"
              href="/"
            >
              Qeetmart
            </Link>
            <Badge className="hidden md:inline-flex" variant="muted">
              Enterprise Docs
            </Badge>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:items-center lg:justify-end">
            <VersionSwitcher currentVersion={version} />
            <EnvironmentSwitcher currentEnvironment={currentEnvironment} />
            <ThemeSwitcher />
            <SearchCommand
              className="w-full min-w-0 sm:col-span-2 lg:min-w-52"
              version={version}
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
