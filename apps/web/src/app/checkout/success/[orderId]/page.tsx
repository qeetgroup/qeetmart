import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/api/orders-api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderSuccessPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: OrderSuccessPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order ${orderId}`,
    description: "Order confirmation details",
  };
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-black tracking-tight">Order Success</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-surface-700">
          <p>
            Order <span className="font-semibold text-surface-900">#{order.id}</span> was placed successfully.
          </p>
          <p>Total paid: <span className="font-semibold text-surface-900">{formatCurrency(order.total)}</span></p>
          <p>Placed on: {formatDate(order.createdAt)}</p>
          <p>Estimated delivery: {formatDate(order.estimatedDelivery)}</p>

          <div className="grid gap-2 pt-2 sm:grid-cols-2">
            <Button asChild>
              <Link href="/account">Go to Account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
