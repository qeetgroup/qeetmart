"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type MermaidDiagramProps = {
  chart?: string;
  title?: string;
  children?: ReactNode;
};

const toChartText = (
  chart: string | undefined,
  children: ReactNode,
): string => {
  if (typeof chart === "string") {
    return chart.trim();
  }

  if (typeof children === "string") {
    return children.trim();
  }

  if (Array.isArray(children)) {
    return children
      .map((part) => (typeof part === "string" ? part : ""))
      .join("")
      .trim();
  }

  return "";
};

export function MermaidDiagram({
  chart,
  title,
  children,
}: MermaidDiagramProps) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const chartText = toChartText(chart, children);

  const renderId = useMemo(() => {
    const suffix = Math.random().toString(36).slice(2, 9);
    return `mermaid-${suffix}`;
  }, []);

  useEffect(() => {
    let isActive = true;

    const render = async () => {
      try {
        setError(null);
        if (!chartText) {
          throw new Error("Mermaid chart content is empty.");
        }
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "default",
        });
        const result = await mermaid.render(renderId, chartText);
        if (isActive) {
          setSvg(result.svg);
        }
      } catch (cause) {
        if (isActive) {
          setSvg("");
          const message =
            cause instanceof Error ? cause.message : String(cause);
          setError(message);
        }
      }
    };

    void render();

    return () => {
      isActive = false;
    };
  }, [chartText, renderId]);

  return (
    <figure className="diagram-shell">
      <div className="diagram-head">
        {title ? <figcaption>{title}</figcaption> : <span>Architecture diagram</span>}
        <div className="diagram-controls">
          <button onClick={() => setZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(2))))} type="button">
            - Zoom
          </button>
          <button onClick={() => setZoom((value) => Math.min(1.8, Number((value + 0.1).toFixed(2))))} type="button">
            + Zoom
          </button>
          <button onClick={() => setZoom(1)} type="button">
            Reset
          </button>
        </div>
      </div>
      {error ? (
        <div>
          <p>Unable to render Mermaid diagram.</p>
          {process.env.NODE_ENV !== "production" ? <pre>{error}</pre> : null}
        </div>
      ) : (
        <div className="diagram-canvas">
          {/* The SVG comes from mermaid's renderer output. */}
          <div className="diagram-content" dangerouslySetInnerHTML={{ __html: svg }} style={{ transform: `scale(${zoom})` }} />
        </div>
      )}
    </figure>
  );
}
