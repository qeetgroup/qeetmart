import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
    message?: string;
    className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
    if (!message) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-800 dark:text-red-200 border border-red-200/60 dark:border-red-900/60 animate-shake",
                className
            )}
            role="alert"
            aria-live="polite"
        >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span className="font-medium">{message}</span>
        </div>
    );
}
