"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
}

export function PLPFilters({
  categories,
  availableBrands,
  minAvailablePrice,
  maxAvailablePrice,
  filters,
  onChange,
  onReset,
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-surface-800 uppercase">
          Filters
        </h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <Separator />

      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-surface-600 uppercase">
          Category
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-surface-700">
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => onChange({ category: "", page: 1 })}
            />
            All Categories
          </label>
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm text-surface-700">
              <input
                type="radio"
                name="category"
                checked={filters.category === category.slug}
                onChange={() => onChange({ category: category.slug, page: 1 })}
              />
              {category.name}
            </label>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-surface-600 uppercase">
          Price Range
        </p>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-surface-600">
              <span>Min</span>
              <span>{formatCurrency(minValue)}</span>
            </div>
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
              className="w-full"
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-surface-600">
              <span>Max</span>
              <span>{formatCurrency(maxValue)}</span>
            </div>
            <input
              type="range"
              min={minAvailablePrice}
              max={safeMax}
              value={maxValue}
              onChange={(event) => {
                const value = Number(event.target.value);
                onChange({ maxPrice: Math.max(value, minValue), page: 1 });
              }}
              className="w-full"
            />
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-surface-600 uppercase">
          Rating
        </p>
        <div className="space-y-2">
          {[4, 3, 2].map((rating) => (
            <label key={rating} className="flex items-center gap-2 text-sm text-surface-700">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => onChange({ rating, page: 1 })}
              />
              {rating}+ stars
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm text-surface-700">
            <input
              type="radio"
              name="rating"
              checked={!filters.rating}
              onChange={() => onChange({ rating: null, page: 1 })}
            />
            Any rating
          </label>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-surface-600 uppercase">
          Brand
        </p>
        <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
          {availableBrands.map((brand) => (
            <Checkbox
              key={brand}
              id={`brand-${brand}`}
              checked={filters.brands.includes(brand)}
              label={brand}
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
      </section>

      <Separator />

      <section className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-surface-600 uppercase">
          Availability
        </p>
        <Checkbox
          id="availability-in-stock"
          checked={filters.availability === "in-stock"}
          label="In stock only"
          onChange={(event) =>
            onChange({ availability: event.currentTarget.checked ? "in-stock" : "all", page: 1 })
          }
        />
      </section>
    </div>
  );
}
