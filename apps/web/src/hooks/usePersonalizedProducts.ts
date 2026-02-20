"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api/products-api";
import { queryKeys } from "@/lib/query-keys";
import {
  getProfileUpdateEventName,
  getTopCategoryAffinities,
  hasPersonalSignals,
  rankProductsWithPersonalization,
  readPersonalizationProfile,
} from "@/lib/personalization/profile-engine";
import type { PersonalizationProfile, Product } from "@/types";

interface UsePersonalizedProductsOptions {
  sourceProducts?: Product[];
  limit?: number;
  excludeProductIds?: string[];
  enabled?: boolean;
}

export function usePersonalizedProducts({
  sourceProducts,
  limit = 10,
  excludeProductIds,
  enabled = true,
}: UsePersonalizedProductsOptions = {}) {
  const [profile, setProfile] = useState<PersonalizationProfile>(() =>
    readPersonalizationProfile(),
  );

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfile(readPersonalizationProfile());
    };

    const updateEvent = getProfileUpdateEventName();
    window.addEventListener(updateEvent, handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);

    return () => {
      window.removeEventListener(updateEvent, handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  const shouldFetchCatalog = !sourceProducts && enabled;

  const { data: allProducts = [] } = useQuery({
    queryKey: queryKeys.products({ page: 1, pageSize: 200, sort: "newest" }),
    queryFn: async () => {
      const response = await getProducts({ page: 1, pageSize: 200, sort: "newest" });
      return response.items;
    },
    enabled: shouldFetchCatalog,
    staleTime: 3 * 60 * 1000,
  });

  const baseProducts = sourceProducts ?? allProducts;

  const personalizedProducts = useMemo(() => {
    if (!enabled) {
      return baseProducts.slice(0, limit);
    }

    const ranked = rankProductsWithPersonalization(baseProducts, profile, {
      limit,
      excludeProductIds,
      blendTrendingWeight: 0.3,
    });

    return ranked;
  }, [baseProducts, enabled, excludeProductIds, limit, profile]);

  const topCategories = useMemo(
    () => getTopCategoryAffinities(profile, 3),
    [profile],
  );

  return {
    profile,
    personalizedProducts,
    topCategories,
    hasSignals: hasPersonalSignals(profile),
  };
}
