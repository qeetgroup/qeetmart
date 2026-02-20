"use client";

import { useEffect, useMemo, useState } from "react";

type MermaidDiagramProps = {
  chart: string;
  title?: string;
};

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  const renderId = useMemo(() => {
    const suffix = Math.random().toString(36).slice(2, 9);
    return `mermaid-${suffix}`;
  }, []);

  useEffect(() => {
    let isActive = true;

    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "default" });
        const result = await mermaid.render(renderId, chart);
        if (isActive) {
          setSvg(result.svg);
        }
      } catch {
        if (isActive) {
          setError(true);
        }
      }
    };

    void render();

    return () => {
      isActive = false;
    };
  }, [chart, renderId]);

  return (
    <figure className="my-4 overflow-x-auto rounded-xl border border-border bg-card p-4 shadow-sm">
      {title ? <figcaption className="mb-3 text-sm font-semibold text-foreground">{title}</figcaption> : null}
      {error ? (
        <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          Unable to render Mermaid diagram.
        </p>
      ) : (
        // The SVG comes from mermaid's renderer output.
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      )}
    </figure>
  );
}
