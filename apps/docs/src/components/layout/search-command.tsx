"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOTION, getReducedTransition, getStaggerDelay } from "@/lib/motion";
import { rankEntries, type SearchEntry } from "@/lib/docs/search";

type SearchCommandProps = {
  version: string;
};

export function SearchCommand({ version }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/search-index/${version}.json`);
        if (!response.ok) {
          setEntries([]);
          return;
        }
        const payload = (await response.json()) as SearchEntry[];
        setEntries(payload);
      } catch {
        setEntries([]);
      }
    };

    void load();
  }, [version]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((state) => !state);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const results = useMemo(() => rankEntries(entries, query, 12), [entries, query]);

  return (
    <>
      <Button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="h-9 w-full justify-between gap-2 sm:w-auto sm:min-w-52"
        onClick={() => setOpen(true)}
        variant="outline"
      >
        <span className="truncate text-sm">Search docs</span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">⌘K</kbd>
      </Button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            transition={getReducedTransition(reduceMotion, {
              duration: MOTION.duration.component,
              ease: MOTION.ease.inOut,
            })}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-labelledby="docs-search-title"
              aria-modal="true"
              className="surface-elevated w-full max-w-2xl rounded-xl p-4"
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.985, y: reduceMotion ? 0 : 4 }}
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.985, y: reduceMotion ? 0 : 6 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              transition={getReducedTransition(reduceMotion, {
                duration: MOTION.duration.component,
                ease: MOTION.ease.out,
              })}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground" id="docs-search-title">
                    Search Documentation
                  </h2>
                  <p className="text-xs text-muted-foreground">Find docs, runbooks, and API references quickly.</p>
                </div>
                <Button onClick={() => setOpen(false)} size="sm" variant="ghost">
                  Close
                </Button>
              </div>
              <Input
                autoFocus
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try: deployment, healthcheck, OpenAPI"
                value={query}
              />
              <ul className="mt-3 max-h-96 space-y-1 overflow-y-auto pr-1">
                {results.length === 0 ? (
                  <li className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                    No results found.
                  </li>
                ) : null}
                {results.map((result, index) => (
                  <motion.li
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                    key={result.href}
                    transition={getReducedTransition(reduceMotion, {
                      duration: MOTION.duration.micro,
                      ease: MOTION.ease.out,
                      delay: getStaggerDelay(index, results.length),
                    })}
                  >
                    <Link
                      className="block rounded-md border border-border px-3 py-2 transition-colors duration-150 hover:bg-muted"
                      href={result.href}
                      onClick={() => setOpen(false)}
                    >
                      <span className="block text-sm font-medium text-foreground">{result.title}</span>
                      <small className="mt-0.5 block text-xs text-muted-foreground">{result.section}</small>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
