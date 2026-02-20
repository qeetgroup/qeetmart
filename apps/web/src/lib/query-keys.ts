import type { ProductQueryParams } from "@/types";

export const queryKeys = {
  categories: ["categories"] as const,
  products: (filters: ProductQueryParams) => ["products", filters] as const,
  product: (slug: string) => ["product", slug] as const,
  similarProducts: (slug: string) => ["similar-products", slug] as const,
  home: (userId?: string) => ["home", userId ?? "guest"] as const,
  search: (query: string) => ["search", query] as const,
  reviews: (productId: string) => ["reviews", productId] as const,
  ratingBreakdown: (productId: string) => ["rating-breakdown", productId] as const,
  cartProducts: (productIds: string[]) => ["cart-products", productIds] as const,
  orders: (userId: string) => ["orders", userId] as const,
  order: (orderId: string) => ["order", orderId] as const,
};
