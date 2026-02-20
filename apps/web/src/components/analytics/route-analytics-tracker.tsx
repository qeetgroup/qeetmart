"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics/tracker";

export function RouteAnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string>("");

  useEffect(() => {
    if (lastTrackedRef.current === pathname) {
      return;
    }

    lastTrackedRef.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
