import {
  getProductPersonalizationScore,
  readPersonalizationProfile,
} from "@/lib/personalization/profile-engine";
import { tokenize, type SearchIndex } from "@/lib/search/search-index";
import type { SearchOptions, SearchSuggestion } from "@/types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function levenshteinDistance(a: string, b: string) {
  if (a === b) {
    return 0;
  }

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0),
  );

  for (let row = 0; row <= a.length; row += 1) {
    matrix[row][0] = row;
  }

  for (let col = 0; col <= b.length; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row <= a.length; row += 1) {
    for (let col = 1; col <= b.length; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function tokenSimilarity(queryToken: string, candidateToken: string) {
  if (queryToken === candidateToken) {
    return 1;
  }

  if (candidateToken.startsWith(queryToken) || queryToken.startsWith(candidateToken)) {
    return 0.9;
  }

  if (candidateToken.includes(queryToken)) {
    return 0.82;
  }

  const distance = levenshteinDistance(queryToken, candidateToken);
  if (distance === 1) {
    return 0.72;
  }

  if (distance === 2 && queryToken.length >= 6) {
    return 0.61;
  }

  return 0;
}

function inferCategoryFromTokens(queryTokens: string[], index: SearchIndex) {
  for (const token of queryTokens) {
    const categorySlug = index.categoryTokenMap.get(token);
    if (categorySlug) {
      return categorySlug;
    }
  }

  return null;
}

interface ScoreEntry {
  textScore: number;
  matchedTokens: Set<string>;
}

export function searchWithIndex(
  query: string,
  index: SearchIndex,
  options: SearchOptions = {},
): SearchSuggestion[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return [];
  }

  const inferredCategory = inferCategoryFromTokens(queryTokens, index);
  const targetCategory = options.category ?? inferredCategory;

  const productScores = new Map<string, ScoreEntry>();
  const indexTokens = Array.from(index.tokenMap.keys());

  queryTokens.forEach((queryToken, tokenIndex) => {
    const tokenWeight = 1 / (tokenIndex + 1);

    for (const indexToken of indexTokens) {
      const similarity = tokenSimilarity(queryToken, indexToken);
      if (similarity < 0.6) {
        continue;
      }

      const productIds = index.tokenMap.get(indexToken);
      if (!productIds) {
        continue;
      }

      for (const productId of productIds) {
        const current = productScores.get(productId) ?? {
          textScore: 0,
          matchedTokens: new Set<string>(),
        };

        current.textScore += similarity * tokenWeight;
        current.matchedTokens.add(indexToken);

        productScores.set(productId, current);
      }
    }
  });

  if (productScores.size === 0) {
    return [];
  }

  const profile = options.personalizationProfile ?? readPersonalizationProfile();

  const suggestions = index.documents
    .map((document) => {
      const scoreEntry = productScores.get(document.product.id);
      if (!scoreEntry) {
        return null;
      }

      if (targetCategory && document.product.categorySlug !== targetCategory) {
        return null;
      }

      const textScore = clamp(scoreEntry.textScore / queryTokens.length, 0, 1.25);
      const personalScore = getProductPersonalizationScore(
        document.product,
        profile,
      ).finalScore;
      const categoryBoost = targetCategory ? 0.08 : 0;

      const finalScore =
        textScore * 0.45 +
        document.popularityScore * 0.2 +
        document.conversionWeight * 0.2 +
        personalScore * 0.15 +
        categoryBoost;

      return {
        id: document.product.id,
        slug: document.product.slug,
        title: document.product.title,
        thumbnail: document.product.images[0],
        price: document.product.price,
        categorySlug: document.product.categorySlug,
        matchedTokens: Array.from(scoreEntry.matchedTokens),
        reason:
          personalScore > 0.55
            ? "High personal relevance"
            : document.popularityScore > 0.65
              ? "Popular choice"
              : "Best text match",
        score: Number(finalScore.toFixed(4)),
      } satisfies SearchSuggestion;
    })
    .filter((item): item is SearchSuggestion => Boolean(item))
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit ?? 8);

  return suggestions;
}
