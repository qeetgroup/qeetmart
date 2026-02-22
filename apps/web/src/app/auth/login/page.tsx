import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to access checkout, account and wishlist.",
};

export default function LoginRoutePage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <LoginForm />
    </div>
  );
}
