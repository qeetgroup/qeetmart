"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants/store";
import type { FilterState } from "@/lib/filters";
import { ActiveFilters } from "@/components/product/active-filters";

interface PLPHeaderProps {
    title: string;
    totalResults: number;
    isUpdating: boolean;
    filters: FilterState;
    onChange: (next: Partial<FilterState>) => void;
    onClearAll: () => void;
    onMobileFiltersOpen: () => void;
}

export function PLPHeader({
    title,
    totalResults,
    isUpdating,
    filters,
    onChange,
    onClearAll,
    onMobileFiltersOpen,
}: PLPHeaderProps) {
    return (
        <div className="flex flex-col gap-4 pb-4">
            <div className="flex flex-col gap-1 md:gap-2">
                {/* Optional Breadcrumb placeholder - you can integrate actual breadcrumbs here */}
                <nav className="text-xs font-medium text-surface-500 mb-1 hidden md:block">
                    Home / Products {title !== "All Products" && `/ ${title}`}
                </nav>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-surface-900 md:text-4xl">
                            {title}
                        </h1>
                        <p className="mt-1 text-sm text-surface-600">
                            {totalResults} {totalResults === 1 ? "product" : "products"}
                            {isUpdating ? " • updating..." : ""}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="md:hidden flex-1 justify-center rounded-xl border-surface-200 bg-white shadow-sm"
                            onClick={onMobileFiltersOpen}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filters
                        </Button>

                        <div className="w-[180px] md:w-[220px]">
                            <Select
                                value={filters.sort}
                                onChange={(event) =>
                                    onChange({
                                        sort: event.target.value as FilterState["sort"],
                                        page: 1,
                                    })
                                }
                                options={SORT_OPTIONS.map((option) => ({
                                    value: option.value,
                                    label: option.label,
                                }))}
                                className="rounded-xl border-surface-200 shadow-sm focus:ring-brand-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-surface-200/60 pt-2 h-auto min-h-[40px]">
                <ActiveFilters filters={filters} onChange={onChange} onClearAll={onClearAll} />
            </div>
        </div>
    );
}
