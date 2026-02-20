"use client";

import { Children, cloneElement, isValidElement, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type StepsProps = {
  children: ReactNode;
};

type StepProps = {
  title: string;
  children: ReactNode;
  index?: number;
  complete?: boolean;
  onToggle?: () => void;
};

export function Steps({ children }: StepsProps) {
  const pathname = usePathname();
  const steps = useMemo(() => Children.toArray(children).filter(isValidElement) as ReactElement<StepProps>[], [children]);
  const [completeState, setCompleteState] = useState<boolean[]>(() => {
    const emptyState = new Array(steps.length).fill(false);
    if (typeof window === "undefined") {
      return emptyState;
    }

    try {
      const saved = localStorage.getItem(`qeetmart-steps:${pathname}`);
      if (!saved) {
        return emptyState;
      }
      const parsed = JSON.parse(saved) as boolean[];
      return emptyState.map((_, index) => Boolean(parsed[index]));
    } catch {
      return emptyState;
    }
  });
  const normalizedState = useMemo(
    () => new Array(steps.length).fill(false).map((_, index) => Boolean(completeState[index])),
    [completeState, steps.length],
  );

  const completedCount = normalizedState.filter(Boolean).length;
  const progress = steps.length === 0 ? 0 : (completedCount / steps.length) * 100;

  const toggleStep = (index: number) => {
    setCompleteState((state) => {
      const base = new Array(steps.length).fill(false).map((_, currentIndex) => Boolean(state[currentIndex]));
      const next = base.map((value, currentIndex) => (currentIndex === index ? !value : value));
      try {
        localStorage.setItem(`qeetmart-steps:${pathname}`, JSON.stringify(next));
      } catch {
        // Ignore localStorage failures.
      }
      return next;
    });
  };

  return (
    <div>
      <div className="steps-head">
        <p>
          {completedCount}/{steps.length} completed
        </p>
        <div className="steps-track" style={{ ["--steps-progress" as string]: `${progress.toFixed(0)}%` }}>
          <div className="steps-fill" />
        </div>
      </div>
      <ol className="steps">
        {steps.map((step, index) =>
          cloneElement(step, {
            complete: Boolean(normalizedState[index]),
            index: index + 1,
            key: `${step.props.title}-${index}`,
            onToggle: () => toggleStep(index),
          }),
        )}
      </ol>
    </div>
  );
}

export function Step({ title, children, index, complete = false, onToggle }: StepProps) {
  return (
    <li className={`step-item ${complete ? "is-complete" : ""}`}>
      <div className="step-head">
        <p className="step-title">
          {typeof index === "number" ? `${index}. ` : null}
          {title}
        </p>
        {onToggle ? (
          <button className="step-toggle" onClick={onToggle} type="button">
            {complete ? "Done" : "Mark done"}
          </button>
        ) : null}
      </div>
      <div>{children}</div>
    </li>
  );
}
