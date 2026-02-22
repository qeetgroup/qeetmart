"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProductBySlug } from "@/lib/api/products-api";
import { getInventoryInsights } from "@/lib/inventory/inventory-intelligence";
import {
  trackCartAddition,
  trackProductView,
} from "@/lib/personalization/profile-engine";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency, getDiscountPercentage } from "@/lib/utils";
import { useExperiment } from "@/hooks/useExperiment";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { useCartStore } from "@/store/cart-store";
import { useSessionStore } from "@/store/session-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductRating } from "@/components/product/product-rating";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const queryClient = useQueryClient();
  const { trackEvent } = useTrackEvent();
  const pricingExperiment = useExperiment("pricing_presentation");
  const addItem = useCartStore((state) => state.addItem);
  const user = useSessionStore((state) => state.user);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);

  const wishlisted = user ? isWishlisted(user.id, product.id) : false;
  const discount = getDiscountPercentage(product.price, product.originalPrice);
  const inventoryInsights = useMemo(() => getInventoryInsights(product), [product]);

  const hasSecondaryImage = product.images.length > 1;

  const handleAddToCart = () => {
    addItem({ productId: product.id, quantity: 1 });
    trackCartAddition(product, 1);
    trackEvent("add_to_cart", {
      productId: product.id,
      source: "product_card",
      quantity: 1,
    });
    toast.success("Added to cart");
  };

  return (
    <>
      <Card
        className="group flex h-full flex-col overflow-hidden border border-surface-200/60 bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl"
        onMouseEnter={() => {
          queryClient.prefetchQuery({
            queryKey: queryKeys.product(product.slug),
            queryFn: () => getProductBySlug(product.slug),
          });
        }}
      >
        <div className="relative overflow-hidden bg-surface-50">
          <Link
            href={`/products/${product.slug}`}
            className="block aspect-[4/5] w-full relative"
            onClick={() => {
              trackProductView(product);
              trackEvent("product_click", {
                productId: product.id,
                source: "product_image",
              });
            }}
          >
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className={`object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${hasSecondaryImage ? "group-hover:opacity-0" : ""}`}
            />
            {hasSecondaryImage && (
              <Image
                src={product.images[1]}
                alt={`${product.title} alternate view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover absolute inset-0 opacity-0 transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-100"
              />
            )}
          </Link>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/5 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100 pointer-events-none">
            <button
              className="translate-y-4 rounded-full bg-white p-3 text-surface-700 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-brand-50 hover:text-brand-700 group-hover:translate-y-0 pointer-events-auto"
              onClick={(e) => {
                e.preventDefault();
                setQuickViewOpen(true);
              }}
              aria-label="Quick view"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              className="translate-y-4 rounded-full bg-white p-3 text-surface-700 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-brand-50 hover:text-brand-700 group-hover:translate-y-0 pointer-events-auto delay-75"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 pointer-events-none">
            {discount > 0 && <Badge variant="warning" className="px-2 py-0.5 text-[10px] font-bold tracking-wider shadow-sm uppercase rounded-sm">- {discount}%</Badge>}
            {product.isNew && <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold tracking-wider shadow-sm uppercase rounded-sm ring-1 ring-surface-200">New</Badge>}
            {product.stock <= 0 ? (
              <Badge variant="destructive" className="px-2 py-0.5 text-[10px] font-bold tracking-wider shadow-sm uppercase rounded-sm">Sold Out</Badge>
            ) : inventoryInsights.level === "critical" ? (
              <Badge variant="destructive" className="px-2 py-0.5 text-[10px] font-bold tracking-wider shadow-sm uppercase rounded-sm bg-red-600">Few Left</Badge>
            ) : null}
          </div>

          <button
            type="button"
            aria-label="Toggle wishlist"
            onClick={(e) => {
              e.preventDefault();
              if (!user) {
                toast.info("Please login to manage wishlist");
                return;
              }
              toggleWishlist(user.id, product.id);
              trackEvent("wishlist_toggle", {
                productId: product.id,
                wishlisted: !wishlisted,
              });
            }}
            className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-surface-400 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-110 hover:text-red-500"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5 relative bg-white">
          <p className="text-[10px] font-bold tracking-widest text-surface-500 uppercase mb-1.5">{product.brand}</p>
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-surface-900 transition-colors duration-200 hover:text-brand-700 leading-snug"
            onClick={() => {
              trackProductView(product);
              trackEvent("product_click", {
                productId: product.id,
                source: "product_card_title",
              });
            }}
          >
            {product.title}
          </Link>

          <div className="mt-2 mb-3">
            <ProductRating rating={product.rating} reviewCount={product.reviewCount} compact />
          </div>

          <div className="mt-auto flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[17px] font-black tracking-tight text-surface-900">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs font-semibold text-surface-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            {pricingExperiment.isVariantB && (
              <p className="mt-1 text-[11px] font-medium text-surface-500">
                Or <span className="text-brand-700">{formatCurrency(Math.round(product.price / 30))}/mo</span>
              </p>
            )}
          </div>
        </div>
      </Card>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
