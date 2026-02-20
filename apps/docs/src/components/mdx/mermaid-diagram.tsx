"use client";

import { isValidElement, type ReactNode, useEffect, useMemo, useState } from "react";

type MermaidDiagramProps = {
  chart?: unknown;
  title?: string;
  children?: ReactNode;
};

let mermaidInitialized = false;
let mermaidConfiguredTheme: "dark" | "default" | null = null;

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
    // Preserve statement boundaries when MDX splits text into multiple nodes.
    return value.map(extractText).join("\n");
  }

  if (isValidElement(value)) {
    return extractText((value.props as { children?: unknown }).children);
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const chunks: string[] = [];
    if ("value" in objectValue) {
      chunks.push(extractText(objectValue.value));
    }
    if ("children" in objectValue) {
      chunks.push(extractText(objectValue.children));
    }
    if ("props" in objectValue) {
      chunks.push(extractText((objectValue.props as { children?: unknown }).children));
    }
    const combined = chunks.filter(Boolean).join("\n").trim();
    if (combined) {
      return combined;
    }
  }

  return "";
};

const normalizeLineEndings = (source: string) => source.replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").trim();

const repairCollapsedStatements = (source: string) => {
  if (!source) {
    return source;
  }

  return source
    .replace(/(-->[^\n;]*?)(subgraph\b)/g, "$1\n$2")
    .replace(/(\bend)(?=subgraph\b)/g, "$1\n")
    .replace(/(\bend)(?=[A-Za-z_][A-Za-z0-9_]*\s*(?:-->|-.+->))/g, "$1\n");
};

const normalizeChartSource = (input: MermaidDiagramProps["chart"], children: ReactNode): string => {
  const candidates = [extractText(input), extractText(children)]
    .map(normalizeLineEndings)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (candidates.length === 0) {
    return "";
  }

  return repairCollapsedStatements(candidates[0]);
};

export function MermaidDiagram({ chart, title, children }: MermaidDiagramProps) {
  const [svg, setSvg] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const chartSource = useMemo(() => normalizeChartSource(chart, children), [chart, children]);

  useEffect(() => {
    const root = document.documentElement;
    const resolveTheme = () => {
      const theme = root.getAttribute("data-resolved-theme");
      setResolvedTheme(theme === "dark" ? "dark" : "light");
    };

    resolveTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "data-resolved-theme") {
          resolveTheme();
          break;
        }
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-resolved-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isActive = true;

    const render = async () => {
      setErrorMessage(null);
      setSvg("");

      try {
        const renderId = getRenderId();
        let normalizedChart = chartSource.trim();
        if (!normalizedChart) {
          throw new Error("Missing Mermaid chart definition. Pass non-empty chart content.");
        }

        const mermaid = (await import("mermaid")).default;
        const targetTheme = resolvedTheme === "dark" ? "dark" : "default";
        if (!mermaidInitialized || mermaidConfiguredTheme !== targetTheme) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "loose",
            theme: targetTheme,
            flowchart: {
              useMaxWidth: true,
            },
          });
          mermaidInitialized = true;
          mermaidConfiguredTheme = targetTheme;
        }

        try {
          await mermaid.parse(normalizedChart);
        } catch (parseError) {
          const repairedChart = repairCollapsedStatements(normalizedChart);
          if (repairedChart && repairedChart !== normalizedChart) {
            await mermaid.parse(repairedChart);
            normalizedChart = repairedChart;
          } else {
            throw parseError;
          }
        }

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
  }, [chartSource, resolvedTheme]);

  return (
    <figure className="my-4 w-full overflow-x-auto rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
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
        <div
          className="[&_svg]:h-auto [&_svg]:min-w-[38rem] [&_svg]:w-full sm:[&_svg]:min-w-0"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </figure>
  );
}
