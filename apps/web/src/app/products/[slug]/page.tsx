import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getProductBySlug, getSimilarProducts } from "@/lib/api/products-api";
import { buildCanonicalUrl, formatCurrency } from "@/lib/utils";
import { ProductDetailsClient } from "@/components/product/product-details-client";
import { ProductSection } from "@/components/product/product-section";

const ProductGallery = dynamic(() => import("@/components/product/product-gallery"), {
  loading: () => <div className="aspect-square w-full animate-pulse rounded-xl bg-surface-200" />,
});

const ReviewList = dynamic(() => import("@/components/product/review-list"), {
  loading: () => <div className="h-40 w-full animate-pulse rounded-xl bg-surface-200" />,
});

const RatingBreakdown = dynamic(() => import("@/components/product/rating-breakdown").then((module) => module.RatingBreakdown), {
  loading: () => <div className="h-36 w-full animate-pulse rounded-xl bg-surface-200" />,
});

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const canonical = buildCanonicalUrl(`/products/${product.slug}`);

  return {
    title: product.title,
    description: product.shortDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      url: canonical,
      images: [
        {
          url: product.images[0],
          width: 1200,
          height: 1200,
          alt: product.title,
        },
      ],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const similarProducts = await getSimilarProducts(product, 10);

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: product.shortDescription,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      priceCurrency: "INR",
      price: product.price,
      url: buildCanonicalUrl(`/products/${product.slug}`),
    },
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <ProductGallery images={product.images} title={product.title} />
        <ProductDetailsClient product={product} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
        <RatingBreakdown productId={product.id} />
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-surface-700 uppercase">Specifications</h3>
          <dl className="grid gap-2 text-sm">
            {product.specs.map((spec) => (
              <div key={spec.label} className="grid grid-cols-[140px,1fr] gap-2 border-b border-surface-100 py-1 last:border-b-0">
                <dt className="text-surface-500">{spec.label}</dt>
                <dd className="font-medium text-surface-800">{spec.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 rounded-lg bg-surface-50 p-3 text-sm text-surface-700">
            MRP: <span className="font-semibold">{formatCurrency(product.originalPrice)}</span>
          </div>
        </div>
      </div>

      <ReviewList productId={product.id} />

      <ProductSection
        title="Similar Products"
        subtitle="You may also like these products from the same category"
        products={similarProducts}
      />
    </div>
  );
}
