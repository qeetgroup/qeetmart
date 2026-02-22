"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Truck, ShieldCheck, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";
import { getDeliveryEstimate } from "@/lib/api/cart-api";
import { trackCartAddition, trackProductView } from "@/lib/personalization/profile-engine";
import { formatCurrency, getDiscountPercentage, cn } from "@/lib/utils";
import { useExperiment } from "@/hooks/useExperiment";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { useCartStore } from "@/store/cart-store";
import { StockUrgency } from "@/components/inventory/stock-urgency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductRating } from "@/components/product/product-rating";
import { ShareButtons } from "@/components/product/share-buttons";
import type { Product } from "@/types";

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  const { trackEvent } = useTrackEvent();
  const pricingExperiment = useExperiment("pricing_presentation");
  const addItem = useCartStore((state) => state.addItem);
  const trackedViewRef = useRef(false);
  const [quantity, setQuantity] = useState(1);
  const [postalCode, setPostalCode] = useState("560001");

  const [variantSelections, setVariantSelections] = useState<Record<string, string>>(() => {
    return product.variants.reduce<Record<string, string>>((accumulator, variant) => {
      accumulator[variant.name] = variant.values[0] ?? "";
      return accumulator;
    }, {});
  });

  const { data: estimate } = useQuery({
    queryKey: ["delivery", postalCode],
    queryFn: () => getDeliveryEstimate(postalCode),
    enabled: postalCode.length === 6,
  });

  const discount = getDiscountPercentage(product.price, product.originalPrice);
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    }/products/${product.slug}`;

  const stockStatus = useMemo(() => {
    if (product.stock <= 0) {
      return {
        label: "Out of stock",
        variant: "destructive" as const,
      };
    }
    if (product.stock <= 10) {
      return {
        label: `Only ${product.stock} left`,
        variant: "warning" as const,
      };
    }
    return {
      label: "In stock",
      variant: "success" as const,
    };
  }, [product.stock]);

  useEffect(() => {
    if (trackedViewRef.current) {
      return;
    }

    trackProductView(product);
    trackEvent("product_view", {
      productId: product.id,
      category: product.categorySlug,
    });
    trackedViewRef.current = true;
  }, [product.categorySlug, product.id, trackEvent, product]);

  const addToCart = () => {
    addItem({
      productId: product.id,
      quantity,
      variantSelections,
    });

    trackCartAddition(product, quantity);
    trackEvent("add_to_cart", {
      productId: product.id,
      quantity,
      source: "product_detail",
    });
    toast.success("Added to cart");
  };

  const buyNow = () => {
    addToCart();
    trackEvent("checkout_step_view", {
      step: 1,
      source: "buy_now",
      productId: product.id,
    });
    router.push("/checkout");
  };

  return (
    <div className="space-y-8">
      {/* 1. Title & Rating */}
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-wider text-surface-500 uppercase">{product.brand}</p>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
          {product.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div className="cursor-pointer hover:underline">
            <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
          <span className="hidden text-sm text-surface-300 sm:inline">•</span>
          <span className="animate-pulse text-sm font-medium text-brand-600">
            Recently purchased: 14 times today
          </span>
        </div>
      </div>

      {/* 2. Price Section */}
      <div className="space-y-2">
        <div className="flex items-end gap-3">
          <p className="text-2xl font-black tracking-tight text-surface-900">{formatCurrency(product.price)}</p>
          {discount > 0 ? (
            <p className="mb-0.5 text-base font-medium text-surface-400 line-through">
              {formatCurrency(product.originalPrice)}
            </p>
          ) : null}
          {discount > 0 ? (
            <Badge variant="warning" className="mb-0.5 ml-1 font-bold uppercase tracking-wider">
              Save {discount}%
            </Badge>
          ) : null}
        </div>
        {pricingExperiment.isVariantB ? (
          <p className="text-sm font-medium text-surface-600">
            EMI starts at <span className="font-bold text-surface-900">{formatCurrency(Math.round(product.price / 12))}</span>/mo.
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", stockStatus.variant === "success" ? "bg-green-500" : stockStatus.variant === "warning" ? "bg-amber-500" : "bg-red-500")} />
          <span className={cn("text-sm font-medium", stockStatus.variant === "success" ? "text-green-700" : stockStatus.variant === "warning" ? "text-amber-700" : "text-red-700")}>
            {stockStatus.label}
          </span>
        </div>
      </div>

      {/* 4. Variants */}
      {product.variants.length > 0 && (
        <div className="space-y-5 rounded-2xl bg-surface-50 p-5 shadow-inner">
          {product.variants.map((variant) => (
            <div key={variant.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-surface-800 uppercase tracking-wide">Select {variant.name}</p>
                <span className="text-sm font-medium text-brand-600">
                  {variantSelections[variant.name]}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {variant.values.map((value) => {
                  const selected = variantSelections[variant.name] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setVariantSelections((previous) => ({
                          ...previous,
                          [variant.name]: value,
                        }))
                      }
                      className={cn(
                        "relative flex h-12 min-w-12 items-center justify-center rounded-xl border-2 px-4 text-sm font-semibold transition-all duration-200",
                        selected
                          ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100 ring-offset-1"
                          : "border-surface-200 bg-white text-surface-700 hover:border-surface-300 hover:bg-surface-50"
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Desktop Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider text-surface-500 uppercase">
              Qty
            </label>
            <div className="flex h-12 items-center rounded-xl border-2 border-surface-100 bg-surface-50 shadow-sm">
              <button
                type="button"
                className="flex h-full w-12 items-center justify-center text-lg text-surface-500 hover:text-brand-600 disabled:opacity-40 transition-colors"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={Math.max(1, product.stock)}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                className="h-full w-12 text-center text-base font-bold focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                className="flex h-full w-12 items-center justify-center text-lg text-surface-500 hover:text-brand-600 disabled:opacity-40 transition-colors"
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          <div className="hidden flex-1 items-end gap-3 md:flex h-[72px]">
            <Button
              className="h-12 flex-1 rounded-xl text-base font-bold shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5"
              disabled={product.stock <= 0}
              onClick={addToCart}
            >
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              className="h-12 flex-1 rounded-xl text-base font-bold shadow-md transition-all hover:-translate-y-0.5"
              disabled={product.stock <= 0}
              onClick={buyNow}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom border-t border-surface-200 bg-white/90 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] backdrop-blur-lg md:hidden">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-xl text-base font-bold border-surface-300"
            disabled={product.stock <= 0}
            onClick={addToCart}
          >
            Add to Cart
          </Button>
          <Button
            className="h-12 flex-1 rounded-xl text-base font-bold shadow-lg shadow-brand-500/30"
            disabled={product.stock <= 0}
            onClick={buyNow}
          >
            Buy Now
          </Button>
        </div>
      </div>

      {/* 6. Delivery & Trust */}
      <Card className="overflow-hidden rounded-2xl border-surface-200 shadow-sm">
        <CardContent className="divide-y divide-surface-100 p-0">
          <div className="p-5">
            <h3 className="mb-3 text-sm font-bold tracking-wider text-surface-800 uppercase">
              Free Delivery
            </h3>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-surface-600">Enter pincode for exact estimate</p>
                <div className="flex gap-2">
                  <Input
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                    placeholder="Enter pincode"
                    className="h-10 w-full sm:w-40 rounded-lg bg-surface-50 focus-visible:bg-white"
                  />
                  <Button variant="outline" className="h-10 rounded-lg">Check</Button>
                </div>
              </div>
              {estimate ? (
                <div className="rounded-lg bg-green-50 p-3 text-sm flex-1 border border-green-100">
                  Arrives{" "}
                  <span className="font-bold text-green-800">
                    {new Date(estimate.earliestDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  {" "}-{" "}
                  <span className="font-bold text-green-800">
                    {new Date(estimate.latestDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-surface-100 bg-surface-50 p-2">
            <div className="flex flex-col items-center justify-center p-3 text-center text-xs font-semibold text-surface-600">
              <ShieldCheck className="mb-2 h-6 w-6 text-brand-600" />
              Secure Checkout
            </div>
            <div className="flex flex-col items-center justify-center p-3 text-center text-xs font-semibold text-surface-600">
              <RotateCcw className="mb-2 h-6 w-6 text-brand-600" />
              Free Returns
            </div>
            <div className="flex flex-col items-center justify-center p-3 text-center text-xs font-semibold text-surface-600">
              <Truck className="mb-2 h-6 w-6 text-brand-600" />
              Fast Shipping
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-50 p-4">
        <p className="text-sm font-semibold text-surface-700">Share this item</p>
        <ShareButtons title={product.title} url={shareUrl} />
      </div>

    </div>
  );
}
