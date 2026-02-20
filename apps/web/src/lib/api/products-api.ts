import { DEFAULT_PAGE_SIZE } from "@/lib/constants/store";
import { mockDb } from "@/lib/api/mock-db";
import { delay } from "@/lib/utils";
import {
  rankProductsWithPersonalization,
  readPersonalizationProfile,
} from "@/lib/personalization/profile-engine";
import { getOrCreateSearchIndex } from "@/lib/search/search-index";
import { searchWithIndex } from "@/lib/search/search-engine";
import type {
  HomePagePayload,
  Product,
  ProductListResponse,
  ProductQueryParams,
  SearchOptions,
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

function applySorting(products: Product[], params: ProductQueryParams) {
  const sorted = [...products];

  switch (params.sort) {
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
    case "personalized": {
      const profile =
        params.personalizationProfile ?? readPersonalizationProfile();
      return rankProductsWithPersonalization(sorted, profile, {
        blendTrendingWeight: 0.32,
      });
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
  await delay(280);

  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize =
    params.pageSize && params.pageSize > 0 ? params.pageSize : DEFAULT_PAGE_SIZE;

  const filtered = applyFilters(mockDb.products, params);
  const sorted = applySorting(filtered, params);

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

export async function getAllProducts() {
  await delay(160);
  return mockDb.products;
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

export async function getCustomersAlsoBought(product: Product, limit = 6) {
  await delay(180);

  const candidates = mockDb.products
    .filter(
      (candidate) =>
        candidate.id !== product.id && candidate.stock > 0,
    )
    .map((candidate) => {
      const categoryBoost =
        candidate.categorySlug === product.categorySlug ? 0.5 : 0;
      const popularityBoost = Math.min(candidate.reviewCount / 3000, 1) * 0.35;
      const ratingBoost = (candidate.rating / 5) * 0.15;

      return {
        candidate,
        score: categoryBoost + popularityBoost + ratingBoost,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);

  return candidates;
}

export async function getHomePageData(userId?: string): Promise<HomePagePayload> {
  await delay(220);

  const featuredProducts = mockDb.products
    .filter((product) => product.isFeatured)
    .slice(0, 12);
  const trendingProducts = mockDb.products
    .filter((product) => product.isTrending)
    .slice(0, 10);

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

export async function getPersonalizedRecommendations(
  limit = 10,
  excludeProductIds: string[] = [],
) {
  await delay(180);

  const profile = readPersonalizationProfile();
  return rankProductsWithPersonalization(mockDb.products, profile, {
    limit,
    excludeProductIds,
    blendTrendingWeight: 0.3,
  });
}

export async function searchProducts(
  query: string,
  options: SearchOptions = {},
): Promise<SearchSuggestion[]> {
  await delay(140);

  const normalized = query.trim();
  if (!normalized) {
    return [];
  }

  const index = getOrCreateSearchIndex(mockDb.products, mockDb.categories);
  return searchWithIndex(normalized, index, {
    ...options,
    limit: options.limit ?? 8,
  });
}

export async function getFeaturedProducts(limit = 8) {
  await delay(180);
  return mockDb.products.filter((product) => product.isFeatured).slice(0, limit);
}
