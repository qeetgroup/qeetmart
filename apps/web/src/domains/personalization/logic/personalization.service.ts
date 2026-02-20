import {
  getTopCategoryAffinities,
  hasPersonalSignals,
  rankProductsWithPersonalization,
} from "@/lib/personalization/profile-engine";
import type { Product } from "@/types";
import { personalizationRepository } from "@/domains/personalization/data/personalization.repository";

export function getPersonalizationInsights() {
  const profile = personalizationRepository.readProfile();

  return {
    profile,
    hasSignals: hasPersonalSignals(profile),
    topCategories: getTopCategoryAffinities(profile),
  };
}

export function getPersonalizedCatalog(products: Product[], limit = 12) {
  const profile = personalizationRepository.readProfile();
  return rankProductsWithPersonalization(products, profile, {
    limit,
    blendTrendingWeight: 0.3,
  });
}
