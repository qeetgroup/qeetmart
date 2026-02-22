import type { Product } from "@/types";

export type StockPressureLevel = "critical" | "high" | "normal";

interface InventoryInsights {
  level: StockPressureLevel;
  urgencyLabel: string;
  urgencyPercent: number;
  predictedSellOutHours: number;
  restockSuggestion: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDemandIndex(product: Product) {
  const ratingWeight = product.rating / 5;
  const reviewWeight = clamp(product.reviewCount / 3000, 0, 1);
  const trendingWeight = product.isTrending ? 0.22 : 0;
  const featuredWeight = product.isFeatured ? 0.12 : 0;

  return clamp(ratingWeight * 0.45 + reviewWeight * 0.43 + trendingWeight + featuredWeight, 0.15, 1.35);
}

export function getPredictedSellOutHours(product: Product) {
  if (product.stock <= 0) {
    return 0;
  }

  const demandIndex = getDemandIndex(product);
  const estimatedDailySales = Math.max(1, Math.round(demandIndex * 22));
  const daysToSellOut = product.stock / estimatedDailySales;

  return Math.max(4, Math.round(daysToSellOut * 24));
}

export function getInventoryInsights(product: Product): InventoryInsights {
  const predictedSellOutHours = getPredictedSellOutHours(product);

  if (product.stock <= 5) {
    return {
      level: "critical",
      urgencyLabel: `Selling out in ~${predictedSellOutHours}h`,
      urgencyPercent: 92,
      predictedSellOutHours,
      restockSuggestion:
        "Reorder now. Current demand indicates stock-out risk within one day.",
    };
  }

  if (product.stock <= 16) {
    return {
      level: "high",
      urgencyLabel: `Likely sold out in ${Math.ceil(predictedSellOutHours / 24)} day(s)`,
      urgencyPercent: 70,
      predictedSellOutHours,
      restockSuggestion:
        "Plan restock in next 24-48 hours to maintain conversion velocity.",
    };
  }

  const urgencyPercent = clamp(Math.round((28 - Math.min(product.stock, 28)) * 2.8), 20, 55);

  return {
    level: "normal",
    urgencyLabel: "Healthy inventory",
    urgencyPercent,
    predictedSellOutHours,
    restockSuggestion:
      "Monitor demand trend weekly; no immediate restock action required.",
  };
}

export function getStockPressureCountdown(product: Product) {
  const insights = getInventoryInsights(product);
  if (insights.level === "normal") {
    return null;
  }

  const minutes = Math.max(30, Math.round(insights.predictedSellOutHours * 60));
  const seconds = minutes * 60;
  return {
    totalSeconds: seconds,
    label: insights.urgencyLabel,
  };
}
