"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Grid2x2, ChevronRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories-api";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

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
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border border-transparent px-4 text-sm font-medium transition-all duration-200",
          open
            ? "bg-surface-100 text-brand-700 shadow-sm"
            : "bg-transparent text-surface-800 hover:bg-surface-50 hover:text-surface-900"
        )}
        aria-expanded={open}
      >
        <Grid2x2 className="h-4 w-4" />
        <span className="hidden lg:inline">Categories</span>
        <ChevronRight className={cn("hidden lg:block h-4 w-4 transition-transform duration-200", open && "rotate-90")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-[850px] animate-in slide-in-from-top-2 fade-in duration-200 rounded-2xl border border-surface-200/60 bg-white/95 backdrop-blur-xl p-6 shadow-2xl dark:bg-surface-900/95 dark:border-surface-800">
          <div className="flex gap-8">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">
                  Shop by Category
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className="group flex items-start justify-between gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-surface-50 dark:hover:bg-surface-800"
                  >
                    <div>
                      <p className="text-sm font-semibold text-surface-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
                        {category.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-surface-500 dark:text-surface-400">
                        {category.description || "Explore this category"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-surface-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
                  </Link>
                ))}
              </div>
              <div className="mt-6 border-t border-surface-200 dark:border-surface-800 pt-4">
                <Link
                  href="/products"
                  className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  View All Products <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Promotional Banner Area */}
            <div className="w-[280px] shrink-0">
              <div className="group relative h-full w-full overflow-hidden rounded-xl bg-surface-100 dark:bg-surface-800">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop"
                  alt="New Collection"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 z-20 p-5">
                  <span className="mb-2 inline-block rounded-full bg-brand-600 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    New Arrival
                  </span>
                  <h4 className="mb-1 text-lg font-bold text-white">Spring Collection</h4>
                  <p className="mb-3 text-xs text-surface-200">Discover the latest trends in modern commerce.</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-surface-900 transition-colors hover:bg-surface-100"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
