import type { Metadata } from "next";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata: Metadata = {
    title: "Verify Email - QeetMart",
    description: "Verify your email address.",
};

export default function VerifyEmailRoutePage() {
    return <VerifyEmailForm />;
}
