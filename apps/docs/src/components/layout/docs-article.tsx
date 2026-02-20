"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { MOTION, getReducedTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

type DocsArticleProps = {
  title: string;
  description: string;
  lastUpdated?: string;
  children: ReactNode;
  prose?: boolean;
  contentClassName?: string;
};

export function DocsArticle({
  title,
  description,
  lastUpdated,
  children,
  prose = true,
  contentClassName,
}: DocsArticleProps) {
  const reduceMotion = useReducedMotion();

  return (
    <article className="mx-auto w-full max-w-4xl min-w-0">
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="surface-elevated rounded-xl p-4 sm:p-6"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        transition={getReducedTransition(reduceMotion, {
          duration: MOTION.duration.page,
          ease: MOTION.ease.out,
        })}
      >
        <Badge variant="muted">Documentation</Badge>
        <h1 className="mt-3 text-balance break-words text-xl font-semibold tracking-tight text-foreground min-[420px]:text-2xl sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {description}
        </p>
        {lastUpdated ? <p className="mt-3 text-xs text-muted-foreground">Last updated: {lastUpdated}</p> : null}
      </motion.header>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "mt-4 rounded-xl border border-border bg-card p-4 sm:mt-5 sm:p-6",
          prose ? "doc-prose" : "",
          contentClassName,
        )}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        transition={getReducedTransition(reduceMotion, {
          duration: MOTION.duration.component,
          ease: MOTION.ease.out,
          delay: reduceMotion ? 0 : 0.05,
        })}
      >
        {children}
      </motion.section>
    </article>
  );
}
