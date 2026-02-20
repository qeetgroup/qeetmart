"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1280px)": { slidesToScroll: 3 },
    },
  });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {products.map((product) => (
            <div key={product.id} className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_46%] xl:flex-[0_0_30%]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={scrollPrev}
        className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-2 shadow-md hover:bg-white"
        aria-label="Previous products"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-2 shadow-md hover:bg-white"
        aria-label="Next products"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
