import { PrismaClient, TicketStatus, TicketPriority } from '@prisma/client';
import { CreateTicketInput, UpdateTicketInput } from '../validators/ticket.validator';

const prisma = new PrismaClient();

export class TicketRepository {
  // Crear ticket
  static async create(data: CreateTicketInput & { createdById: number }) {
    return prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority as TicketPriority,
        category: data.category,
        createdById: data.createdById,
        status: 'OPEN' as TicketStatus,
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });
  }

  // Obtener ticket por ID
  static async findById(id: number) {
    return prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedTo: true,
        comments: { orderBy: { createdAt: 'asc' } },
        events: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
  }

  // Obtener todos los tickets del usuario (role USER)
  static async findUserTickets(userId: number, skip: number, take: number) {
    return prisma.ticket.findMany({
      where: { createdById: userId },
      skip,
      take,
      include: { createdBy: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener todos los tickets (role ADMIN)
  static async findAll(skip: number, take: number, filters?: any) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters?.mine && filters.adminId) {
      where.assignedToId = filters.adminId;
    }

    return prisma.ticket.findMany({
      where,
      skip,
      take,
      include: { createdBy: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Actualizar ticket
  static async update(id: number, data: UpdateTicketInput) {
    return prisma.ticket.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.status && { status: data.status as TicketStatus }),
        ...(data.priority && { priority: data.priority as TicketPriority }),
        ...(data.category && { category: data.category }),
        ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
        ...(data.status === 'CLOSED' && { closedAt: new Date() }),
      },
      include: { createdBy: true, assignedTo: true },
    });
  }

  // Asignar ticket a un admin
  static async assignTicket(id: number, assignedToId: number) {
    return prisma.ticket.update({
      where: { id },
      data: { assignedToId },
      include: { createdBy: true, assignedTo: true },
    });
  }

  // Contar total de tickets (para paginación)
  static async count(filters?: any) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;

    return prisma.ticket.count({ where });
  }
}