"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "@/lib/api/products-api";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { queryKeys } from "@/lib/query-keys";
import { useSessionStore } from "@/store/session-store";
import { Input } from "@/components/ui/input";
import { SearchDropdown } from "@/components/search/search-dropdown";

export function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const debounced = useDebounce(value, 280);

  const recentSearches = useSessionStore((state) => state.recentSearches);
  const addRecentSearch = useSessionStore((state) => state.addRecentSearch);

  const trimmed = debounced.trim();

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.search(trimmed),
    queryFn: () => searchProducts(trimmed),
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
    setFocused(false);
    router.push(`/products?query=${encodeURIComponent(normalized)}`);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch(value);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={onSubmit}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-surface-500" />
          <Input
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setTimeout(() => setFocused(false), 130);
            }}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Search for products, brands and categories"
            className="h-11 rounded-full border-surface-300 pl-10"
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
          onPickRecent={(query) => {
            setValue(query);
            submitSearch(query);
          }}
          onSelect={(query) => {
            setValue(query);
            addRecentSearch(query);
            setFocused(false);
          }}
        />
      ) : null}
    </div>
  );
}
