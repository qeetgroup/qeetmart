import { cn } from "@/lib/utils";

interface CheckoutStepperProps {
  steps: readonly string[];
  currentStep: number;
}

export function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => {
        const stepIndex = index + 1;
        const active = stepIndex === currentStep;
        const complete = stepIndex < currentStep;

        return (
          <li
            key={step}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs sm:text-sm",
              active
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : complete
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-surface-200 bg-white text-surface-600",
            )}
          >
            <p className="font-semibold">Step {stepIndex}</p>
            <p>{step}</p>
          </li>
        );
      })}
    </ol>
  );
}
