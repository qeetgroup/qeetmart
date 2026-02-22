"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProductsByIds } from "@/lib/api/products-api";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useSessionStore } from "@/store/session-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function WishlistPage() {
  const user = useSessionStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);

  const getWishlistByUser = useWishlistStore((state) => state.getWishlistByUser);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const productIds = useMemo(() => (user ? getWishlistByUser(user.id) : []), [getWishlistByUser, user]);

  const { data: products = [] } = useQuery({
    queryKey: queryKeys.cartProducts(productIds),
    queryFn: () => getProductsByIds(productIds),
    enabled: productIds.length > 0,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Login to view wishlist"
          description="Wishlist is personalized and tied to your account session."
          actionHref="/auth/login"
          actionLabel="Login"
        />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Wishlist is empty"
          description="Save products you like and buy them later."
          actionHref="/products"
          actionLabel="Discover Products"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-6">
      <h1 className="text-2xl font-black tracking-tight text-surface-900">My Wishlist</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="p-0">
              <Link href={`/products/${product.slug}`}>
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={500}
                  height={500}
                  className="aspect-square w-full rounded-t-xl object-cover"
                />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <Link
                href={`/products/${product.slug}`}
                className="line-clamp-2 text-sm font-semibold text-surface-900 hover:text-brand-700"
              >
                {product.title}
              </Link>
              <p className="text-base font-bold text-surface-900">{formatCurrency(product.price)}</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    addItem({ productId: product.id, quantity: 1 });
                    toast.success("Added to cart");
                  }}
                >
                  Add to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleWishlist(user.id, product.id)}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
