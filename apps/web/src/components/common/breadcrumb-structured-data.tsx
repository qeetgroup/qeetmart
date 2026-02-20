"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

function segmentToLabel(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function BreadcrumbStructuredData() {
  const pathname = usePathname();

  const scriptJson = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const segments = pathname.split("/").filter(Boolean);

    const items = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`,
      },
      ...segments.map((segment, index) => {
        const href = `${baseUrl}/${segments.slice(0, index + 1).join("/")}`;
        return {
          "@type": "ListItem",
          position: index + 2,
          name: segmentToLabel(segment),
          item: href,
        };
      }),
    ];

    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    });
  }, [pathname]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: scriptJson }}
    />
  );
}
