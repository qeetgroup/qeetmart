import { CreateProductDTO, UpdateProductDTO, ProductDTO } from '@qeetmart/shared';

// TODO: Implement database operations when Prisma is set up
export const productService = {
  async getAll(): Promise<ProductDTO[]> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async getById(_id: string): Promise<ProductDTO | null> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async create(_data: CreateProductDTO): Promise<ProductDTO> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async update(_id: string, _data: UpdateProductDTO): Promise<ProductDTO | null> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async delete(_id: string): Promise<boolean> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },
};
