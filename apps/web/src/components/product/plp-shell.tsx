"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories-api";
import { getProducts } from "@/lib/api/products-api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/store";
import {
  filterStateToQuery,
  parseFilterState,
  toProductQueryParams,
  type FilterState,
} from "@/lib/filters";
import {
  getProfileUpdateEventName,
  readPersonalizationProfile,
  trackCategoryBrowse,
} from "@/lib/personalization/profile-engine";
import { queryKeys } from "@/lib/query-keys";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { EmptyState } from "@/components/common/empty-state";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { PLPFilters } from "@/components/product/plp-filters";
import { PLPHeader } from "@/components/product/plp-header";
import { MobileFilterDrawer } from "@/components/product/mobile-filter-drawer";
import { PLPPagination } from "@/components/product/plp-pagination";

interface PLPShellProps {
  initialCategory?: string;
}

export function PLPShell({ initialCategory }: PLPShellProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [personalizationProfile, setPersonalizationProfile] = useState(() =>
    readPersonalizationProfile(),
  );

  const { trackEvent } = useTrackEvent();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const updateEvent = getProfileUpdateEventName();
    const onProfileUpdate = () =>
      setPersonalizationProfile(readPersonalizationProfile());

    window.addEventListener(updateEvent, onProfileUpdate);

    return () => {
      window.removeEventListener(updateEvent, onProfileUpdate);
    };
  }, []);

  const parsedFilters = useMemo(() => {
    const parsed = parseFilterState(new URLSearchParams(searchParams.toString()));
    if (!parsed.category && initialCategory) {
      parsed.category = initialCategory;
    }
    return parsed;
  }, [searchParams, initialCategory]);

  useEffect(() => {
    if (!parsedFilters.category) {
      return;
    }

    trackCategoryBrowse(parsedFilters.category);
  }, [parsedFilters.category]);

  const productFilters = useMemo(
    () =>
      toProductQueryParams({
        ...parsedFilters,
      }),
    [parsedFilters],
  );

  const effectiveFilters = useMemo(() => {
    if (parsedFilters.sort !== "personalized") {
      return productFilters;
    }

    return {
      ...productFilters,
      personalizationProfile,
    };
  }, [parsedFilters.sort, personalizationProfile, productFilters]);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
    staleTime: 30 * 60 * 1000,
  });

  const {
    data: productResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.products({
      ...effectiveFilters,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    queryFn: () => getProducts({ ...effectiveFilters, pageSize: DEFAULT_PAGE_SIZE }),
    placeholderData: (previousData) => previousData,
  });

  const updateFilters = (next: Partial<FilterState>) => {
    const merged: FilterState = {
      ...parsedFilters,
      ...next,
    };

    const query = filterStateToQuery(merged).toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });

    trackEvent("page_view", {
      context: "plp_filter_update",
      query,
    });
  };

  const clearAll = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  const activeCategory = categories.find((category) => category.slug === parsedFilters.category);

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <PLPHeader
        title={activeCategory ? activeCategory.name : "All Products"}
        totalResults={productResponse?.total ?? 0}
        isUpdating={isFetching || isPending}
        filters={parsedFilters}
        onChange={updateFilters}
        onClearAll={clearAll}
        onMobileFiltersOpen={() => setMobileFiltersOpen(true)}
      />

      <div className="flex flex-col md:grid md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr] gap-8 items-start">
        <aside className="hidden md:block md:sticky md:top-24 h-[calc(100vh-8rem)] w-full self-start z-20">
          <PLPFilters
            className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 border border-surface-200/60 overflow-hidden"
            categories={categories}
            availableBrands={productResponse?.availableBrands ?? []}
            minAvailablePrice={productResponse?.minAvailablePrice ?? 0}
            maxAvailablePrice={productResponse?.maxAvailablePrice ?? 200000}
            filters={parsedFilters}
            onChange={updateFilters}
            onReset={clearAll}
          />
        </aside>

        <section className="flex-1 space-y-5 min-w-0 w-full">
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : productResponse && productResponse.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {productResponse.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <PLPPagination
                currentPage={productResponse.page}
                totalPages={productResponse.totalPages}
                onPageChange={(page) => updateFilters({ page })}
              />
            </>
          ) : (
            <EmptyState
              title="No products match your filters"
              description="Try broadening your filters, switching categories, or searching another keyword."
              actionHref="/products"
              onReset={clearAll}
            />
          )}

          <div className="rounded-xl border border-surface-200 bg-brand-50 p-4 text-sm text-brand-800">
            Need category-first browsing? Try
            {" "}
            <Link href="/products/category/electronics" className="font-semibold underline">
              Electronics
            </Link>
            {" "}
            or
            {" "}
            <Link href="/products/category/fashion" className="font-semibold underline">
              Fashion
            </Link>
            .
          </div>
        </section>
      </div>

      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        availableBrands={productResponse?.availableBrands ?? []}
        minAvailablePrice={productResponse?.minAvailablePrice ?? 0}
        maxAvailablePrice={productResponse?.maxAvailablePrice ?? 200000}
        filters={parsedFilters}
        onChange={updateFilters}
        onReset={clearAll}
        totalResults={productResponse?.total ?? 0}
      />
    </div>
  );
}
