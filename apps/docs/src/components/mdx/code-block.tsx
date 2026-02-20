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
  const [copyError, setCopyError] = useState(false);
  const { code, language } = useMemo(() => getCodeContent(children), [children]);
  const lineCount = code ? code.split("\n").length : 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className="code-shell">
      <div className="code-shell-head">
        <span className="code-shell-meta">
          <strong>{language}</strong>
          <span>{lineCount} lines</span>
        </span>
        <button
          aria-live="polite"
          className="copy-btn"
          data-copied={copied ? "true" : "false"}
          onClick={handleCopy}
          type="button"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      {copyError ? (
        <p aria-live="polite" style={{ margin: "0", padding: "0.2rem 0.85rem 0.65rem", color: "#fca5a5", fontSize: "0.75rem" }}>
          Copy failed. Select text manually.
        </p>
      ) : null}
    </div>
  );
}
