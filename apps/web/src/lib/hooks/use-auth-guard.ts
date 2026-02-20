"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session-store";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSessionStore((state) => state.user);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/auth/login?redirect=${redirect}`);
    }
  }, [hasHydrated, user, pathname, router]);

  return {
    isReady: hasHydrated,
    isAuthenticated: Boolean(user),
    user,
  };
}
