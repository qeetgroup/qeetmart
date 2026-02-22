import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-surface-50 to-surface-100 py-12 md:py-24">
            {/* Subtle decorative background elements */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-100/50 blur-3xl" />

            <div className="container relative mx-auto px-4">
                <div className="grid items-center gap-12 lg:grid-cols-2">

                    {/* Text Content */}
                    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
                        <div className="space-y-4">
                            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-sm font-medium tracking-tight text-brand-700">
                                Premium Collection 2026
                            </span>
                            <h1 className="text-4xl font-semibold tracking-tight text-surface-900 md:text-5xl lg:text-6xl lg:leading-[1.1]">
                                Elevate your everyday <br className="hidden lg:block" />
                                <span className="text-brand-600">lifestyle essentials.</span>
                            </h1>
                            <p className="max-w-xl text-lg text-surface-600 md:text-xl">
                                Discover curated products designed with uncompromising quality
                                and modern aesthetics. Experince true premium commerce.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <Button size="lg" asChild className="group rounded-full px-8 text-base shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/30">
                                <Link href="/products">
                                    Shop Now
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="rounded-full px-8 text-base transition-all hover:-translate-y-0.5 hover:bg-surface-50">
                                <Link href="/categories">
                                    Explore Categories
                                </Link>
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center gap-6 pt-6 text-sm font-medium text-surface-600">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <Truck className="h-4 w-4" />
                                </div>
                                Free Shipping
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                Secure Payment
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                    <RotateCcw className="h-4 w-4" />
                                </div>
                                Easy Returns
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="relative mx-auto w-full max-w-lg lg:max-w-none animate-in fade-in slide-in-from-right-8 duration-1000 ease-out delay-150 fill-mode-both">
                        <div className="relative aspect-[4/3] w-full lg:aspect-square">
                            {/* Product Card Layer 1 - Background */}
                            <div className="absolute top-8 right-8 bottom-8 left-16 rounded-3xl bg-white shadow-2xl transition-transform duration-700 hover:rotate-1 md:left-24" />

                            {/* Product Card Layer 2 - Foreground */}
                            <div className="absolute top-0 right-16 bottom-16 left-0 overflow-hidden rounded-3xl bg-surface-100 shadow-xl transition-transform duration-700 hover:-translate-y-2 hover:-rotate-1 md:right-24">
                                <Image
                                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop"
                                    alt="Premium Headphones"
                                    fill
                                    priority
                                    className="object-cover"
                                />

                                {/* Overlay gradient for text legibility if needed, or simply let the image shine */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                                {/* Floating Price Tag */}
                                <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-sm">
                                    <p className="text-xs font-semibold tracking-wider text-surface-500 uppercase">Featured</p>
                                    <p className="text-lg font-bold text-surface-900">Sony WH-1000XM5</p>
                                    <p className="text-sm font-medium text-brand-600">$348.00</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
