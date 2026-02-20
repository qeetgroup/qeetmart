"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { NavSection } from "@/lib/docs/config";

type SidebarNavProps = {
  sections: NavSection[];
  onNavigate?: () => void;
};

const isItemActive = (currentPath: string, href: string): boolean => {
  if (currentPath === href || currentPath.startsWith(`${href}/`)) {
    return true;
  }
  if (href.endsWith("/quickstart") && currentPath === href.replace("/quickstart", "")) {
    return true;
  }
  return false;
};

export function SidebarNav({ sections, onNavigate }: SidebarNavProps) {
  const currentPath = usePathname();
  const activeBySection = useMemo(() => {
    return Object.fromEntries(
      sections.map((section) => [section.title, section.items.some((item) => isItemActive(currentPath, item.href))]),
    );
  }, [currentPath, sections]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionTitle: string) => {
    const fallbackExpanded = Boolean(activeBySection[sectionTitle]);
    setExpandedSections((state) => ({
      ...state,
      [sectionTitle]: !(state[sectionTitle] ?? fallbackExpanded),
    }));
  };

  return (
    <nav aria-label="Documentation sections" className="sidebar-nav">
      {sections.map((section) => {
        const sectionId = `sidebar-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        const sectionExpanded = expandedSections[section.title] ?? Boolean(activeBySection[section.title]);

        return (
          <section key={section.title} className="sidebar-section">
            <button
              aria-controls={sectionId}
              aria-expanded={sectionExpanded}
              className="sidebar-section-header"
              onClick={() => toggleSection(section.title)}
              type="button"
            >
              <span className="sidebar-section-title">{section.title}</span>
              <span className="sidebar-section-count">{section.items.length}</span>
            </button>
            {sectionExpanded ? (
              <ul className="sidebar-list" id={sectionId}>
                {section.items.map((item) => {
                  const isActive = isItemActive(currentPath, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        className={isActive ? "active" : ""}
                        href={item.href}
                        onClick={onNavigate}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        );
      })}
    </nav>
  );
}
