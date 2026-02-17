import { CreateProductDTO, UpdateProductDTO, ProductDTO } from '@qeetmart/shared';
import { prisma } from '../../common/prisma.js';

const toProductDTO = (product: {
  id: string;
  name: string;
  description: string;
  price: any; // Decimal from Prisma
  stock: number;
  categoryId: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ProductDTO => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: Number(product.price),
  stock: product.stock,
  categoryId: product.categoryId,
  imageUrl: product.imageUrl ?? undefined,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const productService = {
  async getAll(): Promise<ProductDTO[]> {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return products.map(toProductDTO);
  },

  async getById(id: string): Promise<ProductDTO | null> {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return product ? toProductDTO(product) : null;
  },

  async create(data: CreateProductDTO): Promise<ProductDTO> {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
      },
    });
    return toProductDTO(product);
  },

  async update(id: string, data: UpdateProductDTO): Promise<ProductDTO | null> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
    });
    return toProductDTO(product);
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  },
};
