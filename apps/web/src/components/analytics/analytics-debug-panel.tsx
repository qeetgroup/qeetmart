"use client";

import { useEffect, useState } from "react";
import { BarChart3, X } from "lucide-react";
import {
  clearAnalyticsEvents,
  getAnalyticsEvents,
  getAnalyticsMetrics,
  getAnalyticsUpdateEventName,
} from "@/lib/analytics/tracker";
import { Button } from "@/components/ui/button";

export function AnalyticsDebugPanel() {
  const [open, setOpen] = useState(false);
  const [, setVersion] = useState(0);

  useEffect(() => {
    const updateEvent = getAnalyticsUpdateEventName();
    const onUpdate = () => setVersion((previous) => previous + 1);

    window.addEventListener(updateEvent, onUpdate);

    return () => {
      window.removeEventListener(updateEvent, onUpdate);
    };
  }, []);

  useEffect(() => {
    const onKeyboard = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === "a") {
        setOpen((previous) => !previous);
      }
    };

    window.addEventListener("keydown", onKeyboard);
    return () => {
      window.removeEventListener("keydown", onKeyboard);
    };
  }, []);

  const metrics = getAnalyticsMetrics();
  const events = getAnalyticsEvents(12);

  return (
    <>
      <button
        type="button"
        className="fixed right-4 bottom-4 z-[70] rounded-full border border-surface-300 bg-white p-3 text-surface-700 shadow-lg hover:border-brand-300 hover:text-brand-700"
        onClick={() => setOpen(true)}
        aria-label="Open analytics debug panel"
      >
        <BarChart3 className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed top-0 right-0 z-[85] h-full w-[min(94vw,430px)] overflow-y-auto border-l border-surface-200 bg-white p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-surface-900">Analytics Debug</h3>
            <button
              type="button"
              className="rounded-md p-1 text-surface-500 hover:bg-surface-100"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-surface-200 p-2">
              <p className="text-surface-600">Page Views</p>
              <p className="text-lg font-bold text-surface-900">{metrics.totals.pageViews}</p>
            </div>
            <div className="rounded-md border border-surface-200 p-2">
              <p className="text-surface-600">Product Clicks</p>
              <p className="text-lg font-bold text-surface-900">{metrics.totals.productClicks}</p>
            </div>
            <div className="rounded-md border border-surface-200 p-2">
              <p className="text-surface-600">Add To Cart</p>
              <p className="text-lg font-bold text-surface-900">{metrics.totals.addToCart}</p>
            </div>
            <div className="rounded-md border border-surface-200 p-2">
              <p className="text-surface-600">Checkout Conv.</p>
              <p className="text-lg font-bold text-surface-900">{metrics.funnel.checkoutConversionRate}%</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                clearAnalyticsEvents();
                setVersion((previous) => previous + 1);
              }}
            >
              Clear events
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold tracking-wide text-surface-600 uppercase">Recent events</p>
            {events.map((event) => (
              <div key={event.id} className="rounded-md border border-surface-200 p-2">
                <p className="text-xs font-semibold text-surface-900">{event.event}</p>
                <p className="text-[11px] text-surface-600">{new Date(event.timestamp).toLocaleTimeString()}</p>
                <pre className="mt-1 overflow-x-auto text-[10px] text-surface-700">
                  {JSON.stringify(event.payload)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
