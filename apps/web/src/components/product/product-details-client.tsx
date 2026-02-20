"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Truck, ShieldCheck, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";
import { getDeliveryEstimate } from "@/lib/api/cart-api";
import {
  trackCartAddition,
  trackProductView,
} from "@/lib/personalization/profile-engine";
import { formatCurrency, getDiscountPercentage } from "@/lib/utils";
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
  const shareUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
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
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm text-surface-600">{product.brand}</p>
        <h1 className="text-2xl font-black tracking-tight text-surface-900 lg:text-3xl">
          {product.title}
        </h1>
        <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <p className="text-3xl font-black text-surface-900">{formatCurrency(product.price)}</p>
        <p className="text-sm text-surface-500 line-through">
          {formatCurrency(product.originalPrice)}
        </p>
        {discount > 0 ? <Badge variant="warning">Save {discount}%</Badge> : null}
      </div>
      {pricingExperiment.isVariantB ? (
        <p className="text-sm text-surface-600">
          Approx monthly ownership:
          {" "}
          <span className="font-semibold text-brand-700">
            {formatCurrency(Math.round(product.price / 12))}
          </span>
        </p>
      ) : null}

      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
      <StockUrgency product={product} />

      <p className="text-sm text-surface-700">{product.description}</p>

      <div className="space-y-4 rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="text-sm font-semibold tracking-wide text-surface-700 uppercase">Variants</h2>
        {product.variants.map((variant) => (
          <div key={variant.name} className="space-y-2">
            <p className="text-sm font-medium text-surface-800">{variant.name}</p>
            <div className="flex flex-wrap gap-2">
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
                    className={`rounded-md border px-3 py-1.5 text-sm transition ${
                      selected
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-surface-300 text-surface-700 hover:border-brand-300"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold tracking-wide text-surface-600 uppercase">
            Quantity
          </span>
          <Input
            type="number"
            min={1}
            max={Math.max(1, product.stock)}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
            className="w-24"
          />
        </label>
        <Button
          className="h-10"
          disabled={product.stock <= 0}
          onClick={addToCart}
        >
          Add to Cart
        </Button>
        <Button
          variant="secondary"
          className="h-10"
          disabled={product.stock <= 0}
          onClick={buyNow}
        >
          Buy Now
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-semibold tracking-wide text-surface-700 uppercase">
            Delivery estimate
          </h3>
          <div className="flex items-end gap-2">
            <Input
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value.replace(/[^\d]/g, "").slice(0, 6))}
              placeholder="Enter pincode"
              className="w-40"
            />
            <Button variant="outline" className="h-10">
              Check
            </Button>
          </div>
          {estimate ? (
            <p className="text-sm text-surface-700">
              Delivery between{" "}
              <span className="font-semibold text-surface-900">
                {new Date(estimate.earliestDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              {" "}
              and{" "}
              <span className="font-semibold text-surface-900">
                {new Date(estimate.latestDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              .
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-700">
          <ShieldCheck className="mb-1 h-4 w-4 text-brand-600" />
          Secure payment
        </div>
        <div className="rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-700">
          <RotateCcw className="mb-1 h-4 w-4 text-brand-600" />
          7-day return
        </div>
        <div className="rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-700">
          <Truck className="mb-1 h-4 w-4 text-brand-600" />
          Fast delivery
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-surface-200 bg-white p-4">
        <h3 className="text-sm font-semibold tracking-wide text-surface-700 uppercase">
          Product Highlights
        </h3>
        <ul className="space-y-2 text-sm text-surface-700">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-600" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-200 bg-white p-4">
        <p className="text-sm text-surface-700">Share this product</p>
        <ShareButtons title={product.title} url={shareUrl} />
      </div>

      <Link href="/products" className="text-sm font-medium text-brand-700 hover:text-brand-800">
        Continue browsing products
      </Link>
    </div>
  );
}
