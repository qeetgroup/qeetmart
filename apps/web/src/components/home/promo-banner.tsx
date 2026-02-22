import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
    return (
        <section className="relative overflow-hidden bg-surface-900 text-white">
            {/* Background soft subtle gradients for premium dark mode aesthetics */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(50,50,80,0.6),transparent_60%),radial-gradient(circle_at_70%_50%,rgba(30,60,90,0.6),transparent_60%)]" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-brand-900/40 to-transparent" />

            <div className="container relative mx-auto px-4 py-16 md:py-24">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <p className="text-sm font-semibold tracking-[0.2em] text-surface-300 uppercase">
                        Limited Time Offer
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                        Redefine Your Space. <br className="hidden md:block" />
                        <span className="text-surface-300">Save up to 30%.</span>
                    </h2>
                    <p className="max-w-xl text-surface-400 md:text-lg">
                        Upgrade your home office with our premium collection of ergonomic stands,
                        mechanical keyboards, and minimalist desk mats.
                    </p>
                    <div className="pt-4">
                        <Button size="lg" asChild className="rounded-full bg-white px-8 text-surface-900 hover:bg-surface-100 hover:text-surface-900">
                            <Link href="/products?sort=discount">
                                Explore The Sale
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
