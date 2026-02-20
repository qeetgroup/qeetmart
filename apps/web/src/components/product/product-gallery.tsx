"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-surface-200 bg-surface-50",
          zoomed ? "cursor-zoom-out" : "cursor-zoom-in",
        )}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchMove={(event) => {
          touchEndX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={() => {
          if (touchStartX.current === null || touchEndX.current === null) {
            return;
          }

          const delta = touchStartX.current - touchEndX.current;
          if (Math.abs(delta) < 40) {
            return;
          }

          if (delta > 0) {
            setActiveIndex((previous) => (previous + 1) % images.length);
          } else {
            setActiveIndex(
              (previous) => (previous - 1 + images.length) % images.length,
            );
          }

          touchStartX.current = null;
          touchEndX.current = null;
        }}
      >
        <Image
          src={activeImage}
          alt={title}
          width={900}
          height={900}
          className={cn(
            "aspect-square w-full object-cover transition duration-300",
            zoomed ? "scale-[1.6]" : "scale-100",
          )}
          priority
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "overflow-hidden rounded-md border bg-white",
              index === activeIndex
                ? "border-brand-500 ring-2 ring-brand-200"
                : "border-surface-200",
            )}
          >
            <Image
              src={image}
              alt={`${title} preview ${index + 1}`}
              width={120}
              height={120}
              className="aspect-square w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
