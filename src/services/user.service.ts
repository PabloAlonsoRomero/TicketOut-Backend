import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async getById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
  }

  static async create(data: { name: string, username: string, email: string, passwordHash: string, role: Role }) {
    return prisma.user.create({ data });
  }

  static async update(id: number, data: Partial<{ name: string, username: string, email: string, role: Role, isActive: boolean, passwordHash: string }>) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  static async delete(id: number) {
    // In many systems we just deactivate, but let's do real delete or toggle isActive
    return prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }

  static async getAssignableUsers() {
    return prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPERUSER']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}
