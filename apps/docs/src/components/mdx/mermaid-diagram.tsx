"use client";

import { isValidElement, type ReactNode, useEffect, useMemo, useState } from "react";

type MermaidDiagramProps = {
  chart?: unknown;
  title?: string;
  children?: ReactNode;
};

let mermaidInitialized = false;

const getRenderId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `mermaid-${crypto.randomUUID()}`;
  }
  return `mermaid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
};

const extractText = (value: unknown): string => {
  if (value === null || value === undefined || typeof value === "boolean") {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(extractText).join("");
  }

  if (isValidElement(value)) {
    return extractText((value.props as { children?: unknown }).children);
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    if ("children" in objectValue) {
      return extractText(objectValue.children);
    }
    if ("value" in objectValue) {
      return extractText(objectValue.value);
    }
  }

  return "";
};

const normalizeChartSource = (input: MermaidDiagramProps["chart"], children: ReactNode): string => {
  const fromProp = extractText(input).trim();
  if (fromProp) {
    return fromProp;
  }

  return extractText(children).trim();
};

export function MermaidDiagram({ chart, title, children }: MermaidDiagramProps) {
  const [svg, setSvg] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chartSource = useMemo(() => normalizeChartSource(chart, children), [chart, children]);

  useEffect(() => {
    let isActive = true;

    const render = async () => {
      setErrorMessage(null);
      setSvg("");

      try {
        const renderId = getRenderId();
        const normalizedChart = chartSource.trim();
        if (!normalizedChart) {
          throw new Error("Missing Mermaid chart definition. Pass non-empty chart content.");
        }

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
  }, [chartSource]);

  return (
    <figure className="my-4 overflow-x-auto rounded-xl border border-border bg-card p-4 shadow-sm">
      {title ? <figcaption className="mb-3 text-sm font-semibold text-foreground">{title}</figcaption> : null}
      {errorMessage ? (
        <div className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Unable to render Mermaid diagram.</p>
          <p className="mt-1 text-xs">{errorMessage}</p>
          <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs text-foreground">
            <code>{chartSource || "(empty chart source)"}</code>
          </pre>
        </div>
      ) : (
        // The SVG comes from mermaid's renderer output.
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      )}
    </figure>
  );
}
