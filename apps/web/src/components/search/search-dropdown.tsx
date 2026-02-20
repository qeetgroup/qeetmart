"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency, highlightText } from "@/lib/utils";
import type { SearchSuggestion } from "@/types";

interface SearchDropdownProps {
  query: string;
  suggestions: SearchSuggestion[];
  loading: boolean;
  recentSearches: string[];
  onPickRecent: (query: string) => void;
  onSelect: (query: string) => void;
}

export function SearchDropdown({
  query,
  suggestions,
  loading,
  recentSearches,
  onPickRecent,
  onSelect,
}: SearchDropdownProps) {
  const showSuggestions = query.trim().length > 0;
  const hasSuggestions = suggestions.length > 0;

  if (!showSuggestions && recentSearches.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-2xl">
      {showSuggestions ? (
        <div className="max-h-[420px] overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-surface-600">Searching products...</p>
          ) : hasSuggestions ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <Link
                    href={`/products/${suggestion.slug}`}
                    onClick={() => onSelect(suggestion.title)}
                    className="grid grid-cols-[48px,1fr,auto] items-center gap-3 px-4 py-3 transition hover:bg-surface-100"
                  >
                    <Image
                      src={suggestion.thumbnail}
                      alt={suggestion.title}
                      width={48}
                      height={48}
                      className="rounded-md border border-surface-200 object-cover"
                    />
                    <div className="space-y-1">
                      <p className="line-clamp-1 text-sm font-medium text-surface-900">
                        {highlightText(suggestion.title, query).map((part, index) => (
                          <span
                            key={`${suggestion.id}-${index}`}
                            className={part.match ? "bg-amber-200" : ""}
                          >
                            {part.text}
                          </span>
                        ))}
                      </p>
                      <p className="text-xs text-surface-600">Product result</p>
                    </div>
                    <p className="text-sm font-semibold text-brand-700">
                      {formatCurrency(suggestion.price)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-sm text-surface-600">No matching products found.</p>
          )}
        </div>
      ) : null}

      {recentSearches.length > 0 ? (
        <div className="border-t border-surface-200 bg-surface-50 px-4 py-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-surface-600 uppercase">
            Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onPickRecent(item)}
                className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs text-surface-700 hover:border-brand-300 hover:text-brand-700"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
