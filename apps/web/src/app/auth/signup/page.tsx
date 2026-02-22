import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Signup",
  description: "Create a QeetMart account.",
};

export default function SignupRoutePage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <SignupForm />
    </div>
  );
}
