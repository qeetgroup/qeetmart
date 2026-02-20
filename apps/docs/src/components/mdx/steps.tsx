import type { ReactNode } from "react";

type StepsProps = {
  children: ReactNode;
};

type StepProps = {
  title: string;
  children: ReactNode;
};

export function Steps({ children }: StepsProps) {
  return <ol className="my-4 space-y-3">{children}</ol>;
}

export function Step({ title, children }: StepProps) {
  return (
    <li className="min-w-0 overflow-hidden rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-2 min-w-0 text-sm leading-7 text-muted-foreground">{children}</div>
    </li>
  );
}
