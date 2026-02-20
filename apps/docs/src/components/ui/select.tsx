import * as React from "react";
import { cn } from "@/lib/utils";

type SelectOption = {
  label: string;
  value: string;
};

type NativeSelectProps = {
  label: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export function NativeSelect({ label, options, value, onValueChange, className }: NativeSelectProps) {
  const selectId = React.useId();

  return (
    <label
      className={cn(
        "inline-flex h-9 w-full min-w-0 items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 min-[640px]:w-auto",
        className,
      )}
      htmlFor={selectId}
    >
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px]">{label}</span>
      <div className="relative min-w-0 flex-1">
        <select
          className="h-7 w-full appearance-none rounded-sm bg-transparent pr-5 text-xs text-foreground outline-none sm:text-sm"
          id={selectId}
          onChange={(event) => onValueChange(event.target.value)}
          value={value}
        >
          {options.map((option) => (
            <option className="text-foreground" key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute right-0.5 top-1.5 text-[11px] text-muted-foreground">
          ▾
        </span>
      </div>
    </label>
  );
}
