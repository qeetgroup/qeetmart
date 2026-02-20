import type { Category, Product } from "@/types";

export interface SearchDocument {
  product: Product;
  tokens: string[];
  popularityScore: number;
  conversionWeight: number;
}

export interface SearchIndex {
  documents: SearchDocument[];
  tokenMap: Map<string, Set<string>>;
  categoryTokenMap: Map<string, string>;
}

function normalize(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").trim();
}

export function tokenize(input: string) {
  return normalize(input)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function unique(tokens: string[]) {
  return Array.from(new Set(tokens));
}

function buildDocument(product: Product): SearchDocument {
  const tokens = unique([
    ...tokenize(product.title),
    ...tokenize(product.brand),
    ...product.tags.flatMap((tag) => tokenize(tag)),
    ...tokenize(product.description),
    ...tokenize(product.shortDescription),
  ]);

  const popularityScore = Math.min(
    (product.reviewCount / 2500) * 0.6 + (product.rating / 5) * 0.4,
    1,
  );

  const conversionWeight = Math.min(
    (product.isTrending ? 0.28 : 0.1) + (product.isFeatured ? 0.24 : 0.08) + product.rating / 10,
    1,
  );

  return {
    product,
    tokens,
    popularityScore,
    conversionWeight,
  };
}

export function buildSearchIndex(products: Product[], categories: Category[]): SearchIndex {
  const documents = products.map(buildDocument);
  const tokenMap = new Map<string, Set<string>>();

  for (const document of documents) {
    for (const token of document.tokens) {
      const set = tokenMap.get(token) ?? new Set<string>();
      set.add(document.product.id);
      tokenMap.set(token, set);
    }
  }

  const categoryTokenMap = new Map<string, string>();
  for (const category of categories) {
    const tokens = unique([
      ...tokenize(category.name),
      ...tokenize(category.slug.replace(/-/g, " ")),
    ]);

    for (const token of tokens) {
      categoryTokenMap.set(token, category.slug);
    }
  }

  return {
    documents,
    tokenMap,
    categoryTokenMap,
  };
}

declare global {
  var __QEETMART_SEARCH_INDEX__: SearchIndex | undefined;
}

export function getOrCreateSearchIndex(
  products: Product[],
  categories: Category[],
): SearchIndex {
  if (globalThis.__QEETMART_SEARCH_INDEX__) {
    return globalThis.__QEETMART_SEARCH_INDEX__;
  }

  const index = buildSearchIndex(products, categories);
  globalThis.__QEETMART_SEARCH_INDEX__ = index;
  return index;
}
