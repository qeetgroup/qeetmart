import { UpdateInventoryDTO, InventoryDTO } from '@qeetmart/shared';
import { prisma } from '../../common/prisma.js';

const toInventoryDTO = (inventory: {
  productId: string;
  quantity: number;
  reserved: number;
  updatedAt: Date;
}): InventoryDTO => ({
  productId: inventory.productId,
  quantity: inventory.quantity,
  reserved: inventory.reserved,
  available: inventory.quantity - inventory.reserved,
  lastUpdated: inventory.updatedAt,
});

export const inventoryService = {
  async getByProductId(productId: string): Promise<InventoryDTO | null> {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return null;
    }

    // Get or create inventory record
    let inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      // Create inventory record if it doesn't exist
      inventory = await prisma.inventory.create({
        data: {
          productId,
          quantity: product.stock,
          reserved: 0,
        },
      });
    }

    return toInventoryDTO(inventory);
  },

  async update(productId: string, data: UpdateInventoryDTO): Promise<InventoryDTO | null> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return null;
    }

    // Get or create inventory
    const existingInventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    const inventory = await prisma.inventory.upsert({
      where: { productId },
      create: {
        productId,
        quantity: data.quantity ?? product.stock,
        reserved: data.reserved ?? 0,
      },
      update: {
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.reserved !== undefined && { reserved: data.reserved }),
      },
    });

    // Also update product stock to keep in sync
    if (data.quantity !== undefined) {
      await prisma.product.update({
        where: { id: productId },
        data: { stock: data.quantity },
      });
    }

    return toInventoryDTO(inventory);
  },

  async reserve(productId: string, quantity: number): Promise<InventoryDTO | null> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return null;
    }

    // Get or create inventory
    const existingInventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    const currentQuantity = existingInventory?.quantity ?? product.stock;
    const currentReserved = existingInventory?.reserved ?? 0;
    const available = currentQuantity - currentReserved;

    if (available < quantity) {
      throw new Error(`Insufficient inventory. Available: ${available}, Requested: ${quantity}`);
    }

    const inventory = await prisma.inventory.upsert({
      where: { productId },
      create: {
        productId,
        quantity: currentQuantity,
        reserved: quantity,
      },
      update: {
        reserved: { increment: quantity },
      },
    });

    return toInventoryDTO(inventory);
  },

  async release(productId: string, quantity: number): Promise<InventoryDTO | null> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return null;
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!existingInventory || existingInventory.reserved < quantity) {
      throw new Error(`Cannot release more than reserved. Reserved: ${existingInventory?.reserved ?? 0}, Requested: ${quantity}`);
    }

    const inventory = await prisma.inventory.update({
      where: { productId },
      data: {
        reserved: { decrement: quantity },
      },
    });

    return toInventoryDTO(inventory);
  },
};
