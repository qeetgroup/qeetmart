"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavSection } from "@/lib/docs/config";
import { MOTION, getFadeInUpVariants, getReducedTransition, getStaggerDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  sections: NavSection[];
};

export function SidebarNav({ sections }: SidebarNavProps) {
  const currentPath = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <motion.nav
      animate="visible"
      aria-label="Documentation sections"
      className="space-y-5"
      initial="hidden"
      transition={getReducedTransition(reduceMotion, {
        duration: MOTION.duration.component,
        ease: MOTION.ease.out,
      })}
      variants={getFadeInUpVariants(reduceMotion, 4)}
    >
      {sections.map((section, sectionIndex) => (
        <motion.section
          animate="visible"
          className="space-y-2"
          initial="hidden"
          key={section.title}
          transition={getReducedTransition(reduceMotion, {
            duration: MOTION.duration.component,
            ease: MOTION.ease.out,
            delay: getStaggerDelay(sectionIndex, sections.length),
          })}
          variants={getFadeInUpVariants(reduceMotion, 4)}
        >
          <h2 className="px-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
            {section.title}
          </h2>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive =
                currentPath === item.href ||
                (item.href.endsWith("/quickstart") && currentPath === item.href.replace("/quickstart", ""));

              return (
                <li key={item.href}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block rounded-lg border border-transparent px-2 py-1.5 transition-colors duration-150",
                      "focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      "hover:border-border hover:bg-card hover:text-foreground",
                      isActive
                        ? "border-border bg-card text-foreground shadow-sm"
                        : "text-muted-foreground",
                    )}
                    href={item.href}
                  >
                    <span className="block text-sm font-medium leading-tight">{item.title}</span>
                    {item.description ? (
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{item.description}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </motion.section>
      ))}
    </motion.nav>
  );
}
