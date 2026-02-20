import { analyticsRepository } from "@/domains/analytics/data/analytics.repository";

export function getCommerceAnalyticsSummary() {
  const metrics = analyticsRepository.getMetrics();

  return {
    conversionRate: metrics.funnel.checkoutConversionRate,
    dropOffRate: metrics.funnel.checkoutDropOffRate,
    pageViews: metrics.totals.pageViews,
    addToCartEvents: metrics.totals.addToCart,
  };
}
