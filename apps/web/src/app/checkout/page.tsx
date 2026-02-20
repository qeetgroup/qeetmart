import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order with secure multi-step checkout.",
};

export default function CheckoutRoutePage() {
  return <CheckoutPage />;
}
