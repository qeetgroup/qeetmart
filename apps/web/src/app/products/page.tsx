import type { Metadata } from "next";
import { buildCanonicalUrl } from "@/lib/utils";
import { PLPShell } from "@/components/product/plp-shell";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse products with category, price, rating, brand and availability filters.",
  alternates: {
    canonical: buildCanonicalUrl("/products"),
  },
};

export default function ProductsPage() {
  return <PLPShell />;
}
