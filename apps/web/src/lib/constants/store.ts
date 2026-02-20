import type { DeliveryMethod, PaymentMethod, SortOption } from "@/types";

export const STORE_NAME = "QeetMart";
export const FREE_SHIPPING_THRESHOLD = 4999;
export const DEFAULT_PAGE_SIZE = 12;

export const SORT_OPTIONS: Array<{ label: string; value: SortOption }> = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Newest", value: "newest" },
];

export const CHECKOUT_STEPS = [
  "Shipping Address",
  "Delivery Method",
  "Payment Method",
  "Review Order",
  "Confirmation",
] as const;

export const DELIVERY_METHODS: Array<{
  id: DeliveryMethod;
  title: string;
  subtitle: string;
  price: number;
}> = [
  {
    id: "standard",
    title: "Standard Delivery",
    subtitle: "3-5 business days",
    price: 0,
  },
  {
    id: "express",
    title: "Express Delivery",
    subtitle: "1-2 business days",
    price: 149,
  },
  {
    id: "same-day",
    title: "Same Day",
    subtitle: "Within 24 hours in eligible cities",
    price: 299,
  },
];

export const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  title: string;
  subtitle: string;
}> = [
  {
    id: "card",
    title: "Card Payment",
    subtitle: "Visa, MasterCard, RuPay",
  },
  {
    id: "upi",
    title: "UPI",
    subtitle: "Google Pay, PhonePe, Paytm",
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    subtitle: "Pay when your order arrives",
  },
];

export const COUPONS: Record<
  string,
  { type: "flat" | "percentage"; value: number; minOrderValue: number }
> = {
  SAVE10: { type: "percentage", value: 10, minOrderValue: 1999 },
  NEWUSER500: { type: "flat", value: 500, minOrderValue: 4999 },
  FREESHIP: { type: "flat", value: 149, minOrderValue: 1499 },
};
