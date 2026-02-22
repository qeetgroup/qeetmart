import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/api/categories-api";
import { buildCanonicalUrl } from "@/lib/utils";
import { PLPShell } from "@/components/product/plp-shell";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryItem = await getCategoryBySlug(category);

  if (!categoryItem) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${categoryItem.name} Products`,
    description: categoryItem.description,
    alternates: {
      canonical: buildCanonicalUrl(`/products/category/${categoryItem.slug}`),
    },
    openGraph: {
      title: `${categoryItem.name} Products`,
      description: categoryItem.description,
      url: buildCanonicalUrl(`/products/category/${categoryItem.slug}`),
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryItem = await getCategoryBySlug(category);

  if (!categoryItem) {
    notFound();
  }

  return <PLPShell initialCategory={category} />;
}
