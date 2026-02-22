import {
  clearAnalyticsEvents,
  getAnalyticsEvents,
  getAnalyticsMetrics,
  trackEvent,
} from "@/lib/analytics/tracker";

export const analyticsRepository = {
  clearEvents: clearAnalyticsEvents,
  getEvents: getAnalyticsEvents,
  getMetrics: getAnalyticsMetrics,
  trackEvent,
};
