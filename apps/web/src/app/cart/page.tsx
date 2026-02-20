import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "Cart",
  description: "Manage cart items, coupons and order summary before checkout.",
};

export default function CartRoutePage() {
  return <CartPage />;
}
