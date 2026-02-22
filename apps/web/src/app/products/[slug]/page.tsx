import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import {
  getCachedProductBySlug,
  getCachedSimilarProducts,
} from "@/lib/performance/cache";
import { getCustomersAlsoBought } from "@/lib/api/products-api";
import { buildCanonicalUrl, formatCurrency } from "@/lib/utils";
import { ProductDetailsClient } from "@/components/product/product-details-client";
import { ProductSection } from "@/components/product/product-section";
import { ProductStory } from "@/components/product/product-story";
import { FaqAccordion } from "@/components/product/faq-accordion";
import { Button } from "@/components/ui/button";

const ProductGallery = dynamic(() => import("@/components/product/product-gallery"), {
  loading: () => (
    <div className="aspect-square w-full animate-pulse rounded-xl bg-surface-200" />
  ),
});

const ReviewList = dynamic(() => import("@/components/product/review-list"), {
  loading: () => <div className="h-40 w-full animate-pulse rounded-xl bg-surface-200" />,
});

const RatingBreakdown = dynamic(
  () =>
    import("@/components/product/rating-breakdown").then(
      (module) => module.RatingBreakdown,
    ),
  {
    loading: () => (
      <div className="h-36 w-full animate-pulse rounded-xl bg-surface-200" />
    ),
  },
);

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 120;

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);

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
  const product = await getCachedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [similarProducts, customersAlsoBought] = await Promise.all([
    getCachedSimilarProducts(product, 10),
    getCustomersAlsoBought(product, 8),
  ]);

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
    <div className="container mx-auto space-y-12 px-4 py-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 lg:max-w-[55%]">
          <ProductGallery images={product.images} title={product.title} />
        </div>
        <div className="flex-1 lg:sticky lg:top-24 lg:max-w-[40%]">
          <ProductDetailsClient product={product} />
        </div>
      </div>

      <ProductStory product={product} />

      <div className="mx-auto max-w-7xl pt-8 pb-16">
        <div className="mb-12 space-y-2 text-center">
          <h2 className="text-3xl font-black tracking-tight text-surface-900 md:text-5xl">Real reviews from <br className="hidden md:block" /><span className="text-brand-600">real customers.</span></h2>
          <p className="text-lg text-surface-600 font-medium">See what others are saying about the {product.title}.</p>
        </div>
        <div className="grid gap-12 lg:grid-cols-[300px_1fr] xl:grid-cols-[380px_1fr] items-start">
          <div className="space-y-8 lg:sticky lg:top-24 h-fit z-10 bg-white">
            <RatingBreakdown productId={product.id} />
            <div className="space-y-4 rounded-3xl bg-surface-50 p-8 text-center shadow-inner">
              <h3 className="font-bold text-surface-900 text-xl tracking-tight">Got something to share?</h3>
              <p className="text-surface-600 text-sm pb-2">If you’ve used this product, share your thoughts with other customers.</p>
              <Button className="w-full h-12 rounded-xl text-base font-bold shadow-md transition-transform hover:-translate-y-0.5">Write a Review</Button>
            </div>
          </div>
          <div>
            <ReviewList productId={product.id} />
          </div>
        </div>
      </div>

      <FaqAccordion />

      <ProductSection
        title="Similar Products"
        subtitle="You may also like these products from the same category"
        products={similarProducts}
      />
    </div>
  );
}
