"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics/tracker";

export function useTrackEvent(defaultPayload: Record<string, unknown> = {}) {
  const pathname = usePathname();

  const sendEvent = useCallback(
    (event: Parameters<typeof trackEvent>[0], payload: Record<string, unknown> = {}) => {
      return trackEvent(event, {
        pathname,
        ...defaultPayload,
        ...payload,
      });
    },
    [defaultPayload, pathname],
  );

  return {
    trackEvent: sendEvent,
  };
}
