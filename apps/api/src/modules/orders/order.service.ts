import { CreateOrderDTO, OrderDTO, OrderStatus, OrderItemDTO, AddressDTO } from '@qeetmart/shared';
import { prisma } from '../../common/prisma.js';

const toOrderItemDTO = (item: {
  productId: string;
  quantity: number;
  price: any; // Decimal from Prisma
  subtotal: any; // Decimal from Prisma
}): OrderItemDTO => ({
  productId: item.productId,
  quantity: item.quantity,
  price: Number(item.price),
  subtotal: Number(item.subtotal),
});

const toAddressDTO = (order: {
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
}): AddressDTO => ({
  street: order.shippingStreet,
  city: order.shippingCity,
  state: order.shippingState,
  zipCode: order.shippingZipCode,
  country: order.shippingCountry,
});

const toOrderDTO = (order: {
  id: string;
  userId: string;
  total: any; // Decimal from Prisma
  status: OrderStatus;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    productId: string;
    quantity: number;
    price: any;
    subtotal: any;
  }>;
}): OrderDTO => ({
  id: order.id,
  userId: order.userId,
  items: order.items.map(toOrderItemDTO),
  total: Number(order.total),
  status: order.status,
  shippingAddress: toAddressDTO(order),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export const orderService = {
  async getAll(): Promise<OrderDTO[]> {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(toOrderDTO);
  },

  async getById(id: string): Promise<OrderDTO | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return order ? toOrderDTO(order) : null;
  },

  async getByUserId(userId: string): Promise<OrderDTO[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(toOrderDTO);
  },

  async create(data: CreateOrderDTO): Promise<OrderDTO> {
    // First, validate products exist and get their prices
    const products = await prisma.product.findMany({
      where: {
        id: { in: data.items.map(item => item.productId) },
      },
    });

    if (products.length !== data.items.length) {
      throw new Error('One or more products not found');
    }

    // Calculate order items with prices
    const orderItems = data.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const price = Number(product.price);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        subtotal: price * item.quantity,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Create order with items in a transaction
    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        total,
        status: 'pending',
        shippingStreet: data.shippingAddress.street,
        shippingCity: data.shippingAddress.city,
        shippingState: data.shippingAddress.state,
        shippingZipCode: data.shippingAddress.zipCode,
        shippingCountry: data.shippingAddress.country,
        items: {
          create: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    return toOrderDTO(order);
  },

  async updateStatus(id: string, status: OrderStatus): Promise<OrderDTO | null> {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    return toOrderDTO(order);
  },
};
