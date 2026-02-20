"use client";

import { useEffect, useState } from "react";

type MermaidDiagramProps = {
  chart: string;
  title?: string;
};

let mermaidInitialized = false;

const getRenderId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `mermaid-${crypto.randomUUID()}`;
  }
  return `mermaid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
};

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const [svg, setSvg] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const render = async () => {
      setErrorMessage(null);
      setSvg("");

      try {
        const renderId = getRenderId();
        const normalizedChart = chart.trim();

        const mermaid = (await import("mermaid")).default;
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "loose",
            theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default",
          });
          mermaidInitialized = true;
        }

        await mermaid.parse(normalizedChart);
        const result = await mermaid.render(renderId, normalizedChart);

        if (isActive) {
          setSvg(result.svg);
        }
      } catch (error) {
        if (isActive) {
          const message = error instanceof Error ? error.message : "Unknown Mermaid render error";
          setErrorMessage(message);
        }
      }
    };

    void render();

    return () => {
      isActive = false;
    };
  }, [chart]);

  return (
    <figure className="my-4 overflow-x-auto rounded-xl border border-border bg-card p-4 shadow-sm">
      {title ? <figcaption className="mb-3 text-sm font-semibold text-foreground">{title}</figcaption> : null}
      {errorMessage ? (
        <div className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Unable to render Mermaid diagram.</p>
          <p className="mt-1 text-xs">{errorMessage}</p>
          <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs text-foreground">
            <code>{chart}</code>
          </pre>
        </div>
      ) : (
        // The SVG comes from mermaid's renderer output.
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      )}
    </figure>
  );
}
