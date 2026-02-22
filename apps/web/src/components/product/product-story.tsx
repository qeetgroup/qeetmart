"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductStoryProps {
    product: Product;
}

function FadeInSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0]?.isIntersecting) {
                setVisible(true);
            }
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        const currentRef = domRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={cn(
                "transition-all duration-1000 ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
                className
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export function ProductStory({ product }: ProductStoryProps) {
    // Use images 1 and 2 for the alternating layout if available, or fallback to main image
    const img1 = product.images[1] || product.images[0];
    const img2 = product.images[2] || product.images[0];

    return (
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 space-y-24 md:space-y-32 overflow-hidden">

            {/* 1. Hero Statement */}
            <FadeInSection className="text-center max-w-3xl mx-auto space-y-6">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-surface-900 leading-tight">
                    Designed for the <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">
                        modern lifestyle.
                    </span>
                </h2>
                <p className="text-lg md:text-xl text-surface-600 font-medium leading-relaxed">
                    {product.description}
                </p>
            </FadeInSection>

            {/* 2. Alternating Block - Left Image */}
            <FadeInSection className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-100 order-2 md:order-1 shadow-2xl">
                    {img1 && (
                        <Image
                            src={img1}
                            alt="Feature Highlight"
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                        />
                    )}
                </div>
                <div className="space-y-6 order-1 md:order-2">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight text-surface-900">
                        Engineered to perfection.
                    </h3>
                    <p className="text-lg text-surface-600 leading-relaxed">
                        Every detail of the {product.title} has been meticulously crafted to deliver an unparalleled experience. The finest materials combine with cutting-edge manufacturing to create something truly extraordinary.
                    </p>
                    <ul className="space-y-4 pt-4">
                        {product.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-1">
                                    <div className="h-2 w-2 rounded-full bg-brand-600" />
                                </div>
                                <span className="text-surface-800 font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </FadeInSection>

            {/* 3. Alternating Block - Right Image */}
            <FadeInSection className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
                <div className="space-y-6">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight text-surface-900">
                        Power meets elegance.
                    </h3>
                    <p className="text-lg text-surface-600 leading-relaxed">
                        We uncompromisingly believe that true beauty stems from incredible functionality. That's why we packed the absolute best technology into a form factor that feels right at home, anywhere.
                    </p>
                    <ul className="space-y-4 pt-4">
                        {product.features.slice(3, 6).map((feature, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="h-6 w-6 rounded-full bg-surface-200 flex items-center justify-center shrink-0 mt-1">
                                    <div className="h-2 w-2 rounded-full bg-surface-800" />
                                </div>
                                <span className="text-surface-800 font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-3xl bg-surface-100 shadow-2xl">
                    {img2 && (
                        <Image
                            src={img2}
                            alt="Performance Feature"
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                        />
                    )}
                </div>
            </FadeInSection>

            {/* 4. Specs Grid Highlight */}
            <FadeInSection className="rounded-3xl bg-surface-900 text-white p-8 md:p-16 text-center space-y-12 shadow-2xl">
                <div className="max-w-2xl mx-auto space-y-4">
                    <h3 className="text-3xl md:text-5xl font-black tracking-tight">
                        The numbers speak <br className="hidden sm:block" /> for themselves.
                    </h3>
                    <p className="text-surface-400 text-lg">
                        No compromises on the specifications. Here is what makes it tick.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pt-8 border-t border-surface-800">
                    {product.specs.slice(0, 4).map((spec, i) => (
                        <div key={i} className="space-y-2" style={{ transitionDelay: `${i * 100}ms` }}>
                            <p className="text-surface-400 text-sm font-semibold tracking-widest uppercase">{spec.label}</p>
                            <p className="text-2xl md:text-3xl font-bold tracking-tight">{spec.value}</p>
                        </div>
                    ))}
                </div>
            </FadeInSection>
        </section>
    );
}
