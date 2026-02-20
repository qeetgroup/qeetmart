"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { NavSection } from "@/lib/docs/config";
import { MOTION, getFadeInUpVariants, getReducedTransition, getStaggerDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  sections: NavSection[];
};

const STORAGE_KEY = "qeetmart-docs-sidebar-collapsed";

const toStorageSectionKey = (title: string) => title.trim().toLowerCase().replace(/\s+/g, "-");

export function SidebarNav({ sections }: SidebarNavProps) {
  const currentPath = usePathname();
  const reduceMotion = useReducedMotion();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [storageLoaded, setStorageLoaded] = useState(false);

  const activeBySection = useMemo(() => {
    return Object.fromEntries(
      sections.map((section) => {
        const active = section.items.some((item) => {
          return (
            currentPath === item.href ||
            (item.href.endsWith("/quickstart") && currentPath === item.href.replace("/quickstart", ""))
          );
        });
        return [toStorageSectionKey(section.title), active];
      }),
    );
  }, [currentPath, sections]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        setCollapsedSections(parsed);
      }
    } catch {
      setCollapsedSections({});
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsedSections));
  }, [collapsedSections, storageLoaded]);

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  };

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
      {sections.map((section, sectionIndex) => {
        const sectionKey = toStorageSectionKey(section.title);
        const sectionHasActiveItem = activeBySection[sectionKey];
        const isCollapsed = sectionHasActiveItem ? false : Boolean(collapsedSections[sectionKey]);

        return (
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
          <button
            aria-controls={`sidebar-section-${sectionKey}`}
            aria-expanded={!isCollapsed}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground transition-colors duration-150",
              "hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/55",
            )}
            onClick={() => toggleSection(sectionKey)}
            type="button"
          >
            <span>{section.title}</span>
            <span
              aria-hidden
              className={cn(
                "text-sm leading-none transition-transform duration-150 ease-in-out",
                isCollapsed ? "" : "rotate-90",
              )}
            >
              ▸
            </span>
          </button>
          <ul className={cn("space-y-1", isCollapsed ? "hidden" : "")} id={`sidebar-section-${sectionKey}`}>
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
        );
      })}
    </motion.nav>
  );
}
