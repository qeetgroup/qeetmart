"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOTION, getReducedTransition } from "@/lib/motion";
import type { ServiceMetadata } from "@/lib/docs/config";
import { cn } from "@/lib/utils";

type ServiceCardProps = {
  service: ServiceMetadata;
  version: string;
};

export function ServiceCard({ service, version }: ServiceCardProps) {
  const href = service.openapi ? `/reference/${version}/${service.id}` : `/docs/${version}/services/overview`;
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("transition-transform duration-150 ease-in-out", reduceMotion ? "" : "hover:-translate-y-0.5")}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
      transition={getReducedTransition(reduceMotion, {
        duration: MOTION.duration.component,
        ease: MOTION.ease.out,
      })}
    >
      <Link className="block rounded-xl focus-visible:ring-2 focus-visible:ring-primary/55" href={href}>
        <Card className="h-full transition-colors duration-150 hover:bg-accent/30">
          <CardHeader className="pb-3">
            <div className="flex flex-col items-start justify-between gap-2 min-[480px]:flex-row min-[480px]:items-center">
              <CardTitle className="text-base leading-snug">{service.title}</CardTitle>
              <Badge variant={service.openapi ? "success" : "warning"}>
                {service.openapi ? "OpenAPI Ready" : "OpenAPI Pending"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-1.5 text-sm text-muted-foreground">
            <p>
              Runtime: <span className="text-foreground">{service.runtime}</span>
            </p>
            <p>
              Owner: <span className="text-foreground">{service.owner}</span>
            </p>
            <p>
              Port: <span className="text-foreground">{service.port}</span>
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
