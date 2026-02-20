"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

type DocNeighbor = {
  title: string;
  href: string;
  label: "Previous" | "Next";
};

type DocContextRailProps = {
  headings: TocHeading[];
  neighbors: DocNeighbor[];
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export function DocContextRail({ headings, neighbors }: DocContextRailProps) {
  const [activeHeading, setActiveHeading] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const targets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (targets.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveHeading(visible[0].target.id);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0, 1],
      },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    const calculate = () => {
      const article = document.querySelector(".doc-article");
      if (!article) {
        setProgress(0);
        return;
      }

      const rect = article.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visibleStart = viewportHeight * 0.22;
      const total = rect.height;
      const consumed = visibleStart - rect.top;
      const ratio = total === 0 ? 0 : clamp((consumed / total) * 100, 0, 100);
      setProgress(ratio);
    };

    calculate();
    window.addEventListener("scroll", calculate, { passive: true });
    window.addEventListener("resize", calculate);
    return () => {
      window.removeEventListener("scroll", calculate);
      window.removeEventListener("resize", calculate);
    };
  }, []);

  const progressValue = useMemo(() => `${progress.toFixed(0)}%`, [progress]);

  return (
    <aside className="doc-context" aria-label="Page context">
      <section className="doc-context-card">
        <h2>Reading progress</h2>
        <div className="doc-progress-track" style={{ ["--progress" as string]: progressValue }}>
          <div className="doc-progress-fill" />
        </div>
        <small>{progressValue} complete</small>
      </section>

      {headings.length > 0 ? (
        <section className="doc-context-card">
          <h2>On this page</h2>
          <ul className="doc-toc-list">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  className={`${heading.level === 3 ? "level-3" : ""} ${activeHeading === heading.id ? "active" : ""}`.trim()}
                  href={`#${heading.id}`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {neighbors.length > 0 ? (
        <section className="doc-context-card">
          <h2>Continue</h2>
          {neighbors.map((item) => (
            <Link className="doc-next-link" href={item.href} key={`${item.label}-${item.href}`}>
              <strong>{item.label}</strong>: {item.title}
            </Link>
          ))}
        </section>
      ) : null}
    </aside>
  );
}
