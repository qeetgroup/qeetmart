"use client";

import { useEffect, useMemo } from "react";
import {
  getExperimentVariant,
  trackExperimentExposure,
  isExperimentEnabled,
} from "@/lib/experiments/experiment-engine";

export function useExperiment(experimentId: string) {
  const variant = useMemo(() => getExperimentVariant(experimentId), [experimentId]);
  const enabled = isExperimentEnabled(experimentId);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    trackExperimentExposure(experimentId, variant);
  }, [enabled, experimentId, variant]);

  return {
    enabled,
    variant,
    isVariantA: variant === "A",
    isVariantB: variant === "B",
  };
}
