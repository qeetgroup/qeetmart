import type { ReactNode } from "react";

type CalloutProps = {
  title?: string;
  tone?: "info" | "warning" | "success" | "critical";
  children: ReactNode;
};

const toneIcon: Record<NonNullable<CalloutProps["tone"]>, string> = {
  info: "i",
  warning: "!",
  success: "✓",
  critical: "×",
};

export function Callout({ title, tone = "info", children }: CalloutProps) {
  return (
    <aside className={`callout callout-${tone}`}>
      {title ? (
        <div className="callout-head">
          <span aria-hidden="true" className="callout-icon">
            {toneIcon[tone]}
          </span>
          <p className="callout-title">{title}</p>
        </div>
      ) : null}
      <div>{children}</div>
    </aside>
  );
}
