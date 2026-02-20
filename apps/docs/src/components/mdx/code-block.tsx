"use client";

import { Children, isValidElement, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type CodeBlockProps = {
  children: ReactNode;
};

const getCodeContent = (children: ReactNode): { code: string; language: string } => {
  const child = Children.toArray(children)[0];
  if (!isValidElement(child)) {
    return { code: "", language: "text" };
  }

  const className = (child.props as { className?: string }).className ?? "";
  const match = className.match(/language-([\w-]+)/);
  const language = match ? match[1] : "text";
  const raw = (child.props as { children?: string | string[] }).children;
  const code = Array.isArray(raw) ? raw.join("") : String(raw ?? "");

  return { code: code.replace(/\n$/, ""), language };
};

export function CodeBlock({ children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { code, language } = useMemo(() => getCodeContent(children), [children]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-4 max-w-full overflow-hidden rounded-xl border border-border bg-[#0e1626] text-slate-100 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-white/10 bg-white/5 px-3 py-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-slate-300 sm:text-xs">{language}</span>
        <Button
          className="h-7 self-start border-white/25 bg-transparent px-2.5 text-xs text-slate-100 hover:bg-white/10 min-[420px]:self-auto"
          onClick={handleCopy}
          size="sm"
          variant="outline"
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="max-h-[40rem] max-w-full overflow-auto whitespace-pre-wrap break-words p-3 text-xs leading-6 sm:p-4 sm:text-sm sm:whitespace-pre sm:break-normal">
        <code>{code}</code>
      </pre>
      <p aria-live="polite" className="sr-only">
        {copied ? "Code copied to clipboard" : ""}
      </p>
    </div>
  );
}
