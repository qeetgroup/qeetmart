"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { getCategories } from "@/lib/api/categories-api";
import { getProducts } from "@/lib/api/products-api";
import { DEFAULT_PAGE_SIZE, SORT_OPTIONS } from "@/lib/constants/store";
import {
  filterStateToQuery,
  parseFilterState,
  toProductQueryParams,
  type FilterState,
} from "@/lib/filters";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { PLPFilters } from "@/components/product/plp-filters";

interface PLPShellProps {
  initialCategory?: string;
}

export function PLPShell({ initialCategory }: PLPShellProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const parsedFilters = useMemo(() => {
    const parsed = parseFilterState(new URLSearchParams(searchParams.toString()));
    if (!parsed.category && initialCategory) {
      parsed.category = initialCategory;
    }
    return parsed;
  }, [searchParams, initialCategory]);

  const productFilters = useMemo(
    () =>
      toProductQueryParams({
        ...parsedFilters,
      }),
    [parsedFilters],
  );

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
    queryKey: queryKeys.products(productFilters),
    queryFn: () => getProducts({ ...productFilters, pageSize: DEFAULT_PAGE_SIZE }),
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
  };

  const clearAll = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  const activeCategory = categories.find((category) => category.slug === parsedFilters.category);

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-surface-900 md:text-3xl">
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>
        <p className="text-sm text-surface-600">
          Discover curated products with dynamic filters and enterprise-grade catalog UX.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-200 bg-white p-3">
        <Button
          variant="outline"
          className="md:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>

        <p className="text-sm text-surface-700">
          {productResponse?.total ?? 0} results
          {isFetching || isPending ? " • updating..." : ""}
        </p>

        <div className="w-[220px]">
          <Select
            value={parsedFilters.sort}
            onChange={(event) => updateFilters({ sort: event.target.value as FilterState["sort"], page: 1 })}
            options={SORT_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[280px,1fr]">
        <Card className="hidden h-fit md:sticky md:top-24 md:block">
          <CardContent className="p-4">
            <PLPFilters
              categories={categories}
              availableBrands={productResponse?.availableBrands ?? []}
              minAvailablePrice={productResponse?.minAvailablePrice ?? 0}
              maxAvailablePrice={productResponse?.maxAvailablePrice ?? 200000}
              filters={parsedFilters}
              onChange={updateFilters}
              onReset={clearAll}
            />
          </CardContent>
        </Card>

        <section className="space-y-5">
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : productResponse && productResponse.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {productResponse.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-surface-200 bg-white p-3">
                <Button
                  variant="outline"
                  disabled={productResponse.page <= 1}
                  onClick={() => updateFilters({ page: productResponse.page - 1 })}
                >
                  Previous
                </Button>
                <p className="text-sm text-surface-600">
                  Page {productResponse.page} of {productResponse.totalPages}
                </p>
                <Button
                  variant="outline"
                  disabled={productResponse.page >= productResponse.totalPages}
                  onClick={() => updateFilters({ page: productResponse.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              title="No products match your filters"
              description="Try broadening your filters, switching categories, or searching another keyword."
              actionHref="/products"
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

      <Drawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filters"
        side="left"
      >
        <PLPFilters
          categories={categories}
          availableBrands={productResponse?.availableBrands ?? []}
          minAvailablePrice={productResponse?.minAvailablePrice ?? 0}
          maxAvailablePrice={productResponse?.maxAvailablePrice ?? 200000}
          filters={parsedFilters}
          onChange={(next) => {
            updateFilters(next);
          }}
          onReset={clearAll}
        />
      </Drawer>
    </div>
  );
}
