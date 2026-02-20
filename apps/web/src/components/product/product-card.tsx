"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Heart, ShoppingCart } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductRating } from "@/components/product/product-rating";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
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

  return (
    <Card
      className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: queryKeys.product(product.slug),
          queryFn: () => getProductBySlug(product.slug),
        });
      }}
    >
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="block bg-surface-50"
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
            width={480}
            height={480}
            priority={priority}
            className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {product.stock <= 0 ? <Badge variant="destructive">Out of stock</Badge> : null}
          {product.isNew ? <Badge variant="secondary">New</Badge> : null}
          {discount > 0 ? <Badge variant="warning">{discount}% OFF</Badge> : null}
          {inventoryInsights.level === "critical" ? (
            <Badge variant="destructive">Selling Fast</Badge>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Toggle wishlist"
          onClick={() => {
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
          className="absolute top-2 right-2 rounded-full bg-white/90 p-2 text-surface-700 shadow hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>
      </div>

      <div className="space-y-2 p-4">
        <p className="text-xs text-surface-500">{product.brand}</p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-11 text-sm font-semibold text-surface-900 hover:text-brand-700"
          onClick={() => {
            trackProductView(product);
            trackEvent("product_click", {
              productId: product.id,
              source: "product_card",
            });
          }}
        >
          {product.title}
        </Link>
        <ProductRating rating={product.rating} reviewCount={product.reviewCount} compact />

        <div className="flex items-end gap-2">
          <span className="text-base font-bold text-surface-900">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice > product.price ? (
            <span className="text-xs text-surface-500 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          ) : null}
        </div>
        {pricingExperiment.isVariantB ? (
          <p className="text-xs text-surface-500">
            Effective daily cost:
            {" "}
            <span className="font-semibold text-brand-700">
              {formatCurrency(Math.round(product.price / 30))}
            </span>
          </p>
        ) : null}

        <Button
          className="mt-1 w-full"
          disabled={product.stock <= 0}
          onClick={() => {
            addItem({ productId: product.id, quantity: 1 });
            trackCartAddition(product, 1);
            trackEvent("add_to_cart", {
              productId: product.id,
              source: "product_card",
              quantity: 1,
            });
            toast.success("Added to cart");
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
