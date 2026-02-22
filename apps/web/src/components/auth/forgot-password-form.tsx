"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "./form-error";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>();
    const [shakeKey, setShakeKey] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setErrorMsg("Please enter your email address");
            setShakeKey((prev) => prev + 1);
            return;
        }

        setErrorMsg(undefined);
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Check for a basic valid email roughly
        if (!email.includes("@")) {
            setErrorMsg("Please enter a valid email address");
            setShakeKey((prev) => prev + 1);
            setIsSubmitting(false);
            return;
        }

        setIsSuccess(true);
        setIsSubmitting(false);
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-sm mx-auto w-full">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 mb-2">
                        <MailCheck className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Check your email</h2>
                    <p className="text-surface-600 dark:text-surface-400">
                        We sent a password reset link to <br />
                        <span className="font-semibold text-surface-900 dark:text-white">{email}</span>
                    </p>
                </div>

                <div className="space-y-4">
                    <Button
                        type="button"
                        className="w-full text-base font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                        onClick={() => window.open(`mailto:${email}`)}
                    >
                        Open email app
                    </Button>

                    <div className="text-center">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-8 max-w-sm mx-auto w-full">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Reset password</h2>
                <p className="text-surface-500 dark:text-surface-400">
                    Enter your email and we&apos;ll send you instructions to reset your password.
                </p>
            </div>

            <form
                key={shakeKey}
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <FormError message={errorMsg} />

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-surface-700 dark:text-surface-300 font-medium">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="transition-all focus:ring-[3px] focus:ring-brand-500/20"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full text-base font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending instructions...
                        </>
                    ) : (
                        "Send reset link"
                    )}
                </Button>
            </form>

            <div className="text-center">
                <Link
                    href="/auth/login"
                    className="inline-flex items-center text-sm font-semibold text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                </Link>
            </div>
        </div>
    );
}
