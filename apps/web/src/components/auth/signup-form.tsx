"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { signup } from "@/lib/api/auth-api";
import { useSessionStore } from "@/store/session-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "./password-input";
import { SocialLogin } from "./social-login";
import { FormError } from "./form-error";

export function SignupForm() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [shakeKey, setShakeKey] = useState(0);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const mutation = useMutation({
    mutationFn: () => signup(formData.email, formData.password, `${formData.firstName} ${formData.lastName}`.trim()),
    onSuccess: (response) => {
      setSession(response.token, response.user);
      toast.success("Account created successfully!");
      router.replace("/");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Signup failed";
      setErrorMsg(message);
      setShakeKey((prev) => prev + 1);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setErrorMsg("Please fill in all fields");
      setShakeKey((prev) => prev + 1);
      return;
    }
    if (!agreed) {
      setErrorMsg("You must agree to the terms and privacy policy");
      setShakeKey((prev) => prev + 1);
      return;
    }
    if (formData.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      setShakeKey((prev) => prev + 1);
      return;
    }
    setErrorMsg(undefined);
    mutation.mutate();
  };

  return (
    <div className="flex flex-col space-y-8 max-w-sm mx-auto w-full pb-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Create an account</h2>
        <p className="text-surface-500 dark:text-surface-400">Join thousands of premium shoppers today.</p>
      </div>

      <div className="space-y-6">
        <SocialLogin />

        <form
          key={shakeKey}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <FormError message={errorMsg} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-surface-700 dark:text-surface-300 font-medium">First name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className="transition-all focus:ring-[3px] focus:ring-brand-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-surface-700 dark:text-surface-300 font-medium">Last name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className="transition-all focus:ring-[3px] focus:ring-brand-500/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-surface-700 dark:text-surface-300 font-medium">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="transition-all focus:ring-[3px] focus:ring-brand-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-surface-700 dark:text-surface-300 font-medium">Password</Label>
            <PasswordInput
              id="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              showStrengthIndicator
              required
            />
          </div>

          <div className="flex items-start space-x-2 py-2">
            <Checkbox
              id="terms"
              className="mt-0.5 rounded-[4px] border-surface-300 dark:border-surface-600"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-surface-600 dark:text-surface-300 leading-snug cursor-pointer select-none"
            >
              I agree to the{" "}
              <Link href="/terms" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">
                Privacy Policy
              </Link>.
            </label>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-base font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-brand-600 hover:bg-brand-700 text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
