import { nanoid } from "nanoid";
import { mockDb } from "@/lib/api/mock-db";
import { delay } from "@/lib/utils";
import type { DeliveryMethod, Order, PaymentMethod } from "@/types";

interface CreateOrderInput {
  userId: string;
  items: Order["items"];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  shippingAddress: Order["shippingAddress"];
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await delay(420);

  const createdAt = new Date();
  const estimatedDelivery = new Date(createdAt);
  estimatedDelivery.setDate(
    estimatedDelivery.getDate() +
      (input.deliveryMethod === "same-day"
        ? 1
        : input.deliveryMethod === "express"
          ? 2
          : 5),
  );

  const order: Order = {
    id: `ord_${nanoid(10)}`,
    userId: input.userId,
    items: input.items,
    subtotal: input.subtotal,
    discount: input.discount,
    shipping: input.shipping,
    tax: input.tax,
    total: input.total,
    couponCode: input.couponCode,
    shippingAddress: input.shippingAddress,
    deliveryMethod: input.deliveryMethod,
    paymentMethod: input.paymentMethod,
    status: "confirmed",
    createdAt: createdAt.toISOString(),
    estimatedDelivery: estimatedDelivery.toISOString(),
  };

  mockDb.orders.unshift(order);

  return order;
}

export async function getOrdersByUser(userId: string) {
  await delay(260);
  return mockDb.orders.filter((order) => order.userId === userId);
}

export async function getOrderById(orderId: string) {
  await delay(120);
  return mockDb.orders.find((order) => order.id === orderId) ?? null;
}
