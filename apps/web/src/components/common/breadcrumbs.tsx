"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const hiddenRoutes = new Set(["/"]);

function segmentToLabel(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function Breadcrumbs() {
  const pathname = usePathname();

  if (hiddenRoutes.has(pathname)) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="border-b border-surface-200 bg-white/70">
      <div className="container mx-auto flex items-center gap-1 px-4 py-2 text-xs text-surface-600 md:text-sm">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          return (
            <span key={href} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" />
              {isLast ? (
                <span className="font-medium text-surface-900" aria-current="page">
                  {segmentToLabel(segment)}
                </span>
              ) : (
                <Link href={href} className="hover:text-brand-700">
                  {segmentToLabel(segment)}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
