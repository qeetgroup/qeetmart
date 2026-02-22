"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, ChevronRight } from "lucide-react";
import { formatCurrency, getDiscountPercentage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductRating } from "@/components/product/product-rating";
import type { Product } from "@/types";

interface QuickViewModalProps {
    product: Product;
    open: boolean;
    onClose: () => void;
    onAddToCart: () => void;
}

export function QuickViewModal({ product, open, onClose, onAddToCart }: QuickViewModalProps) {
    const [activeImage, setActiveImage] = useState(0);

    // Prevent background scrolling when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const discount = getDiscountPercentage(product.price, product.originalPrice);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-300 md:flex-row md:max-h-[85vh]"
                role="dialog"
                aria-modal="true"
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 rounded-full bg-white/80 p-2 text-surface-600 backdrop-blur-sm transition-colors hover:bg-surface-100 hover:text-surface-900 md:bg-surface-100 md:hover:bg-surface-200"
                    aria-label="Close modal"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Image Gallery Side */}
                <div className="flex flex-col bg-surface-50 md:w-1/2">
                    <div className="relative aspect-square w-full">
                        <Image
                            src={product.images[activeImage]}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex justify-center gap-2 overflow-x-auto p-4 custom-scrollbar">
                            {product.images.map((img, idx) => (
                                <button
                                    key={img}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${activeImage === idx ? "border-brand-600 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                                        }`}
                                >
                                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Side */}
                <div className="flex flex-col p-6 md:w-1/2 md:p-8 overflow-y-auto custom-scrollbar">
                    <p className="text-sm font-bold tracking-widest text-brand-600 uppercase mb-2">
                        {product.brand}
                    </p>
                    <h2 className="text-xl font-bold tracking-tight text-surface-900 md:text-2xl mb-2">
                        {product.title}
                    </h2>

                    <div className="mb-6 flex items-center gap-4">
                        <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
                        {product.stock > 0 && product.stock <= 5 && (
                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                                Only {product.stock} left
                            </span>
                        )}
                    </div>

                    <div className="mb-6 flex items-end gap-3">
                        <span className="text-3xl font-black text-surface-900">
                            {formatCurrency(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                            <>
                                <span className="text-lg font-medium text-surface-400 line-through mb-1">
                                    {formatCurrency(product.originalPrice)}
                                </span>
                                <span className="mb-1 rounded-md bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                                    Save {discount}%
                                </span>
                            </>
                        )}
                    </div>

                    <p className="text-surface-600 leading-relaxed mb-8 line-clamp-3">
                        {product.description || "Premium quality product with dynamic features, crafted for everyday use and maximum durability."}
                    </p>

                    <div className="mt-auto space-y-4">
                        <Button
                            className="w-full h-12 rounded-xl text-base font-bold transition-transform active:scale-95 shadow-md shadow-brand-500/20"
                            disabled={product.stock <= 0}
                            onClick={() => {
                                onAddToCart();
                                onClose();
                            }}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                        </Button>

                        <Link
                            href={`/products/${product.slug}`}
                            className="flex w-full items-center justify-center h-12 rounded-xl border border-surface-200 bg-white font-semibold text-surface-800 transition-colors hover:bg-surface-50 hover:text-brand-700"
                            onClick={onClose}
                        >
                            View Full Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
