import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login to QeetMart",
  description: "Login securely to access checkout, your account, and wishlist.",
};

export default function LoginRoutePage() {
  return <LoginForm />;
}
