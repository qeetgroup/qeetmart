"use client";

import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useExperiment } from "@/hooks/useExperiment";

export function HomeHeroExperiment() {
  const heroLayout = useExperiment("home_hero_layout");
  const ctaColor = useExperiment("cta_color");

  const ctaClassName =
    ctaColor.isVariantB
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : "bg-brand-600 text-white hover:bg-brand-700";

  if (heroLayout.isVariantB) {
    return (
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-surface-900 via-brand-800 to-brand-600 p-6 text-white lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.16),transparent_40%)]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr,1fr]">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Personalized Commerce
            </p>
            <h1 className="text-3xl font-black tracking-tight lg:text-5xl">
              Smarter recommendations. Faster checkout. Better conversion.
            </h1>
            <p className="text-sm text-brand-100 lg:text-base">
              Built with experimentation, personalization and analytics baked into the shopping journey.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild className={ctaClassName}>
                <Link href="/products?sort=personalized">Explore recommended products</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/products/category/electronics">Shop electronics</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-100">
              Optimization Layer
            </p>
            <ul className="space-y-2 text-sm text-brand-50">
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Experiment-driven hero and CTA
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Personalized feed and search ranking
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Inventory intelligence and urgency insights
              </li>
            </ul>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-6 text-white lg:p-8">
      <div className="relative z-10 max-w-xl space-y-4">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-100">
          Mega Savings Festival
        </p>
        <h1 className="text-3xl font-black tracking-tight lg:text-5xl">
          Upgrade your daily essentials with smarter deals.
        </h1>
        <p className="text-sm text-brand-100 lg:text-base">
          Explore 100+ premium products across electronics, fashion, home, and more.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild className={ctaClassName}>
            <Link href="/products">Shop now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            <Link href="/products/category/electronics">Explore electronics</Link>
          </Button>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
    </Card>
  );
}
