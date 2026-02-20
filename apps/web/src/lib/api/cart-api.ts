import { COUPONS, FREE_SHIPPING_THRESHOLD } from "@/lib/constants/store";
import { delay } from "@/lib/utils";
import type { CartItem, CouponResult, DeliveryEstimate, Product } from "@/types";

export async function validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
  await delay(180);

  const normalized = code.trim().toUpperCase();
  const coupon = COUPONS[normalized];

  if (!coupon) {
    return {
      valid: false,
      code: normalized,
      discountAmount: 0,
      message: "Invalid coupon code.",
    };
  }

  if (subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      code: normalized,
      discountAmount: 0,
      message: `Minimum order value is ₹${coupon.minOrderValue}.`,
    };
  }

  const discountAmount =
    coupon.type === "flat"
      ? coupon.value
      : Math.round((subtotal * coupon.value) / 100);

  return {
    valid: true,
    code: normalized,
    discountAmount,
    message: `${normalized} applied successfully.`,
  };
}

export function calculateSubtotal(items: CartItem[], products: Product[]) {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      return sum;
    }
    return sum + product.price * item.quantity;
  }, 0);
}

export function getShippingCost(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 149;
}

export async function getDeliveryEstimate(postalCode: string): Promise<DeliveryEstimate> {
  await delay(130);

  const baseDays = postalCode.startsWith("56") ? 2 : 4;

  const earliest = new Date();
  earliest.setDate(earliest.getDate() + baseDays);

  const latest = new Date();
  latest.setDate(latest.getDate() + baseDays + 2);

  return {
    earliestDate: earliest.toISOString(),
    latestDate: latest.toISOString(),
  };
}
