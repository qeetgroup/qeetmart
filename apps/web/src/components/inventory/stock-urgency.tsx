"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, AlertTriangle } from "lucide-react";
import { getInventoryInsights, getStockPressureCountdown } from "@/lib/inventory/inventory-intelligence";
import { Progress } from "@/components/ui/progress";
import type { Product } from "@/types";

interface StockUrgencyProps {
  product: Product;
}

function formatRemaining(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function StockUrgency({ product }: StockUrgencyProps) {
  const insights = useMemo(() => getInventoryInsights(product), [product]);
  const countdown = useMemo(() => getStockPressureCountdown(product), [product]);
  const [remaining, setRemaining] = useState(countdown?.totalSeconds ?? 0);

  useEffect(() => {
    if (!countdown || remaining <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemaining((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [countdown, remaining]);

  return (
    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-sm font-semibold">Inventory Intelligence</p>
      </div>

      <p className="text-sm text-amber-900">{insights.urgencyLabel}</p>
      <Progress
        value={insights.urgencyPercent}
        indicatorClassName={
          insights.level === "critical" ? "bg-red-600" : insights.level === "high" ? "bg-amber-500" : "bg-emerald-600"
        }
      />

      {countdown ? (
        <p className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-amber-900">
          <Clock3 className="h-3.5 w-3.5" />
          Live sell-out timer: {formatRemaining(remaining)}
        </p>
      ) : null}

      <p className="text-xs text-amber-800">{insights.restockSuggestion}</p>
    </div>
  );
}
