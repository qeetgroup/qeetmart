import { nanoid } from "nanoid";
import { trackEvent } from "@/lib/analytics/tracker";
import type {
  ExperimentAssignment,
  ExperimentDefinition,
  ExperimentVariant,
} from "@/types";

const EXPERIMENT_ASSIGNMENTS_KEY = "qeetmart-experiment-assignments";
const EXPERIMENT_EXPOSURES_KEY = "qeetmart-experiment-exposures";
const VISITOR_ID_KEY = "qeetmart-visitor-id";

const experiments: Record<string, ExperimentDefinition> = {
  home_hero_layout: {
    id: "home_hero_layout",
    enabled: true,
    variants: [
      { name: "A", weight: 0.5 },
      { name: "B", weight: 0.5 },
    ],
  },
  pricing_presentation: {
    id: "pricing_presentation",
    enabled: true,
    variants: [
      { name: "A", weight: 0.45 },
      { name: "B", weight: 0.55 },
    ],
  },
  cta_color: {
    id: "cta_color",
    enabled: true,
    variants: [
      { name: "A", weight: 0.5 },
      { name: "B", weight: 0.5 },
    ],
  },
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getVisitorId() {
  if (!isBrowser()) {
    return "server";
  }

  const existing = window.localStorage.getItem(VISITOR_ID_KEY);
  if (existing) {
    return existing;
  }

  const next = `visitor_${nanoid(12)}`;
  window.localStorage.setItem(VISITOR_ID_KEY, next);
  return next;
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function pickVariant(definition: ExperimentDefinition, seed: string): ExperimentVariant {
  const random = hashString(seed);
  let cursor = 0;

  for (const variant of definition.variants) {
    cursor += variant.weight;
    if (random <= cursor) {
      return variant.name;
    }
  }

  return definition.variants[definition.variants.length - 1]?.name ?? "A";
}

function readAssignments() {
  return readStorage<Record<string, ExperimentAssignment>>(EXPERIMENT_ASSIGNMENTS_KEY, {});
}

function writeAssignments(assignments: Record<string, ExperimentAssignment>) {
  writeStorage(EXPERIMENT_ASSIGNMENTS_KEY, assignments);
}

function readExposures() {
  return readStorage<Record<string, boolean>>(EXPERIMENT_EXPOSURES_KEY, {});
}

function writeExposures(exposures: Record<string, boolean>) {
  writeStorage(EXPERIMENT_EXPOSURES_KEY, exposures);
}

export function getExperimentDefinition(experimentId: string) {
  return experiments[experimentId] ?? null;
}

export function getExperimentVariant(experimentId: string): ExperimentVariant {
  const definition = getExperimentDefinition(experimentId);

  if (!definition || !definition.enabled) {
    return "A";
  }

  const assignments = readAssignments();
  const assigned = assignments[experimentId];
  if (assigned) {
    return assigned.variant;
  }

  const visitorId = getVisitorId();
  const variant = pickVariant(definition, `${experimentId}:${visitorId}`);

  assignments[experimentId] = {
    experimentId,
    variant,
    exposedAt: new Date().toISOString(),
  };
  writeAssignments(assignments);

  return variant;
}

export function trackExperimentExposure(experimentId: string, variant: ExperimentVariant) {
  const key = `${experimentId}:${variant}`;
  const exposures = readExposures();
  if (exposures[key]) {
    return;
  }

  exposures[key] = true;
  writeExposures(exposures);

  trackEvent("experiment_exposure", {
    experimentId,
    variant,
  });
}

export function getAllExperimentAssignments() {
  return readAssignments();
}

export function isExperimentEnabled(experimentId: string) {
  const definition = getExperimentDefinition(experimentId);
  return Boolean(definition?.enabled);
}
