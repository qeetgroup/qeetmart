"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { createOrder } from "@/lib/api/orders-api";
import { getProductsByIds } from "@/lib/api/products-api";
import {
  calculateSubtotal,
  getShippingCost,
  validateCoupon,
} from "@/lib/api/cart-api";
import {
  CHECKOUT_STEPS,
  DELIVERY_METHODS,
  PAYMENT_METHODS,
} from "@/lib/constants/store";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { useCartStore } from "@/store/cart-store";
import { useSessionStore } from "@/store/session-store";
import { AuthGuard } from "@/components/common/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckoutStepper } from "@/components/checkout/checkout-stepper";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  line1: z.string().min(4, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().regex(/^\d{6}$/, "Valid 6-digit pincode required"),
  country: z.string().min(2),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, "Enter a valid phone number"),
});

export function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [confirmedEstimate, setConfirmedEstimate] = useState<string | null>(null);
  const { trackEvent } = useTrackEvent();

  const session = useSessionStore((state) => state.user);
  const upsertAddress = useSessionStore((state) => state.upsertAddress);

  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const clearCart = useCartStore((state) => state.clearCart);

  const [shippingAddress, setShippingAddress] = useState({
    id: `addr_${nanoid(6)}`,
    fullName: session?.addresses[0]?.fullName ?? session?.name ?? "",
    line1: session?.addresses[0]?.line1 ?? "",
    line2: session?.addresses[0]?.line2 ?? "",
    city: session?.addresses[0]?.city ?? "",
    state: session?.addresses[0]?.state ?? "",
    postalCode: session?.addresses[0]?.postalCode ?? "",
    country: session?.addresses[0]?.country ?? "India",
    phone: session?.addresses[0]?.phone ?? "",
    isDefault: true,
  });
  const [deliveryMethod, setDeliveryMethod] = useState<(typeof DELIVERY_METHODS)[number]["id"]>("standard");
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  const productIds = useMemo(() => items.map((item) => item.productId), [items]);

  const { data: products = [] } = useQuery({
    queryKey: queryKeys.cartProducts(productIds),
    queryFn: () => getProductsByIds(productIds),
    enabled: productIds.length > 0,
  });

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const subtotal = calculateSubtotal(items, products);

  const couponMutation = useMutation({
    mutationFn: (code: string) => validateCoupon(code, subtotal),
  });

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      setConfirmedOrderId(order.id);
      setConfirmedEstimate(order.estimatedDelivery);
      setStep(5);
      upsertAddress(shippingAddress);
      clearCart();
      trackEvent("order_completed", {
        orderId: order.id,
        total: order.total,
      });
      toast.success("Order placed successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to place order";
      toast.error(message);
    },
  });

  const discount =
    couponMutation.data?.valid
      ? couponMutation.data.discountAmount
      : couponCode
        ? Math.round(subtotal * 0.1)
        : 0;
  const shipping =
    (DELIVERY_METHODS.find((method) => method.id === deliveryMethod)?.price ?? 0) +
    getShippingCost(subtotal - discount);
  const tax = Math.round((subtotal - discount) * 0.12);
  const total = Math.max(subtotal - discount + shipping + tax, 0);

  const canContinue = () => {
    if (step === 1) {
      const result = shippingSchema.safeParse(shippingAddress);
      if (!result.success) {
        const nextErrors = Object.fromEntries(
          result.error.issues.map((issue) => [issue.path[0], issue.message]),
        );
        setErrors(nextErrors);
        return false;
      }

      setErrors({});
      return true;
    }

    if (step === 3) {
      if (paymentMethod === "card") {
        if (!paymentDetails.cardName || paymentDetails.cardNumber.length < 12 || !paymentDetails.expiry || paymentDetails.cvv.length < 3) {
          toast.error("Enter valid card details");
          return false;
        }
      }

      if (paymentMethod === "upi" && !paymentDetails.upiId.includes("@")) {
        toast.error("Enter valid UPI ID");
        return false;
      }
    }

    return true;
  };

  const placeOrder = () => {
    if (!session) {
      toast.error("Please login to continue");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    orderMutation.mutate({
      userId: session.id,
      items: items
        .map((item) => {
          const product = productMap.get(item.productId);
          if (!product) {
            return null;
          }

          return {
            productId: product.id,
            title: product.title,
            quantity: item.quantity,
            price: product.price,
            image: product.images[0],
            variantSelections: item.variantSelections,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
      subtotal,
      discount,
      shipping,
      tax,
      total,
      couponCode: couponCode || couponMutation.data?.code,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
    });
  };

  useEffect(() => {
    trackEvent("checkout_step_view", {
      step,
    });
  }, [step, trackEvent]);

  return (
    <AuthGuard>
      <div className="container mx-auto space-y-6 px-4 py-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-surface-900 md:text-3xl">
            Checkout
          </h1>
          <p className="text-sm text-surface-600">
            Secure multi-step checkout with address validation and mock payment flow.
          </p>
        </div>

        <CheckoutStepper steps={CHECKOUT_STEPS} currentStep={step} />

        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          <section className="space-y-4">
            {step === 1 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {([
                    ["fullName", "Full Name"],
                    ["phone", "Phone Number"],
                    ["line1", "Address Line 1"],
                    ["line2", "Address Line 2"],
                    ["city", "City"],
                    ["state", "State"],
                    ["postalCode", "Postal Code"],
                    ["country", "Country"],
                  ] as const).map(([key, label]) => (
                    <div key={key} className={key === "line1" || key === "line2" ? "sm:col-span-2" : ""}>
                      <Label htmlFor={key}>{label}</Label>
                      {key === "line2" ? (
                        <Textarea
                          id={key}
                          value={shippingAddress[key] ?? ""}
                          onChange={(event) =>
                            setShippingAddress((previous) => ({
                              ...previous,
                              [key]: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        <Input
                          id={key}
                          value={shippingAddress[key] ?? ""}
                          onChange={(event) =>
                            setShippingAddress((previous) => ({
                              ...previous,
                              [key]: event.target.value,
                            }))
                          }
                        />
                      )}
                      {errors[key] ? <p className="mt-1 text-xs text-red-600">{errors[key]}</p> : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {step === 2 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {DELIVERY_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-surface-200 px-4 py-3 hover:border-brand-300"
                    >
                      <div>
                        <p className="font-semibold text-surface-900">{method.title}</p>
                        <p className="text-sm text-surface-600">{method.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-surface-900">
                          {method.price === 0 ? "Free" : formatCurrency(method.price)}
                        </p>
                        <input
                          type="radio"
                          checked={deliveryMethod === method.id}
                          onChange={() => setDeliveryMethod(method.id)}
                        />
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {step === 3 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-surface-200 px-4 py-3 hover:border-brand-300"
                    >
                      <div>
                        <p className="font-semibold text-surface-900">{method.title}</p>
                        <p className="text-sm text-surface-600">{method.subtitle}</p>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                      />
                    </label>
                  ))}

                  {paymentMethod === "card" ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label>Cardholder Name</Label>
                        <Input
                          value={paymentDetails.cardName}
                          onChange={(event) =>
                            setPaymentDetails((previous) => ({
                              ...previous,
                              cardName: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Card Number</Label>
                        <Input
                          value={paymentDetails.cardNumber}
                          onChange={(event) =>
                            setPaymentDetails((previous) => ({
                              ...previous,
                              cardNumber: event.target.value.replace(/[^\d]/g, "").slice(0, 16),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Expiry</Label>
                        <Input
                          placeholder="MM/YY"
                          value={paymentDetails.expiry}
                          onChange={(event) =>
                            setPaymentDetails((previous) => ({
                              ...previous,
                              expiry: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input
                          value={paymentDetails.cvv}
                          onChange={(event) =>
                            setPaymentDetails((previous) => ({
                              ...previous,
                              cvv: event.target.value.replace(/[^\d]/g, "").slice(0, 4),
                            }))
                          }
                        />
                      </div>
                    </div>
                  ) : null}

                  {paymentMethod === "upi" ? (
                    <div>
                      <Label>UPI ID</Label>
                      <Input
                        placeholder="yourname@upi"
                        value={paymentDetails.upiId}
                        onChange={(event) =>
                          setPaymentDetails((previous) => ({
                            ...previous,
                            upiId: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {step === 4 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Review Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {items.map((item) => {
                      const product = productMap.get(item.productId);
                      if (!product) {
                        return null;
                      }

                      return (
                        <div
                          key={item.productId}
                          className="grid grid-cols-[56px,1fr,auto] items-center gap-3 rounded-lg border border-surface-200 p-2"
                        >
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            width={56}
                            height={56}
                            className="rounded-md border border-surface-200 object-cover"
                          />
                          <div>
                            <p className="line-clamp-1 text-sm font-medium text-surface-900">
                              {product.title}
                            </p>
                            <p className="text-xs text-surface-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-surface-900">
                            {formatCurrency(product.price * item.quantity)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm text-surface-700">
                    <p className="font-semibold text-surface-900">Shipping to:</p>
                    <p>
                      {shippingAddress.fullName}, {shippingAddress.line1}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
                    </p>
                    <p className="mt-1">Phone: {shippingAddress.phone}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkout-coupon">Coupon</Label>
                    <div className="flex gap-2">
                      <Input
                        id="checkout-coupon"
                        placeholder="SAVE10"
                        value={couponCode}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!couponCode) {
                            toast.info("Apply coupon on cart page to use it here");
                            return;
                          }

                          couponMutation.mutate(couponCode);
                        }}
                      >
                        Revalidate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {step === 5 && confirmedOrderId ? (
              <Card>
                <CardHeader>
                  <CardTitle>Order Confirmed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-surface-700">
                    Order <span className="font-semibold text-surface-900">#{confirmedOrderId}</span> has been placed successfully.
                  </p>
                  <p className="text-sm text-surface-700">
                    Estimated delivery by{" "}
                    {confirmedEstimate
                      ? formatDate(confirmedEstimate)
                      : "soon"}
                    .
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/checkout/success/${confirmedOrderId}`}>
                        Open Success Page
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/account">View Orders</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {step < 5 ? (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  disabled={step === 1}
                  onClick={() => setStep((current) => Math.max(1, current - 1))}
                >
                  Back
                </Button>

                {step < 4 ? (
                  <Button
                    onClick={() => {
                      if (canContinue()) {
                        trackEvent("checkout_step_complete", {
                          step,
                        });
                        setStep((current) => Math.min(4, current + 1));
                      }
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button onClick={placeOrder} disabled={orderMutation.isPending}>
                    {orderMutation.isPending ? "Placing Order..." : "Place Order"}
                  </Button>
                )}
              </div>
            ) : null}
          </section>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-surface-700">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-surface-200 pt-3 text-base font-bold text-surface-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AuthGuard>
  );
}
