"use client";

import { X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { FilterState } from "@/lib/filters";

interface ActiveFiltersProps {
    filters: FilterState;
    onChange: (next: Partial<FilterState>) => void;
    onClearAll: () => void;
}

export function ActiveFilters({ filters, onChange, onClearAll }: ActiveFiltersProps) {
    const activeChips: { id: string; label: string; onRemove: () => void }[] = [];

    if (filters.category) {
        activeChips.push({
            id: "category",
            label: `Category: ${filters.category}`,
            onRemove: () => onChange({ category: "", page: 1 }),
        });
    }

    if (filters.minPrice !== null || filters.maxPrice !== null) {
        const minText = filters.minPrice !== null ? formatCurrency(filters.minPrice) : "$0";
        const maxText = filters.maxPrice !== null ? formatCurrency(filters.maxPrice) : "Any";
        activeChips.push({
            id: "price",
            label: `Price: ${minText} - ${maxText}`,
            onRemove: () => onChange({ minPrice: null, maxPrice: null, page: 1 }),
        });
    }

    if (filters.rating !== null) {
        activeChips.push({
            id: "rating",
            label: `${filters.rating}+ Stars`,
            onRemove: () => onChange({ rating: null, page: 1 }),
        });
    }

    filters.brands.forEach((brand) => {
        activeChips.push({
            id: `brand-${brand}`,
            label: brand,
            onRemove: () => {
                onChange({
                    brands: filters.brands.filter((b) => b !== brand),
                    page: 1,
                });
            },
        });
    });

    if (filters.availability === "in-stock") {
        activeChips.push({
            id: "availability",
            label: "In Stock",
            onRemove: () => onChange({ availability: "all", page: 1 }),
        });
    }

    if (activeChips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 py-2">
            <span className="text-xs font-medium text-surface-500 mr-1">Active Filters:</span>
            <div className="flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                    <span
                        key={chip.id}
                        className="flex items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-medium text-surface-800 shadow-sm transition-colors hover:bg-surface-50"
                    >
                        {chip.label}
                        <button
                            onClick={chip.onRemove}
                            className="ml-0.5 rounded-full p-0.5 text-surface-400 hover:bg-surface-200 hover:text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
                            aria-label={`Remove filter ${chip.label}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                {activeChips.length > 1 && (
                    <button
                        onClick={onClearAll}
                        className="ml-2 text-xs font-semibold text-brand-600 hover:text-brand-800 underline decoration-brand-600/30 underline-offset-4 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>
        </div>
    );
}
