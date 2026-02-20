"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOTION, getReducedTransition, getStaggerDelay } from "@/lib/motion";

const highlights = [
  {
    title: "Getting Started",
    description: "Single-track onboarding with health checks, smoke validation, and local startup recipes.",
  },
  {
    title: "System Architecture",
    description: "Clear service boundaries, dependency topology, and runtime ownership across teams.",
  },
  {
    title: "API Reference",
    description: "Live OpenAPI docs by service with environment-aware base URLs and operation IDs.",
  },
  {
    title: "DevOps",
    description: "Deployment controls, CI/CD behavior, and incident runbooks for production readiness.",
  },
];

const roleStarts = [
  { label: "Backend Engineer", href: "/docs/v1/getting-started/quickstart" },
  { label: "Frontend Engineer", href: "/docs/v1/local-development/run-all-services" },
  { label: "Mobile Engineer", href: "/docs/v1/local-development/docker-workflow" },
  { label: "Platform / DevOps", href: "/docs/v1/devops/deployment" },
];

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="surface-elevated rounded-2xl p-6 sm:p-8 lg:p-10"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
        transition={getReducedTransition(reduceMotion, {
          duration: MOTION.duration.page,
          ease: MOTION.ease.out,
        })}
      >
        <Badge className="mb-3" variant="muted">
          qeetmart Platform Docs
        </Badge>
        <h1 className="max-w-4xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.7rem]">
          Structured documentation for operating a multi-service commerce platform.
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
          Reference architecture, service contracts, operational workflows, and onboarding guides in one consistent
          documentation system.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Button asChild size="lg">
            <Link href="/docs/v1/getting-started/quickstart">Start in 15 Minutes</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/docs/v1/architecture/system-overview">Explore Architecture</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/reference/v1">Open API Reference</Link>
          </Button>
        </div>
      </motion.header>

      <section aria-label="Documentation coverage" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            key={item.title}
            transition={getReducedTransition(reduceMotion, {
              duration: MOTION.duration.component,
              ease: MOTION.ease.out,
              delay: getStaggerDelay(index, highlights.length),
            })}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </section>

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle>Choose Your Starting Point</CardTitle>
          <CardDescription>Use role-based entry links for faster onboarding and less context switching.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {roleStarts.map((role, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              key={role.label}
              transition={getReducedTransition(reduceMotion, {
                duration: MOTION.duration.component,
                ease: MOTION.ease.out,
                delay: getStaggerDelay(index, roleStarts.length),
              })}
            >
              <Button asChild className="h-10 w-full justify-start" variant="outline">
                <Link href={role.href}>{role.label}</Link>
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
