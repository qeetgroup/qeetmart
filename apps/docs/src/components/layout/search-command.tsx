"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOTION, getReducedTransition, getStaggerDelay } from "@/lib/motion";
import { rankEntries, type SearchEntry } from "@/lib/docs/search";
import { cn } from "@/lib/utils";

type SearchCommandProps = {
  version: string;
  className?: string;
};

export function SearchCommand({ version, className }: SearchCommandProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const resultsListId = "docs-search-results";

  useEffect(() => {
    setMounted(true);
  }, []);

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
        setActiveIndex(0);
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

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [open]);

  const results = useMemo(() => rankEntries(entries, query, 12), [entries, query]);
  const currentActiveIndex = results.length === 0 ? -1 : Math.min(activeIndex, results.length - 1);

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + results.length) % results.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (currentActiveIndex >= 0) {
        resultRefs.current[currentActiveIndex]?.click();
      }
    }
  };

  return (
    <>
      <Button
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn("h-9 w-full justify-between gap-2 sm:w-auto sm:min-w-52", className)}
        onClick={() => {
          setActiveIndex(0);
          setOpen(true);
        }}
        variant="outline"
      >
        <span className="truncate text-sm">Search docs</span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">⌘K</kbd>
      </Button>
      {mounted
        ? createPortal(
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-3 backdrop-blur-[2px] sm:p-4"
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
                    className="w-full max-w-2xl max-h-[88dvh] overflow-hidden rounded-xl border border-border bg-card shadow-[0_18px_42px_rgba(0,0,0,0.22)]"
                    exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.985, y: reduceMotion ? 0 : 4 }}
                    initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.985, y: reduceMotion ? 0 : 6 }}
                    onClick={(event) => event.stopPropagation()}
                    role="dialog"
                    transition={getReducedTransition(reduceMotion, {
                      duration: MOTION.duration.component,
                      ease: MOTION.ease.out,
                    })}
                  >
                    <div className="flex flex-col gap-2 border-b border-border/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4">
                      <div>
                        <h2 className="text-sm font-semibold text-foreground" id="docs-search-title">
                          Search Documentation
                        </h2>
                        <p className="text-xs text-muted-foreground">Find docs, runbooks, and API references quickly.</p>
                      </div>
                      <Button className="self-start sm:self-auto" onClick={() => setOpen(false)} size="sm" variant="ghost">
                        Close
                      </Button>
                    </div>
                    <div className="px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
                      <Input
                        aria-controls={resultsListId}
                        aria-expanded={open}
                        aria-label="Search documentation"
                        className="h-10 bg-background/90 text-sm"
                        onKeyDown={onInputKeyDown}
                        onChange={(event) => {
                          setActiveIndex(0);
                          setQuery(event.target.value);
                        }}
                        placeholder="Try: deployment, healthcheck, OpenAPI"
                        ref={inputRef}
                        value={query}
                      />
                    </div>
                    <ul
                      className="max-h-[62dvh] space-y-1 overflow-y-auto px-3 pb-3 pr-2 sm:px-4 sm:pb-4"
                      id={resultsListId}
                      role="listbox"
                    >
                      {results.length === 0 ? (
                        <li className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                          No results found.
                        </li>
                      ) : null}
                      {results.map((result, index) => (
                        <motion.li
                          animate={{ opacity: 1, y: 0 }}
                          initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                          key={`${result.href}-${result.title}-${index}`}
                          role="option"
                          aria-selected={index === currentActiveIndex}
                          transition={getReducedTransition(reduceMotion, {
                            duration: MOTION.duration.micro,
                            ease: MOTION.ease.out,
                            delay: getStaggerDelay(index, results.length),
                          })}
                        >
                          <Link
                            className={cn(
                              "block rounded-md border border-border bg-background/85 px-3 py-2 transition-colors duration-150 hover:border-primary/35 hover:bg-muted/70",
                              index === currentActiveIndex ? "border-primary/40 bg-muted/80" : "",
                            )}
                            href={result.href}
                            onFocus={() => setActiveIndex(index)}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => setOpen(false)}
                            ref={(node) => {
                              resultRefs.current[index] = node;
                            }}
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
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
