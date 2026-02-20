"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavSection } from "@/lib/docs/config";

type SidebarNavProps = {
  sections: NavSection[];
};

export function SidebarNav({ sections }: SidebarNavProps) {
  const currentPath = usePathname();

  return (
    <nav aria-label="Documentation sections" className="sidebar-nav">
      {sections.map((section) => (
        <section key={section.title} className="sidebar-section">
          <h2>{section.title}</h2>
          <ul>
            {section.items.map((item) => {
              const isActive =
                currentPath === item.href ||
                (item.href.endsWith("/quickstart") && currentPath === item.href.replace("/quickstart", ""));

              return (
                <li key={item.href}>
                  <Link aria-current={isActive ? "page" : undefined} className={isActive ? "active" : ""} href={item.href}>
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
