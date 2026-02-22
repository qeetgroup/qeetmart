"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { login } from "@/lib/api/auth-api";
import { useSessionStore } from "@/store/session-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "./password-input";
import { SocialLogin } from "./social-login";
import { FormError } from "./form-error";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const setSession = useSessionStore((state) => state.setSession);

  const [email, setEmail] = useState("demo@qeetmart.com");
  const [password, setPassword] = useState("demo123");
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [shakeKey, setShakeKey] = useState(0);

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (response) => {
      setSession(response.token, response.user);
      toast.success("Welcome back!");
      router.replace(redirect);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Invalid email or password";
      setErrorMsg(message);
      setShakeKey((prev) => prev + 1);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields");
      setShakeKey((prev) => prev + 1);
      return;
    }
    setErrorMsg(undefined);
    mutation.mutate();
  };

  return (
    <div className="flex flex-col space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Welcome back</h2>
        <p className="text-surface-500 dark:text-surface-400">Enter your credentials to access your account</p>
      </div>

      <div className="space-y-6">
        <SocialLogin />

        <form
          key={shakeKey}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <FormError message={errorMsg} />

          <div className="space-y-4">
            <div className="space-y-2 group">
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

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-surface-700 dark:text-surface-300 font-medium">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 py-1 text-sm font-medium">
            <Checkbox id="remember" className="rounded-[4px] border-surface-300 dark:border-surface-600" />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-surface-600 dark:text-surface-300 cursor-pointer"
            >
              Remember me for 30 days
            </label>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-base font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
