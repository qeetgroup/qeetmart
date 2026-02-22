"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { login } from "@/lib/api/auth-api";
import { useSessionStore } from "@/store/session-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const setSession = useSessionStore((state) => state.setSession);

  const [credentials, setCredentials] = useState({
    email: "demo@qeetmart.com",
    password: "demo123",
  });

  const mutation = useMutation({
    mutationFn: () => login(credentials.email, credentials.password),
    onSuccess: (response) => {
      setSession(response.token, response.user);
      toast.success("Logged in successfully");
      router.replace(redirect);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    },
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-black tracking-tight">Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={credentials.email}
            onChange={(event) =>
              setCredentials((previous) => ({
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
            value={credentials.password}
            onChange={(event) =>
              setCredentials((previous) => ({
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
          {mutation.isPending ? "Logging in..." : "Login"}
        </Button>

        <p className="text-sm text-surface-600">
          New to QeetMart?{" "}
          <Link href="/auth/signup" className="font-semibold text-brand-700 hover:text-brand-800">
            Create account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
