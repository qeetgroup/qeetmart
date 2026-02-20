"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MOTION, getReducedTransition } from "@/lib/motion";
import { EnvironmentSwitcher } from "./environment-switcher";
import { SearchCommand } from "./search-command";
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
      className="sticky top-0 z-40 border-b border-border/90 bg-card/95 backdrop-blur-md"
      initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
      transition={transition}
    >
      <div className="mx-auto flex h-auto min-h-14 w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            className="text-base font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary"
            href="/"
          >
            qeetmart Documentation
          </Link>
          <Badge className="hidden sm:inline-flex" variant="muted">
            Enterprise Docs
          </Badge>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <VersionSwitcher currentVersion={version} />
          <EnvironmentSwitcher currentEnvironment={currentEnvironment} />
          <SearchCommand version={version} />
        </div>
      </div>
    </motion.header>
  );
}
