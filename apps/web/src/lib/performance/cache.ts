import { unstable_cache } from "next/cache";
import {
  getHomePageData,
  getProductBySlug,
  getSimilarProducts,
} from "@/lib/api/products-api";
import type { Product } from "@/types";

export const getCachedHomePageData = unstable_cache(
  async () => getHomePageData(),
  ["home-page-data"],
  {
    revalidate: 180,
    tags: ["home", "catalog"],
  },
);

export async function getCachedProductBySlug(slug: string) {
  const execute = unstable_cache(
    async () => getProductBySlug(slug),
    ["product-by-slug", slug],
    {
      revalidate: 120,
      tags: ["catalog", `product:${slug}`],
    },
  );

  return execute();
}

export async function getCachedSimilarProducts(product: Product, limit = 10) {
  const execute = unstable_cache(
    async () => getSimilarProducts(product, limit),
    ["similar-products", product.id, String(limit)],
    {
      revalidate: 120,
      tags: ["catalog", `similar:${product.id}`],
    },
  );

  return execute();
}
