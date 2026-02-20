import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your profile, orders, addresses and wishlist.",
};

export default function AccountRoutePage() {
  return <AccountDashboard />;
}
