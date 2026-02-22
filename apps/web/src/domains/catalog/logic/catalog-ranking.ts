import {
  getProductPersonalizationScore,
} from "@/lib/personalization/profile-engine";
import type { PersonalizationProfile, Product } from "@/types";

export function rankCatalogByPersonalRelevance(
  products: Product[],
  profile: PersonalizationProfile,
) {
  return [...products].sort((a, b) => {
    const aScore = getProductPersonalizationScore(a, profile).finalScore;
    const bScore = getProductPersonalizationScore(b, profile).finalScore;
    return bScore - aScore;
  });
}
