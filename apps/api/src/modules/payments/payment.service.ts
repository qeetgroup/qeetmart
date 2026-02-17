import { CreatePaymentDTO, PaymentDTO, PaymentStatus } from '@qeetmart/shared';

// TODO: Implement database operations when Prisma is set up
export const paymentService = {
  async getAll(): Promise<PaymentDTO[]> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async getById(_id: string): Promise<PaymentDTO | null> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async getByOrderId(_orderId: string): Promise<PaymentDTO[]> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async create(_data: CreatePaymentDTO): Promise<PaymentDTO> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async updateStatus(_id: string, _status: PaymentStatus): Promise<PaymentDTO | null> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },
};
