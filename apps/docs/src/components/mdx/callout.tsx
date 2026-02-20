import type { ReactNode } from "react";

type CalloutProps = {
  title?: string;
  tone?: "info" | "warning" | "success";
  children: ReactNode;
};

export function Callout({ title, tone = "info", children }: CalloutProps) {
  return (
    <aside className={`callout callout-${tone}`}>
      {title ? <p className="callout-title">{title}</p> : null}
      <div>{children}</div>
    </aside>
  );
}
