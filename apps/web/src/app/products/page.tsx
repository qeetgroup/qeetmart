import type { Metadata } from "next";
import { PLPShell } from "@/components/product/plp-shell";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse products with category, price, rating, brand and availability filters.",
};

export default function ProductsPage() {
  return <PLPShell />;
}
