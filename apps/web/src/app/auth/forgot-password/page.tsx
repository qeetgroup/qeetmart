import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
    title: "Forgot Password - QeetMart",
    description: "Reset your QeetMart account password.",
};

export default function ForgotPasswordRoutePage() {
    return <ForgotPasswordForm />;
}
