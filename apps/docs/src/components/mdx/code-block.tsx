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
    <div className="my-4 overflow-hidden rounded-xl border border-border bg-[#0e1626] text-slate-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2">
        <span className="font-mono text-xs uppercase tracking-wide text-slate-300">{language}</span>
        <Button
          className="h-7 border-white/25 bg-transparent px-2.5 text-xs text-slate-100 hover:bg-white/10"
          onClick={handleCopy}
          size="sm"
          variant="outline"
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="max-h-[40rem] overflow-auto p-4 text-sm leading-6">
        <code>{code}</code>
      </pre>
      <p aria-live="polite" className="sr-only">
        {copied ? "Code copied to clipboard" : ""}
      </p>
    </div>
  );
}
