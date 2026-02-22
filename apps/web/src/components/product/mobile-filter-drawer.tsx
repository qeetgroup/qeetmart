"use client";

import { useMemo } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { PLPFilters } from "@/components/product/plp-filters";
import type { Category } from "@/types";
import type { FilterState } from "@/lib/filters";

interface MobileFilterDrawerProps {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    availableBrands: string[];
    minAvailablePrice: number;
    maxAvailablePrice: number;
    filters: FilterState;
    onChange: (next: Partial<FilterState>) => void;
    onReset: () => void;
    totalResults: number;
}

export function MobileFilterDrawer({
    open,
    onClose,
    categories,
    availableBrands,
    minAvailablePrice,
    maxAvailablePrice,
    filters,
    onChange,
    onReset,
    totalResults,
}: MobileFilterDrawerProps) {
    // Count active filters for summary
    const activeCount = useMemo(() => {
        let count = 0;
        if (filters.category) count++;
        if (filters.minPrice !== null || filters.maxPrice !== null) count++;
        if (filters.rating !== null) count++;
        if (filters.availability === "in-stock") count++;
        count += filters.brands.length;
        return count;
    }, [filters]);

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={`Filters ${activeCount > 0 ? `(${activeCount})` : ""}`}
            side="left"
        >
            <div className="flex flex-col h-full relative -mx-4 -mt-4 bg-surface-50">
                <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 custom-scrollbar">
                    <PLPFilters
                        categories={categories}
                        availableBrands={availableBrands}
                        minAvailablePrice={minAvailablePrice}
                        maxAvailablePrice={maxAvailablePrice}
                        filters={filters}
                        onChange={onChange}
                        onReset={onReset}
                    />
                </div>

                {/* Sticky Bottom Action Bar */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-surface-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-12 font-semibold text-surface-700 bg-white border-surface-300 shadow-sm"
                        onClick={() => {
                            onReset();
                            onClose();
                        }}
                    >
                        Clear All
                    </Button>
                    <Button
                        className="flex-1 rounded-xl h-12 font-bold shadow-md shadow-brand-500/20"
                        onClick={onClose}
                    >
                        Apply • {totalResults} items
                    </Button>
                </div>
            </div>
        </Drawer>
    );
}
