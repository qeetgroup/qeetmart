import Link from "next/link";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  href?: string;
}

export function ProductSection({ title, subtitle, products, href }: ProductSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-surface-900">{title}</h2>
          <p className="text-sm text-surface-600">{subtitle}</p>
        </div>
        {href ? (
          <Button variant="outline" asChild>
            <Link href={href}>View all</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
