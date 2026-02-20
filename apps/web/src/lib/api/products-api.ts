import { DEFAULT_PAGE_SIZE } from "@/lib/constants/store";
import { mockDb } from "@/lib/api/mock-db";
import { delay } from "@/lib/utils";
import type {
  HomePagePayload,
  Product,
  ProductListResponse,
  ProductQueryParams,
  SearchSuggestion,
} from "@/types";

function applyFilters(products: Product[], params: ProductQueryParams) {
  return products.filter((product) => {
    if (params.category && product.categorySlug !== params.category) {
      return false;
    }

    if (params.query) {
      const query = params.query.toLowerCase();
      const matches =
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query);
      if (!matches) {
        return false;
      }
    }

    if (typeof params.minPrice === "number" && product.price < params.minPrice) {
      return false;
    }

    if (typeof params.maxPrice === "number" && product.price > params.maxPrice) {
      return false;
    }

    if (typeof params.rating === "number" && product.rating < params.rating) {
      return false;
    }

    if (params.brands?.length && !params.brands.includes(product.brand)) {
      return false;
    }

    if (params.availability === "in-stock" && product.stock <= 0) {
      return false;
    }

    return true;
  });
}

function applySorting(products: Product[], sort = "newest") {
  const sorted = [...products];

  switch (sort) {
    case "price-asc": {
      sorted.sort((a, b) => a.price - b.price);
      break;
    }
    case "price-desc": {
      sorted.sort((a, b) => b.price - a.price);
      break;
    }
    case "rating": {
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    }
    case "newest":
    default: {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    }
  }

  return sorted;
}

export async function getProducts(
  params: ProductQueryParams,
): Promise<ProductListResponse> {
  await delay(320);

  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize =
    params.pageSize && params.pageSize > 0 ? params.pageSize : DEFAULT_PAGE_SIZE;

  const filtered = applyFilters(mockDb.products, params);
  const sorted = applySorting(filtered, params.sort);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const items = sorted.slice(startIndex, startIndex + pageSize);

  const prices = filtered.map((product) => product.price);

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
    availableBrands: Array.from(new Set(filtered.map((item) => item.brand))).sort(),
    minAvailablePrice: prices.length ? Math.min(...prices) : 0,
    maxAvailablePrice: prices.length ? Math.max(...prices) : 0,
  };
}

export async function getProductBySlug(slug: string) {
  await delay(220);
  return mockDb.products.find((product) => product.slug === slug) ?? null;
}

export async function getProductsByIds(productIds: string[]) {
  await delay(180);
  const idSet = new Set(productIds);
  return mockDb.products.filter((product) => idSet.has(product.id));
}

export async function getSimilarProducts(product: Product, limit = 8) {
  await delay(180);
  return mockDb.products
    .filter(
      (candidate) =>
        candidate.id !== product.id && candidate.categorySlug === product.categorySlug,
    )
    .slice(0, limit);
}

export async function getHomePageData(userId?: string): Promise<HomePagePayload> {
  await delay(260);

  const featuredProducts = mockDb.products.filter((product) => product.isFeatured).slice(0, 12);
  const trendingProducts = mockDb.products.filter((product) => product.isTrending).slice(0, 10);

  const personalizedSource = userId
    ? mockDb.products.filter((product) => Number(product.id.split("_")[1]) % 2 === 0)
    : mockDb.products;

  const recommendedProducts = personalizedSource
    .filter((product) => product.stock > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  const heroProducts = mockDb.products
    .filter((product) => product.stock > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 3);

  return {
    heroProducts,
    featuredProducts,
    trendingProducts,
    recommendedProducts,
  };
}

export async function searchProducts(query: string, limit = 8): Promise<SearchSuggestion[]> {
  await delay(180);

  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return mockDb.products
    .filter((product) => {
      return (
        product.title.toLowerCase().includes(normalized) ||
        product.brand.toLowerCase().includes(normalized) ||
        product.tags.some((tag) => tag.toLowerCase().includes(normalized))
      );
    })
    .slice(0, limit)
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      thumbnail: product.images[0],
      price: product.price,
    }));
}

export async function getFeaturedProducts(limit = 8) {
  await delay(180);
  return mockDb.products.filter((product) => product.isFeatured).slice(0, limit);
}
