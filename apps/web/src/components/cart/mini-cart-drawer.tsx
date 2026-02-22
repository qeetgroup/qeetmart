"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Trash2 } from "lucide-react";
import { getProductsByIds } from "@/lib/api/products-api";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";
import { getCartCount, useCartStore } from "@/store/cart-store";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MiniCartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MiniCartDrawer({ open, onClose }: MiniCartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);

  const productIds = useMemo(() => items.map((item) => item.productId), [items]);

  const { data: products = [] } = useQuery({
    queryKey: queryKeys.cartProducts(productIds),
    queryFn: () => getProductsByIds(productIds),
    enabled: productIds.length > 0,
  });

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const subtotal = items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      return sum;
    }
    return sum + product.price * item.quantity;
  }, 0);

  return (
    <Drawer open={open} onClose={onClose} title="Your Cart">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 h-full min-h-[400px]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
            <ShoppingCart className="h-8 w-8 text-surface-400" />
          </div>
          <p className="text-lg font-medium text-surface-700 dark:text-surface-300">Your cart is empty</p>
          <Button asChild className="w-full max-w-[200px] mt-4 rounded-full" size="lg">
            <Link href="/products" onClick={onClose}>
              Start Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <ul className="space-y-6">
              {items.map((item) => {
                const product = productMap.get(item.productId);
                if (!product) {
                  return null;
                }

                return (
                  <li key={product.id} className="flex group relative bg-white dark:bg-surface-950 p-2 rounded-xl transition-all hover:shadow-sm ring-1 ring-surface-200 dark:ring-surface-800">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-surface-100 dark:border-surface-800 bg-surface-50">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col justify-between py-1">
                      <div className="flex justify-between">
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-medium text-surface-900 dark:text-white line-clamp-2 hover:text-brand-600 transition-colors mr-4"
                          onClick={onClose}
                        >
                          {product.title}
                        </Link>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-50 text-surface-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-surface-800 dark:hover:bg-red-900/20"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Remove ${product.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <p className="text-sm text-surface-500 dark:text-surface-400">Qty: {item.quantity}</p>
                        <p className="font-semibold text-surface-900 dark:text-white">
                          {formatCurrency(product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-surface-200 bg-surface-50 px-4 py-6 sm:px-6 dark:border-surface-800 dark:bg-surface-900">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-medium text-surface-900 dark:text-surface-100">Subtotal</span>
              <span className="text-xl font-bold text-surface-900 dark:text-white">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-sm text-surface-500 mb-6 dark:text-surface-400">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="grid gap-3">
              <Button size="lg" className="w-full rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all hover:shadow-lg" asChild>
                <Link href="/checkout" onClick={onClose}>
                  Proceed to Checkout
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full rounded-full border-surface-300 dark:border-surface-700 bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" asChild>
                <Link href="/cart" onClick={onClose}>
                  View Cart ({getCartCount(items)})
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
