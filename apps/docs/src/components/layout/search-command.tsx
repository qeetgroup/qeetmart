"use client";

import { useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { rankEntries, type SearchEntry } from "@/lib/docs/search";

type SearchCommandProps = {
  version: string;
};

export function SearchCommand({ version }: SearchCommandProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const response = await fetch(`/search-index/${version}.json`);
      if (!response.ok) {
        setEntries([]);
        setIsLoading(false);
        return;
      }
      const payload = (await response.json()) as SearchEntry[];
      setEntries(payload);
      setIsLoading(false);
    };

    void load();
  }, [version]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
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

  const results = useMemo(() => rankEntries(entries, query, 12), [entries, query]);
  const effectiveActiveIndex =
    activeIndex >= 0 && activeIndex < results.length ? activeIndex : results.length > 0 ? 0 : -1;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onBody = document.body;
    const previous = onBody.style.overflow;
    onBody.style.overflow = "hidden";
    return () => {
      onBody.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const panel = document.querySelector(".search-panel");
    if (!panel) {
      return;
    }

    const onTrap = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const focusable = panel.querySelectorAll<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener("keydown", onTrap);
    return () => panel.removeEventListener("keydown", onTrap);
  }, [open, results.length]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const goTo = (href: string) => {
    close();
    router.push(href);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        results.length === 0 ? -1 : Math.min(results.length - 1, (index >= 0 && index < results.length ? index : 0) + 1),
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        results.length === 0 ? -1 : Math.max(0, (index >= 0 && index < results.length ? index : 0) - 1),
      );
      return;
    }
    if (event.key === "Enter" && effectiveActiveIndex >= 0 && results[effectiveActiveIndex]) {
      event.preventDefault();
      goTo(results[effectiveActiveIndex].href);
    }
  };

  return (
    <>
      <button className="search-trigger" onClick={() => setOpen(true)} type="button">
        Search
        <kbd>⌘K</kbd>
      </button>
      {open ? (
        <div
          aria-labelledby="search-title"
          aria-modal="true"
          className="search-overlay"
          onClick={(event) => {
            if (event.currentTarget === event.target) {
              close();
            }
          }}
          role="dialog"
        >
          <div className="search-panel">
            <div className="search-panel-head">
              <h2 id="search-title">Search docs and APIs</h2>
              <small>{isLoading ? "Indexing..." : `${entries.length} entries`}</small>
            </div>
            <input
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Try: reserve stock, deployment rollback, JWT"
              value={query}
            />
            <ul>
              {query.trim() && results.length === 0 ? <li className="search-empty">No matching docs found.</li> : null}
              {!query.trim() ? <li className="search-empty">Type to search guides, runbooks, and endpoints.</li> : null}
              {results.map((result, index) => (
                <li key={`${result.href}-${result.title}-${index}`}>
                  <button
                    aria-current={effectiveActiveIndex === index ? "true" : undefined}
                    data-active={effectiveActiveIndex === index ? "true" : "false"}
                    onClick={() => goTo(result.href)}
                    onMouseEnter={() => setActiveIndex(index)}
                    type="button"
                  >
                    <div className="search-result-top">
                      <span>{result.title}</span>
                      <small>{result.section}</small>
                    </div>
                    <p className="search-result-desc">{result.description}</p>
                  </button>
                </li>
              ))}
            </ul>
            <div className="search-panel-footer">
              <span>Use ↑ ↓ and Enter to navigate.</span>
              <button className="close-search" onClick={close} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
