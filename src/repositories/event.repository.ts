import { PrismaClient } from '@prisma/client';
import { CreateTicketEventInput } from '../models';

const prisma = new PrismaClient();

export class EventRepository {
  static async create(data: CreateTicketEventInput) {
    return prisma.ticketEvent.create({ data });
  }

  static async findByTicketId(ticketId: number, skip: number, take: number) {
    return prisma.ticketEvent.findMany({
      where: { ticketId },
      skip,
      take,
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}