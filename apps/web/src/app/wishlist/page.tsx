import type { Metadata } from "next";
import { WishlistPage } from "@/components/account/wishlist-page";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Save your favorite products and buy them later.",
};

export default function WishlistRoutePage() {
  return <WishlistPage />;
}
