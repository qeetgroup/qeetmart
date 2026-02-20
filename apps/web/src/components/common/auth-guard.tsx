"use client";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated } = useAuthGuard();

  if (!isReady) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-48 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
