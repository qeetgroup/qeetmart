"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    showStrengthIndicator?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showStrengthIndicator, value, onChange, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        // Simple password strength calculation
        const calculateStrength = (val: string) => {
            if (!val) return 0;
            let score = 0;
            if (val.length >= 8) score += 25;
            if (val.match(/[A-Z]/)) score += 25;
            if (val.match(/[0-9]/)) score += 25;
            if (val.match(/[^A-Za-z0-9]/)) score += 25;
            return score;
        };

        // Cast value to string safely for calculation
        const stringValue = typeof value === "string" ? value : "";
        const strength = calculateStrength(stringValue);

        const getStrengthColor = (score: number) => {
            if (score === 0) return "bg-surface-200";
            if (score <= 25) return "bg-red-500";
            if (score <= 50) return "bg-orange-500";
            if (score <= 75) return "bg-yellow-500";
            return "bg-green-500";
        };

        return (
            <div className="space-y-3">
                <div className="relative group">
                    <Input
                        type={showPassword ? "text" : "password"}
                        className={cn(
                            "pr-10 transition-all duration-200",
                            "focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20",
                            "group-hover:border-surface-300 dark:group-hover:border-surface-600",
                            className
                        )}
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        {...props}
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm p-0.5 transition-colors"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff strokeWidth={2} size={18} /> : <Eye strokeWidth={2} size={18} />}
                    </button>
                </div>

                {showStrengthIndicator && stringValue && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                            <div
                                className={cn("h-full transition-all duration-500 ease-out", getStrengthColor(strength))}
                                style={{ width: `${Math.max(strength, 5)}%` }}
                            />
                        </div>
                        <p className={cn("text-xs text-right font-medium transition-colors duration-300",
                            strength <= 25 ? "text-red-600 dark:text-red-400" :
                                strength === 50 ? "text-orange-600 dark:text-orange-400" :
                                    strength === 75 ? "text-yellow-600 dark:text-yellow-400" :
                                        "text-green-600 dark:text-green-400"
                        )}>
                            {strength <= 25 && "Weak"}
                            {strength === 50 && "Fair"}
                            {strength === 75 && "Good"}
                            {strength === 100 && "Strong"}
                        </p>
                    </div>
                )}
            </div>
        );
    }
);
PasswordInput.displayName = "PasswordInput";
