import {
  getAllProducts,
  getProductBySlug,
  getProducts,
  getProductsByIds,
  getSimilarProducts,
} from "@/lib/api/products-api";
import type { Product, ProductListResponse, ProductQueryParams } from "@/types";

export const catalogRepository = {
  getAllProducts,
  getProductBySlug,
  getProducts,
  getProductsByIds,
  getSimilarProducts,
};

export async function listCatalog(
  params: ProductQueryParams,
): Promise<ProductListResponse> {
  return catalogRepository.getProducts(params);
}

export async function getCatalogProduct(slug: string): Promise<Product | null> {
  return catalogRepository.getProductBySlug(slug);
}
