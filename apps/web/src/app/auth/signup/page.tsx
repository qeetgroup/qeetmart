import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create an Account - QeetMart",
  description: "Join QeetMart to access premium features, faster checkout, and more.",
};

export default function SignupRoutePage() {
  return <SignupForm />;
}
