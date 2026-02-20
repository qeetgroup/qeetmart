import { nanoid } from "nanoid";
import type { AnalyticsEvent } from "@/types";

const ANALYTICS_STORAGE_KEY = "qeetmart-analytics-events";
const ANALYTICS_UPDATE_EVENT = "qeetmart:analytics-updated";
const MAX_EVENTS = 600;

type AnalyticsEventName =
  | "page_view"
  | "product_click"
  | "product_view"
  | "search_submit"
  | "search_suggestion_click"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_step_view"
  | "checkout_step_complete"
  | "order_completed"
  | "experiment_exposure"
  | "wishlist_toggle";

function isBrowser() {
  return typeof window !== "undefined";
}

function emitAnalyticsUpdate() {
  if (!isBrowser()) {
    return;
  }
  window.dispatchEvent(new CustomEvent(ANALYTICS_UPDATE_EVENT));
}

export function getAnalyticsUpdateEventName() {
  return ANALYTICS_UPDATE_EVENT;
}

function readStoredEvents() {
  if (!isBrowser()) {
    return [] as AnalyticsEvent[];
  }

  try {
    const raw = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      return [] as AnalyticsEvent[];
    }

    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    if (!Array.isArray(parsed)) {
      return [] as AnalyticsEvent[];
    }

    return parsed;
  } catch {
    return [] as AnalyticsEvent[];
  }
}

function writeStoredEvents(events: AnalyticsEvent[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events));
  emitAnalyticsUpdate();
}

export function trackEvent(
  event: AnalyticsEventName,
  payload: Record<string, unknown> = {},
) {
  const nextEvent: AnalyticsEvent = {
    id: `evt_${nanoid(12)}`,
    event,
    payload,
    timestamp: new Date().toISOString(),
  };

  const previous = readStoredEvents();
  const next = [nextEvent, ...previous].slice(0, MAX_EVENTS);
  writeStoredEvents(next);

  return nextEvent;
}

export function trackPageView(pathname: string) {
  return trackEvent("page_view", { pathname });
}

export function getAnalyticsEvents(limit = 120) {
  return readStoredEvents().slice(0, limit);
}

export function clearAnalyticsEvents() {
  writeStoredEvents([]);
}

function byEvent(events: AnalyticsEvent[], eventName: AnalyticsEventName) {
  return events.filter((entry) => entry.event === eventName);
}

function uniqueByPayloadKey(
  events: AnalyticsEvent[],
  key: string,
  eventName: AnalyticsEventName,
) {
  const subset = byEvent(events, eventName);
  return new Set(subset.map((event) => String(event.payload[key] ?? ""))).size;
}

export function getAnalyticsMetrics() {
  const events = readStoredEvents();

  const pageViews = byEvent(events, "page_view").length;
  const productClicks = byEvent(events, "product_click").length;
  const productViews = byEvent(events, "product_view").length;
  const addToCart = byEvent(events, "add_to_cart").length;
  const checkoutStepViews = byEvent(events, "checkout_step_view");
  const checkoutStarted = checkoutStepViews.filter(
    (entry) => Number(entry.payload.step ?? 0) === 1,
  ).length;
  const checkoutCompleted = byEvent(events, "order_completed").length;

  const checkoutConversionRate =
    checkoutStarted > 0
      ? Number(((checkoutCompleted / checkoutStarted) * 100).toFixed(2))
      : 0;

  const checkoutDropOffRate =
    checkoutStarted > 0
      ? Number(
          (
            ((checkoutStarted - checkoutCompleted) / checkoutStarted) *
            100
          ).toFixed(2),
        )
      : 0;

  return {
    totals: {
      events: events.length,
      pageViews,
      productClicks,
      productViews,
      addToCart,
      checkoutStarted,
      checkoutCompleted,
    },
    funnel: {
      checkoutConversionRate,
      checkoutDropOffRate,
    },
    unique: {
      viewedProducts: uniqueByPayloadKey(events, "productId", "product_view"),
      clickedProducts: uniqueByPayloadKey(events, "productId", "product_click"),
      activePages: uniqueByPayloadKey(events, "pathname", "page_view"),
    },
  };
}
