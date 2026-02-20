import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CalloutProps = {
  title?: string;
  tone?: "info" | "warning" | "success";
  children: ReactNode;
};

export function Callout({ title, tone = "info", children }: CalloutProps) {
  const toneClasses = {
    info: "border-primary/30 bg-accent/40",
    warning: "border-warning/35 bg-warning/10",
    success: "border-success/35 bg-success/10",
  };

  return (
    <aside className={cn("my-4 rounded-lg border px-4 py-3", toneClasses[tone])}>
      {title ? <p className="mb-1 text-sm font-semibold text-foreground">{title}</p> : null}
      <div className="text-sm leading-7 text-muted-foreground">{children}</div>
    </aside>
  );
}
