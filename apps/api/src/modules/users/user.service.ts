import { CreateUserDTO, UserDTO } from '@qeetmart/shared';
import { prisma } from '../../common/prisma.js';

const toUserDTO = (user: {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'seller';
  createdAt: Date;
  updatedAt: Date;
}): UserDTO => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const userService = {
  async getAll(): Promise<UserDTO[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(toUserDTO);
  },

  async getById(id: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? toUserDTO(user) : null;
  },

  async create(data: CreateUserDTO): Promise<UserDTO> {
    // TODO: Hash password with bcrypt before storing
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password, // Should be hashed
        role: 'customer',
      },
    });
    return toUserDTO(user);
  },

  async update(id: string, data: Partial<CreateUserDTO>): Promise<UserDTO | null> {
    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.password) {
      // TODO: Hash password with bcrypt before storing
      updateData.password = data.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return toUserDTO(user);
  },
};
