"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PLPPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PLPPagination({ currentPage, totalPages, onPageChange }: PLPPaginationProps) {
    if (totalPages <= 1) return null;

    const handlePageChange = (page: number) => {
        onPageChange(page);
        // Smooth scroll back to top of product grid
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Logic for page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 mt-4 border-t border-surface-200/60">
            <p className="text-sm font-medium text-surface-500 order-2 sm:order-1">
                Showing page <span className="font-bold text-surface-900">{currentPage}</span> of{" "}
                <span className="font-bold text-surface-900">{totalPages}</span>
            </p>

            <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-surface-200 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-50 disabled:opacity-50 transition-colors"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === "...") {
                            return (
                                <div key={`ellipsis-${index}`} className="flex h-10 w-10 items-center justify-center text-surface-400">
                                    <MoreHorizontal className="h-4 w-4" />
                                </div>
                            );
                        }

                        const pageNum = page as number;
                        const isActive = pageNum === currentPage;

                        return (
                            <Button
                                key={pageNum}
                                variant={isActive ? "default" : "ghost"}
                                className={`h-10 w-10 p-0 font-semibold rounded-lg transition-all ${isActive
                                        ? "bg-brand-600 text-white shadow-md shadow-brand-500/30 hover:bg-brand-700"
                                        : "text-surface-700 hover:bg-surface-100 hover:text-surface-900"
                                    }`}
                                onClick={() => handlePageChange(pageNum)}
                                aria-label={`Go to page ${pageNum}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-surface-200 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-50 disabled:opacity-50 transition-colors"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
