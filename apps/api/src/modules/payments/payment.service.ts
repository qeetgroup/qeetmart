import { CreatePaymentDTO, PaymentDTO, PaymentStatus } from '@qeetmart/shared';
import { prisma } from '../../common/prisma.js';

const toPaymentDTO = (payment: {
  id: string;
  orderId: string;
  amount: any; // Decimal from Prisma
  status: PaymentStatus;
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  transactionId: string | null;
  createdAt: Date;
}): PaymentDTO => ({
  id: payment.id,
  orderId: payment.orderId,
  amount: Number(payment.amount),
  status: payment.status,
  method: payment.method,
  transactionId: payment.transactionId ?? undefined,
  createdAt: payment.createdAt,
});

export const paymentService = {
  async getAll(): Promise<PaymentDTO[]> {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return payments.map(toPaymentDTO);
  },

  async getById(id: string): Promise<PaymentDTO | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });
    return payment ? toPaymentDTO(payment) : null;
  },

  async getByOrderId(orderId: string): Promise<PaymentDTO[]> {
    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
    return payments.map(toPaymentDTO);
  },

  async create(data: CreatePaymentDTO): Promise<PaymentDTO> {
    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify payment amount matches order total
    if (Number(order.total) !== data.amount) {
      throw new Error('Payment amount does not match order total');
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        method: data.method,
        status: 'pending',
      },
    });
    return toPaymentDTO(payment);
  },

  async updateStatus(id: string, status: PaymentStatus): Promise<PaymentDTO | null> {
    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
    });
    return toPaymentDTO(payment);
  },
};
