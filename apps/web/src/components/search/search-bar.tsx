"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "@/lib/api/products-api";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { queryKeys } from "@/lib/query-keys";
import { useSessionStore } from "@/store/session-store";
import {
  getProfileUpdateEventName,
  readPersonalizationProfile,
} from "@/lib/personalization/profile-engine";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { Input } from "@/components/ui/input";
import { SearchDropdown } from "@/components/search/search-dropdown";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { trackEvent } = useTrackEvent();

  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [profile, setProfile] = useState(() => readPersonalizationProfile());
  const debounced = useDebounce(value, 240);

  const recentSearches = useSessionStore((state) => state.recentSearches);
  const addRecentSearch = useSessionStore((state) => state.addRecentSearch);

  useEffect(() => {
    const updateEvent = getProfileUpdateEventName();
    const onProfileUpdate = () => {
      setProfile(readPersonalizationProfile());
    };

    window.addEventListener(updateEvent, onProfileUpdate);
    return () => {
      window.removeEventListener(updateEvent, onProfileUpdate);
    };
  }, []);

  const activeCategory = useMemo(() => {
    if (!pathname.startsWith("/products/category/")) {
      return undefined;
    }

    return pathname.replace("/products/category/", "");
  }, [pathname]);

  const trimmed = debounced.trim();

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.search(
      trimmed,
      activeCategory,
      profile.totalInteractions,
    ),
    queryFn: () =>
      searchProducts(trimmed, {
        limit: 8,
        category: activeCategory,
        personalizationProfile: profile,
      }),
    enabled: trimmed.length > 0,
    staleTime: 30 * 1000,
  });

  const suggestions = useMemo(() => data ?? [], [data]);

  const submitSearch = (searchTerm: string) => {
    const normalized = searchTerm.trim();
    if (!normalized) {
      return;
    }

    addRecentSearch(normalized);
    trackEvent("search_submit", { query: normalized });
    setFocused(false);
    router.push(`/products?query=${encodeURIComponent(normalized)}`);
  };

  const openSuggestion = (index: number) => {
    const suggestion = suggestions[index];
    if (!suggestion) {
      return;
    }

    addRecentSearch(suggestion.title);
    setValue(suggestion.title);
    setFocused(false);

    trackEvent("search_suggestion_click", {
      query: trimmed,
      productId: suggestion.id,
      score: suggestion.score,
    });

    router.push(`/products/${suggestion.slug}`);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (focused && suggestions.length > 0) {
      openSuggestion(activeIndex);
      return;
    }

    submitSearch(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!focused || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((previous) =>
        Math.min(previous + 1, suggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((previous) => Math.max(previous - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      openSuggestion(activeIndex);
      return;
    }

    if (event.key === "Escape") {
      setFocused(false);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full mx-auto transition-all duration-300 ease-out",
        focused ? "max-w-3xl" : "max-w-xl"
      )}
    >
      <form onSubmit={onSubmit}>
        <div className="relative group">
          <Search className={cn(
            "pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transition-colors duration-200",
            focused ? "text-brand-600" : "text-surface-400 group-hover:text-surface-600"
          )} />
          <Input
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setTimeout(() => setFocused(false), 130);
            }}
            onKeyDown={onKeyDown}
            onChange={(event) => {
              setValue(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search for products, brands and categories..."
            className={cn(
              "h-12 w-full rounded-full border-surface-200 bg-surface-50 pl-12 pr-4 text-base shadow-sm outline-none transition-all duration-300 placeholder:text-surface-400 dark:border-surface-800 dark:bg-surface-900",
              focused
                ? "border-brand-500 bg-white ring-4 ring-brand-500/20 dark:bg-surface-950 dark:ring-brand-500/30"
                : "hover:border-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
            )}
            aria-label="Search products"
          />
        </div>
      </form>

      {focused ? (
        <SearchDropdown
          query={trimmed}
          suggestions={suggestions}
          loading={isFetching}
          recentSearches={recentSearches}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onPickRecent={(query) => {
            setValue(query);
            submitSearch(query);
          }}
          onSelect={(query) => {
            setValue(query);
            addRecentSearch(query);
            setFocused(false);
          }}
          onSelectSuggestion={(suggestion) => {
            trackEvent("search_suggestion_click", {
              query: trimmed,
              productId: suggestion.id,
              score: suggestion.score,
            });
          }}
        />
      ) : null}
    </div>
  );
}
