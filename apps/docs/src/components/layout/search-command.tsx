"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { rankEntries, type SearchEntry } from "@/lib/docs/search";

type SearchCommandProps = {
  version: string;
};

export function SearchCommand({ version }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`/search-index/${version}.json`);
      if (!response.ok) {
        setEntries([]);
        return;
      }
      const payload = (await response.json()) as SearchEntry[];
      setEntries(payload);
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

  const results = useMemo(() => rankEntries(entries, query, 12), [entries, query]);

  return (
    <>
      <button className="search-trigger" onClick={() => setOpen(true)} type="button">
        Search
        <kbd>⌘K</kbd>
      </button>
      {open ? (
        <div className="search-overlay" role="dialog">
          <div className="search-panel">
            <input
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search docs, APIs, runbooks"
              value={query}
            />
            <ul>
              {results.length === 0 ? <li className="search-empty">No results</li> : null}
              {results.map((result) => (
                <li key={result.href}>
                  <Link href={result.href} onClick={() => setOpen(false)}>
                    <span>{result.title}</span>
                    <small>{result.section}</small>
                  </Link>
                </li>
              ))}
            </ul>
            <button className="close-search" onClick={() => setOpen(false)} type="button">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
