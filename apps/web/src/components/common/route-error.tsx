"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-14">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 text-red-700" />
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-red-800">
              Something went wrong while loading this page.
            </h2>
            <p className="text-sm text-red-700">{error.message}</p>
            <Button variant="destructive" onClick={() => reset()}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
