import type {
  PersonalizationProfile,
  Product,
  ProductScoreBreakdown,
} from "@/types";

const PROFILE_STORAGE_KEY = "qeetmart-personalization-profile";
const PROFILE_UPDATE_EVENT = "qeetmart:profile-updated";
const MAX_VIEWED_PRODUCTS = 80;

const defaultProfile: PersonalizationProfile = {
  viewedProductIds: [],
  categoryAffinity: {},
  brandAffinity: {},
  cartAddCounts: {},
  lastInteractedAt: null,
  totalInteractions: 0,
};

function isBrowser() {
  return typeof window !== "undefined";
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function emitProfileUpdate() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(PROFILE_UPDATE_EVENT));
}

export function getProfileUpdateEventName() {
  return PROFILE_UPDATE_EVENT;
}

export function getDefaultPersonalizationProfile(): PersonalizationProfile {
  return {
    ...defaultProfile,
    viewedProductIds: [],
    categoryAffinity: {},
    brandAffinity: {},
    cartAddCounts: {},
  };
}

export function readPersonalizationProfile(): PersonalizationProfile {
  if (!isBrowser()) {
    return getDefaultPersonalizationProfile();
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return getDefaultPersonalizationProfile();
    }

    const parsed = JSON.parse(raw) as Partial<PersonalizationProfile>;

    return {
      viewedProductIds: Array.isArray(parsed.viewedProductIds)
        ? parsed.viewedProductIds.slice(0, MAX_VIEWED_PRODUCTS)
        : [],
      categoryAffinity: parsed.categoryAffinity ?? {},
      brandAffinity: parsed.brandAffinity ?? {},
      cartAddCounts: parsed.cartAddCounts ?? {},
      lastInteractedAt: parsed.lastInteractedAt ?? null,
      totalInteractions:
        typeof parsed.totalInteractions === "number"
          ? parsed.totalInteractions
          : 0,
    };
  } catch {
    return getDefaultPersonalizationProfile();
  }
}

export function writePersonalizationProfile(profile: PersonalizationProfile) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  emitProfileUpdate();
}

function pushViewedProduct(viewedProductIds: string[], productId: string) {
  const withoutDuplicate = viewedProductIds.filter((id) => id !== productId);
  return [productId, ...withoutDuplicate].slice(0, MAX_VIEWED_PRODUCTS);
}

function applyAffinity(
  affinity: Record<string, number>,
  key: string,
  increment: number,
) {
  const next = { ...affinity };
  const previous = next[key] ?? 0;
  next[key] = round(previous + increment);
  return next;
}

function incrementCounter(
  counter: Record<string, number>,
  key: string,
  amount: number,
) {
  const next = { ...counter };
  const previous = next[key] ?? 0;
  next[key] = previous + amount;
  return next;
}

function updateProfile(
  updater: (profile: PersonalizationProfile) => PersonalizationProfile,
) {
  const current = readPersonalizationProfile();
  const next = updater(current);
  writePersonalizationProfile(next);
}

export function trackCategoryBrowse(categorySlug: string) {
  updateProfile((profile) => ({
    ...profile,
    categoryAffinity: applyAffinity(profile.categoryAffinity, categorySlug, 1),
    lastInteractedAt: new Date().toISOString(),
    totalInteractions: profile.totalInteractions + 1,
  }));
}

export function trackProductView(product: Product) {
  updateProfile((profile) => ({
    ...profile,
    viewedProductIds: pushViewedProduct(profile.viewedProductIds, product.id),
    categoryAffinity: applyAffinity(
      profile.categoryAffinity,
      product.categorySlug,
      0.75,
    ),
    brandAffinity: applyAffinity(profile.brandAffinity, product.brand, 0.6),
    lastInteractedAt: new Date().toISOString(),
    totalInteractions: profile.totalInteractions + 1,
  }));
}

export function trackCartAddition(product: Product, quantity = 1) {
  updateProfile((profile) => ({
    ...profile,
    viewedProductIds: pushViewedProduct(profile.viewedProductIds, product.id),
    cartAddCounts: incrementCounter(profile.cartAddCounts, product.id, quantity),
    categoryAffinity: applyAffinity(
      profile.categoryAffinity,
      product.categorySlug,
      1.25,
    ),
    brandAffinity: applyAffinity(profile.brandAffinity, product.brand, 1),
    lastInteractedAt: new Date().toISOString(),
    totalInteractions: profile.totalInteractions + 2,
  }));
}

export function getRecentlyViewedProductIds(limit = 12) {
  return readPersonalizationProfile().viewedProductIds.slice(0, limit);
}

export function getTopCategoryAffinities(profile: PersonalizationProfile, limit = 5) {
  return Object.entries(profile.categoryAffinity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([categorySlug, score]) => ({ categorySlug, score }));
}

function normalizeMapScore(
  map: Record<string, number>,
  key: string,
  denominatorFallback: number,
) {
  const values = Object.values(map);
  const max = values.length > 0 ? Math.max(...values) : denominatorFallback;
  if (max <= 0) {
    return 0;
  }
  return clamp((map[key] ?? 0) / max, 0, 1);
}

export function getProductPersonalizationScore(
  product: Product,
  profile: PersonalizationProfile,
): ProductScoreBreakdown {
  const categoryScore = normalizeMapScore(
    profile.categoryAffinity,
    product.categorySlug,
    1,
  );
  const brandScore = normalizeMapScore(profile.brandAffinity, product.brand, 1);
  const cartScore = normalizeMapScore(profile.cartAddCounts, product.id, 1);

  const affinityScore = clamp(
    categoryScore * 0.55 + brandScore * 0.3 + cartScore * 0.15,
    0,
    1,
  );

  const popularityScore = clamp(product.reviewCount / 3000, 0, 1);
  const trendingFlagBoost = product.isTrending ? 1 : 0;
  const ratingScore = clamp(product.rating / 5, 0, 1);
  const trendingScore = clamp(
    popularityScore * 0.4 + ratingScore * 0.35 + trendingFlagBoost * 0.25,
    0,
    1,
  );

  const ageInDays =
    (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = clamp(1 - ageInDays / 365, 0, 1);

  const viewedPenalty = profile.viewedProductIds.slice(0, 4).includes(product.id)
    ? 0.12
    : 0;

  const finalScore = clamp(
    affinityScore * 0.5 + trendingScore * 0.35 + recencyScore * 0.15 - viewedPenalty,
    0,
    1,
  );

  return {
    finalScore: round(finalScore),
    affinityScore: round(affinityScore),
    trendingScore: round(trendingScore),
    recencyScore: round(recencyScore),
  };
}

interface RankingOptions {
  excludeProductIds?: string[];
  limit?: number;
  blendTrendingWeight?: number;
}

export function rankProductsWithPersonalization(
  products: Product[],
  profile: PersonalizationProfile,
  options: RankingOptions = {},
) {
  const excludeSet = new Set(options.excludeProductIds ?? []);
  const blendTrendingWeight = clamp(options.blendTrendingWeight ?? 0.28, 0, 1);

  const ranked = products
    .filter((product) => !excludeSet.has(product.id) && product.stock > 0)
    .map((product) => {
      const score = getProductPersonalizationScore(product, profile);
      const blendedScore = round(
        score.finalScore * (1 - blendTrendingWeight) +
          score.trendingScore * blendTrendingWeight,
      );

      return {
        product,
        score,
        blendedScore,
      };
    })
    .sort((a, b) => b.blendedScore - a.blendedScore)
    .map((entry) => entry.product);

  if (options.limit) {
    return ranked.slice(0, options.limit);
  }

  return ranked;
}

export function hasPersonalSignals(profile: PersonalizationProfile) {
  return profile.totalInteractions >= 3;
}
