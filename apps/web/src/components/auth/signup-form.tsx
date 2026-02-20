"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { signup } from "@/lib/api/auth-api";
import { useSessionStore } from "@/store/session-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: () => signup(values.name, values.email, values.password),
    onSuccess: (response) => {
      setSession(response.token, response.user);
      toast.success("Account created");
      router.replace("/");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast.error(message);
    },
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-black tracking-tight">Create Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                email: event.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={values.password}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                password: event.target.value,
              }))
            }
          />
        </div>

        <Button
          className="w-full"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating account..." : "Create Account"}
        </Button>

        <p className="text-sm text-surface-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
