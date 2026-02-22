"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "./form-error";
import { cn } from "@/lib/utils";

export function VerifyEmailForm() {
    const router = useRouter();
    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>();
    const [shakeKey, setShakeKey] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit if all filled
        if (newCode.every((digit) => digit !== "")) {
            handleSubmitCode(newCode.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
        if (!pastedData) return;

        const newCode = [...code];
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }
        setCode(newCode);

        if (pastedData.length === 6) {
            inputRefs.current[5]?.focus();
            handleSubmitCode(newCode.join(""));
        } else {
            inputRefs.current[pastedData.length]?.focus();
        }
    };

    const handleSubmitCode = async (fullCode: string) => {
        if (fullCode.length !== 6) {
            setErrorMsg("Please enter the 6-digit code");
            setShakeKey((prev) => prev + 1);
            return;
        }

        setErrorMsg(undefined);
        setIsSubmitting(true);

        // Simulate API verification
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (fullCode !== "123456") {
            setErrorMsg("Invalid verification code. Please try again.");
            setShakeKey((prev) => prev + 1);
            setIsSubmitting(false);
            setCode(Array(6).fill(""));
            inputRefs.current[0]?.focus();
            return;
        }

        toast.success("Email verified successfully!");
        router.replace("/");
    };

    const handleResend = () => {
        if (timeLeft > 0) return;
        toast.info("A new code has been sent to your email");
        setTimeLeft(60);
    };

    return (
        <div className="flex flex-col space-y-8 max-w-sm mx-auto w-full">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Verify your email</h2>
                <p className="text-surface-500 dark:text-surface-400">
                    We&apos;ve sent a 6-digit verification code to your email address.
                </p>
            </div>

            <div key={shakeKey} className="space-y-6">
                <FormError message={errorMsg} />

                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <Input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={cn(
                                "w-12 h-14 text-center text-lg font-bold transition-all placeholder:text-surface-300 dark:placeholder:text-surface-600",
                                "focus:ring-[3px] focus:ring-brand-500/20 w-full",
                                digit ? "border-brand-500 bg-brand-50/30 dark:bg-brand-500/10" : "border-surface-200 dark:border-surface-700"
                            )}
                        />
                    ))}
                </div>

                <Button
                    type="button"
                    size="lg"
                    onClick={() => handleSubmitCode(code.join(""))}
                    className="w-full text-base font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    disabled={isSubmitting || code.some((d) => !d)}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            Verify email
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>

            <div className="text-center text-sm font-medium">
                <p className="text-surface-500 dark:text-surface-400">
                    Didn&apos;t receive the code?{" "}
                    <button
                        onClick={handleResend}
                        disabled={timeLeft > 0}
                        className={cn(
                            "font-semibold transition-colors",
                            timeLeft > 0
                                ? "text-surface-400 dark:text-surface-500 cursor-not-allowed"
                                : "text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 hover:underline"
                        )}
                    >
                        {timeLeft > 0 ? `Resend code in ${timeLeft}s` : "Click to resend"}
                    </button>
                </p>
            </div>
        </div>
    );
}
