import { CreateUserDTO, UserDTO } from '@qeetmart/shared';

// TODO: Implement database operations when Prisma is set up
export const userService = {
  async getAll(): Promise<UserDTO[]> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async getById(_id: string): Promise<UserDTO | null> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async create(_data: CreateUserDTO): Promise<UserDTO> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },

  async update(_id: string, _data: Partial<CreateUserDTO>): Promise<UserDTO | null> {
    // TODO: Replace with Prisma query
    throw new Error('Database not configured. Please set up Prisma first.');
  },
};
