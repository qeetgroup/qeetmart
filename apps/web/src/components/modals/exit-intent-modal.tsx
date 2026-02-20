"use client";

import { useEffect, useState } from "react";
import { Gift, X } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics/tracker";
import { Button } from "@/components/ui/button";

const EXIT_MODAL_KEY = "qeetmart-exit-intent-dismissed";

export function ExitIntentModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.sessionStorage.getItem(EXIT_MODAL_KEY) === "true") {
      return;
    }

    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY > 12) {
        return;
      }
      setOpen(true);
      trackEvent("page_view", { context: "exit_intent_modal_shown" });
      window.sessionStorage.setItem(EXIT_MODAL_KEY, "true");
    };

    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          className="absolute top-3 right-3 rounded-md p-1 text-surface-500 hover:bg-surface-100"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 inline-flex rounded-full bg-brand-100 p-2 text-brand-700">
          <Gift className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-black tracking-tight text-surface-900">Before you go...</h3>
        <p className="mt-1 text-sm text-surface-600">
          Use code <span className="font-semibold text-brand-700">SAVE10</span> for extra 10% off on eligible orders.
        </p>

        <div className="mt-4 flex gap-2">
          <Button asChild className="flex-1">
            <Link
              href="/products?sort=personalized"
              onClick={() => {
                trackEvent("search_submit", { query: "exit_intent_recovery" });
                setOpen(false);
              }}
            >
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}
