import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorClassName?: string;
}

export function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const bounded = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-200", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-brand-600 transition-all duration-500",
          indicatorClassName,
        )}
        style={{ width: `${bounded}%` }}
      />
    </div>
  );
}
