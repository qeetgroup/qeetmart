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

  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-[600px] mx-auto lg:mr-0 lg:ml-auto">
      {/* Main Image */}
      <div
        className={cn(
          "relative aspect-square w-full flex-1 overflow-hidden rounded-2xl border border-surface-200 bg-surface-50 shadow-sm transition-all duration-300",
          zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        )}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => {
          setZoomed(false);
          setMousePosition({ x: 50, y: 50 });
        }}
        onMouseMove={handleMouseMove}
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
        {images.map((image, index) => (
          <Image
            key={image}
            src={image}
            alt={`${title} ${index + 1}`}
            fill
            className={cn(
              "object-cover transition-all duration-500 ease-out",
              index === activeIndex ? "z-10 opacity-100" : "z-0 opacity-0",
              zoomed && index === activeIndex ? "scale-[2]" : "scale-100"
            )}
            style={{
              transformOrigin:
                zoomed && index === activeIndex
                  ? `${mousePosition.x}% ${mousePosition.y}%`
                  : "center center",
            }}
            priority={index === 0}
          />
        ))}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-3 [&::-webkit-scrollbar]:hidden">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-xl border-2 transition-all hover:opacity-100",
              index === activeIndex
                ? "border-brand-600 opacity-100 shadow-sm"
                : "border-transparent opacity-60 hover:border-surface-300"
            )}
          >
            <Image
              src={image}
              alt={`${title} preview ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
