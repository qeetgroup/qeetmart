"use client";

import { useState } from "react";
import Link from "next/link";
import { Grid2x2, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories-api";
import { queryKeys } from "@/lib/query-keys";

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
    staleTime: 30 * 60 * 1000,
  });

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-300 bg-white px-3 text-sm font-medium text-surface-800 hover:border-brand-300 hover:text-brand-700"
        aria-expanded={open}
      >
        <Grid2x2 className="h-4 w-4" />
        Categories
      </button>

      {open ? (
        <div className="absolute top-full left-0 z-50 mt-2 w-[760px] rounded-xl border border-surface-200 bg-white p-4 shadow-2xl">
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/category/${category.slug}`}
                className="group rounded-lg border border-surface-200 p-3 transition hover:border-brand-300 hover:bg-brand-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-surface-900 group-hover:text-brand-700">
                      {category.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-surface-600">
                      {category.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-surface-500 group-hover:text-brand-700" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
