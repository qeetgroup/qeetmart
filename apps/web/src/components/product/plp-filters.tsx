"use client";

import { useMemo } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category } from "@/types";
import type { FilterState } from "@/lib/filters";

interface PLPFiltersProps {
  categories: Category[];
  availableBrands: string[];
  minAvailablePrice: number;
  maxAvailablePrice: number;
  filters: FilterState;
  onChange: (next: Partial<FilterState>) => void;
  onReset: () => void;
  className?: string;
}

const Accordion = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => (
  <details className="group border-b border-surface-200/60 pb-5 mb-5 last:border-0" open={defaultOpen}>
    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold tracking-wide text-surface-900 outline-none hover:text-brand-700 transition-colors [&::-webkit-details-marker]:hidden">
      <span className="uppercase text-xs">{title}</span>
      <span className="transition-transform duration-300 group-open:-rotate-180">
        <ChevronDown className="h-4 w-4 text-surface-400" />
      </span>
    </summary>
    <div className="mt-4 animate-in slide-in-from-top-1 fade-in duration-300 ease-out text-sm">
      {children}
    </div>
  </details>
);

export function PLPFilters({
  categories,
  availableBrands,
  minAvailablePrice,
  maxAvailablePrice,
  filters,
  onChange,
  onReset,
  className = "",
}: PLPFiltersProps) {
  const safeMax = Math.max(maxAvailablePrice, minAvailablePrice + 500);

  const minValue = useMemo(() => {
    if (typeof filters.minPrice === "number") {
      return Math.max(minAvailablePrice, Math.min(filters.minPrice, safeMax));
    }
    return minAvailablePrice;
  }, [filters.minPrice, minAvailablePrice, safeMax]);

  const maxValue = useMemo(() => {
    if (typeof filters.maxPrice === "number") {
      return Math.max(minValue, Math.min(filters.maxPrice, safeMax));
    }
    return safeMax;
  }, [filters.maxPrice, minValue, safeMax]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between pb-5 border-b border-surface-200/60 mb-5">
        <h3 className="text-base font-bold text-surface-900">
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 text-surface-500 hover:text-brand-700 hover:bg-brand-50"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset All
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <Accordion title="Category" defaultOpen>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-surface-700 hover:text-surface-900 cursor-pointer transition-colors">
              <input
                type="radio"
                name="category"
                checked={!filters.category}
                onChange={() => onChange({ category: "", page: 1 })}
                className="text-brand-600 focus:ring-brand-500 rounded-full h-4 w-4 border-surface-300"
              />
              <span className="font-medium">All Categories</span>
            </label>
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-3 text-surface-700 hover:text-surface-900 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category.slug}
                  onChange={() => onChange({ category: category.slug, page: 1 })}
                  className="text-brand-600 focus:ring-brand-500 rounded-full h-4 w-4 border-surface-300"
                />
                <span className="font-medium">{category.name}</span>
              </label>
            ))}
          </div>
        </Accordion>

        <Accordion title="Price Range" defaultOpen>
          <div className="space-y-5 px-1">
            <div className="flex items-center justify-between text-sm font-semibold text-surface-900">
              <span className="bg-surface-100 px-2 py-1 rounded-md">{formatCurrency(minValue)}</span>
              <span className="text-surface-400">-</span>
              <span className="bg-surface-100 px-2 py-1 rounded-md">{formatCurrency(maxValue)}</span>
            </div>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute -top-6 left-0 text-[10px] font-bold text-surface-500 uppercase">Min Price</div>
                <input
                  type="range"
                  min={minAvailablePrice}
                  max={safeMax}
                  value={minValue}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    onChange({
                      minPrice: value,
                      maxPrice: Math.max(value, maxValue),
                      page: 1,
                    });
                  }}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>
              <div className="relative group pt-2">
                <div className="absolute -top-4 left-0 text-[10px] font-bold text-surface-500 uppercase">Max Price</div>
                <input
                  type="range"
                  min={minAvailablePrice}
                  max={safeMax}
                  value={maxValue}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    onChange({ maxPrice: Math.max(value, minValue), page: 1 });
                  }}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </Accordion>

        <Accordion title="Rating" defaultOpen>
          <div className="space-y-3">
            {[4, 3, 2].map((rating) => (
              <label key={rating} className="flex items-center gap-3 text-surface-700 hover:text-surface-900 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => onChange({ rating, page: 1 })}
                  className="text-brand-600 focus:ring-brand-500 h-4 w-4 border-surface-300"
                />
                <span className="flex items-center font-medium">
                  {rating} Stars & Up
                </span>
              </label>
            ))}
            <label className="flex items-center gap-3 text-surface-700 hover:text-surface-900 cursor-pointer transition-colors">
              <input
                type="radio"
                name="rating"
                checked={!filters.rating}
                onChange={() => onChange({ rating: null, page: 1 })}
                className="text-brand-600 focus:ring-brand-500 h-4 w-4 border-surface-300"
              />
              <span className="font-medium">Any rating</span>
            </label>
          </div>
        </Accordion>

        <Accordion title="Brands" defaultOpen={false}>
          <div className="max-h-56 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {availableBrands.map((brand) => (
              <Checkbox
                key={brand}
                id={`brand-${brand}`}
                checked={filters.brands.includes(brand)}
                label={brand}
                className="font-medium"
                onChange={(event) => {
                  onChange({
                    brands: event.currentTarget.checked
                      ? [...filters.brands, brand]
                      : filters.brands.filter((value) => value !== brand),
                    page: 1,
                  });
                }}
              />
            ))}
          </div>
        </Accordion>

        <Accordion title="Availability" defaultOpen={false}>
          <div className="pt-1">
            <Checkbox
              id="availability-in-stock"
              checked={filters.availability === "in-stock"}
              label="In stock only"
              className="font-medium"
              onChange={(event) =>
                onChange({ availability: event.currentTarget.checked ? "in-stock" : "all", page: 1 })
              }
            />
          </div>
        </Accordion>
      </div>
    </div>
  );
}
