"use client";

import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { trackCartAddition } from "@/lib/personalization/profile-engine";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { usePersonalizedProducts } from "@/hooks/usePersonalizedProducts";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CartUpsellProps {
  cartProductIds: string[];
}

export function CartUpsell({ cartProductIds }: CartUpsellProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { trackEvent } = useTrackEvent();

  const { personalizedProducts } = usePersonalizedProducts({
    limit: 4,
    excludeProductIds: cartProductIds,
  });

  const upsellProducts = useMemo(
    () => personalizedProducts.filter((product) => !cartProductIds.includes(product.id)).slice(0, 4),
    [cartProductIds, personalizedProducts],
  );

  if (upsellProducts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Smart Upsell Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upsellProducts.map((product) => (
          <div key={product.id} className="grid grid-cols-[1fr,auto] gap-2 rounded-lg border border-surface-200 p-2">
            <div>
              <Link
                href={`/products/${product.slug}`}
                className="line-clamp-1 text-sm font-semibold text-surface-900 hover:text-brand-700"
              >
                {product.title}
              </Link>
              <p className="text-xs text-surface-600">{product.brand}</p>
              <p className="text-sm font-semibold text-brand-700">{formatCurrency(product.price)}</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                addItem({ productId: product.id, quantity: 1 });
                trackCartAddition(product, 1);
                trackEvent("add_to_cart", {
                  productId: product.id,
                  quantity: 1,
                  source: "cart_upsell",
                });
                toast.success("Upsell item added");
              }}
            >
              Add
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
