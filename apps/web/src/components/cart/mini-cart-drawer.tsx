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
        <div className="space-y-3 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 text-center">
          <ShoppingCart className="mx-auto h-8 w-8 text-surface-500" />
          <p className="text-sm text-surface-700">Your cart is empty.</p>
          <Button asChild className="w-full">
            <Link href="/products" onClick={onClose}>
              Browse Products
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3">
            {items.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) {
                return null;
              }

              return (
                <li key={product.id} className="flex gap-3 rounded-lg border border-surface-200 p-3">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    width={64}
                    height={64}
                    className="rounded-md border border-surface-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-2 text-sm font-medium text-surface-900 hover:text-brand-700"
                      onClick={onClose}
                    >
                      {product.title}
                    </Link>
                    <p className="mt-1 text-xs text-surface-600">Qty: {item.quantity}</p>
                    <p className="mt-1 text-sm font-semibold text-brand-700">
                      {formatCurrency(product.price * item.quantity)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="self-start rounded-md p-1 text-surface-500 hover:bg-surface-100 hover:text-red-600"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${product.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-700">Items ({getCartCount(items)})</span>
            <span className="text-base font-semibold text-surface-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild>
              <Link href="/cart" onClick={onClose}>
                View Cart
              </Link>
            </Button>
            <Button asChild>
              <Link href="/checkout" onClick={onClose}>
                Checkout
              </Link>
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
