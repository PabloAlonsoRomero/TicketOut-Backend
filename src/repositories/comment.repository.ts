import { PrismaClient } from '@prisma/client';
import { CreateCommentInput } from '../models';

const prisma = new PrismaClient();

export class CommentRepository {
  static async create(data: CreateCommentInput) {
    return prisma.comment.create({
      data,
      include: {
        author: true
      }
    });
  }

  static async findByTicketId(ticketId: number) {
    return prisma.comment.findMany({
      where: { ticketId },
      include: { author: true },
      orderBy: { createdAt: 'asc' }
    });
  }
}
