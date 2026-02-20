"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  calculateSubtotal,
  getShippingCost,
  validateCoupon,
} from "@/lib/api/cart-api";
import { getProductsByIds } from "@/lib/api/products-api";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants/store";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/empty-state";

export function CartPage() {
  const [couponInput, setCouponInput] = useState("");

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const couponCode = useCartStore((state) => state.couponCode);
  const setCoupon = useCartStore((state) => state.setCoupon);
  const clearCoupon = useCartStore((state) => state.clearCoupon);

  const productIds = useMemo(() => items.map((item) => item.productId), [items]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.cartProducts(productIds),
    queryFn: () => getProductsByIds(productIds),
    enabled: productIds.length > 0,
  });

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const subtotal = calculateSubtotal(items, products);

  const couponMutation = useMutation({
    mutationFn: (code: string) => validateCoupon(code, subtotal),
    onSuccess: (result) => {
      if (result.valid) {
        setCoupon(result.code);
        toast.success(result.message);
      } else {
        clearCoupon();
        toast.error(result.message);
      }
    },
  });

  const couponDiscount = couponMutation.data?.valid ? couponMutation.data.discountAmount : 0;
  const shipping = getShippingCost(subtotal - couponDiscount);
  const tax = Math.round((subtotal - couponDiscount) * 0.12);
  const total = Math.max(subtotal - couponDiscount + shipping + tax, 0);

  const freeShippingProgress =
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? 100
      : Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (!isLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Your cart is empty"
          description="Add products to cart and come back to checkout quickly."
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[1fr,360px]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-black tracking-tight text-surface-900">Shopping Cart</h1>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const product = productMap.get(item.productId);
            if (!product) {
              return null;
            }

            return (
              <Card key={`${item.productId}-${JSON.stringify(item.variantSelections ?? {})}`} className="transition-all duration-300">
                <CardContent className="grid gap-4 p-4 sm:grid-cols-[100px,1fr,auto] sm:items-center">
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      width={100}
                      height={100}
                      className="aspect-square rounded-lg border border-surface-200 object-cover"
                    />
                  </Link>
                  <div className="space-y-1">
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-2 text-sm font-semibold text-surface-900 hover:text-brand-700"
                    >
                      {product.title}
                    </Link>
                    <p className="text-xs text-surface-600">{product.brand}</p>
                    <p className="text-sm font-semibold text-surface-900">
                      {formatCurrency(product.price)}
                    </p>
                    {item.variantSelections ? (
                      <div className="flex flex-wrap gap-1 text-xs text-surface-600">
                        {Object.entries(item.variantSelections).map(([name, value]) => (
                          <span
                            key={`${name}-${value}`}
                            className="rounded-full border border-surface-200 px-2 py-0.5"
                          >
                            {name}: {value}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-3 sm:text-right">
                    <div className="inline-flex items-center rounded-md border border-surface-300">
                      <button
                        type="button"
                        className="p-2 text-surface-700 hover:bg-surface-100"
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 px-2 text-center text-sm font-medium text-surface-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="p-2 text-surface-700 hover:bg-surface-100"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-brand-700">
                      {formatCurrency(product.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-surface-700">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-surface-700">
                <span>Discount</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
              <div className="flex items-center justify-between text-surface-700">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
              </div>
              <div className="flex items-center justify-between text-surface-700">
                <span>Tax (12%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-base font-bold text-surface-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div className="space-y-2 rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className="text-xs font-semibold tracking-wide text-surface-600 uppercase">
                Free shipping progress
              </p>
              <Progress value={freeShippingProgress} />
              <p className="text-xs text-surface-600">
                {subtotal >= FREE_SHIPPING_THRESHOLD
                  ? "You unlocked free shipping."
                  : `Add ${formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.`}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide text-surface-600 uppercase">
                Coupon code
              </label>
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="SAVE10"
                />
                <Button
                  variant="outline"
                  onClick={() => couponMutation.mutate(couponInput)}
                  disabled={couponMutation.isPending || !couponInput.trim()}
                >
                  Apply
                </Button>
              </div>
              {couponCode ? (
                <p className="text-xs text-emerald-700">Applied coupon: {couponCode}</p>
              ) : null}
            </div>

            <Button asChild className="w-full">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
