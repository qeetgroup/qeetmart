"use client";

import { Children, isValidElement, useMemo, useState } from "react";
import type { ReactNode } from "react";

type CodeBlockProps = {
  children: ReactNode;
};

const getCodeContent = (children: ReactNode): { code: string; language: string } => {
  const child = Children.toArray(children)[0];
  if (!isValidElement(child)) {
    return { code: "", language: "text" };
  }

  const className = (child.props as { className?: string }).className ?? "";
  const language = className.replace("language-", "") || "text";
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
    <div className="code-shell">
      <div className="code-shell-head">
        <span>{language}</span>
        <button className="copy-btn" onClick={handleCopy} type="button">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
