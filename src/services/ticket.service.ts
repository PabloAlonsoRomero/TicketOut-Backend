import { TicketRepository } from '../repositories/ticket.repository';
import { CreateTicketInput, UpdateTicketInput } from '../validators/ticket.validator';
import { PrismaClient, Role } from '@prisma/client';
import { EventRepository } from '../repositories/event.repository';
import { CommentRepository } from '../repositories/comment.repository';
import { EventType } from '../models';

const prisma = new PrismaClient();

export class TicketService {
  // Crear ticket
  static async createTicket(data: CreateTicketInput, createdById: number) {
    const ticket = await TicketRepository.create({
      ...data,
      createdById,
    });

    // Registrar evento
    await EventRepository.create({
      type: EventType.TICKET_CREATED,
      payloadJson: { ticketId: ticket.id },
      ticketId: ticket.id,
      actorId: createdById,
    });

    return ticket;
  }

  // Obtener ticket
  static async getTicket(id: number, userId: number, role: string) {
    const ticket = await TicketRepository.findById(id);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    // Validar acceso: USER solo puede ver sus propios tickets
    if (role === 'USER' && ticket.createdById !== userId) {
      throw new Error('No tienes permiso para acceder a este ticket');
    }

    return ticket;
  }

  // Listar tickets
  static async listTickets(
    page: number = 1,
    limit: number = 20,
    filters: any,
    userId: number,
    role: string
  ) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    let tickets, total;

    if (String(role).toUpperCase() === 'USER') {
      // USERs solo ven sus tickets
      tickets = await TicketRepository.findUserTickets(Number(userId), skip, take);
      total = await prisma.ticket.count({ where: { createdById: Number(userId) } });
    } else {
      // ADMINs ven todos
      tickets = await TicketRepository.findAll(skip, take, {
        ...filters,
        adminId: role === 'ADMIN' ? userId : undefined,
      });
      total = await TicketRepository.count(filters);
    }

    return {
      data: tickets,
      pagination: {
        page,
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    };
  }

  // Actualizar ticket
  static async updateTicket(
    id: number,
    data: UpdateTicketInput,
    userId: number,
    role: string
  ) {
    const ticket = await TicketRepository.findById(id);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    if (role === 'USER' && ticket.createdById !== userId) {
      throw new Error('No tienes permiso para actualizar este ticket');
    }

    // Restricción: Solo el creador (USER) puede modificar título y descripción
    if (role !== 'USER' && (data.title || data.description)) {
       // Si intenta modificar título o descripción siendo admin/superuser, lo ignoramos o lanzamos error
       // Según el requerimiento "un administrador no puede modificar el nombre y la descripción", lanzaremos error
       throw new Error('Los administradores no pueden modificar el título o la descripción del ticket');
    }

    // Verificar que al menos un campo sea diferente
    const hasChanges = Object.entries(data).some(
      ([key, value]) => ticket[key as keyof typeof ticket] !== value
    );

    if (!hasChanges) {
      throw new Error('No hay cambios para aplicar');
    }

    const updated = await TicketRepository.update(id, data);

    // Registrar eventos por cada cambio
    if (data.status && data.status !== ticket.status) {
      await EventRepository.create({
        type: EventType.STATUS_CHANGED,
        payloadJson: { before: ticket.status, after: data.status },
        ticketId: id,
        actorId: userId,
      });
    }

    if (data.priority && data.priority !== ticket.priority) {
      await EventRepository.create({
        type: EventType.PRIORITY_CHANGED,
        payloadJson: { before: ticket.priority, after: data.priority },
        ticketId: id,
        actorId: userId,
      });
    }

    if (data.category && data.category !== ticket.category) {
      await EventRepository.create({
        type: EventType.CATEGORY_CHANGED,
        payloadJson: { before: ticket.category, after: data.category },
        ticketId: id,
        actorId: userId,
      });
    }

    if (data.assignedToId !== undefined && data.assignedToId !== ticket.assignedToId) {
      await EventRepository.create({
        type: EventType.ASSIGNED,
        payloadJson: { assignedToId: data.assignedToId },
        ticketId: id,
        actorId: userId,
      });
    }

    if (data.status === 'CLOSED') {
      await EventRepository.create({
        type: EventType.TICKET_CLOSED,
        payloadJson: { closedAt: new Date() },
        ticketId: id,
        actorId: userId,
      });
    }

    return updated;
  }

  // Asignar ticket
  static async assignTicket(
    id: number,
    assignedToId: number,
    userId: number,
    role: string
  ) {
    const ticket = await TicketRepository.findById(id);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    if (role === 'ADMIN') {
      // ADMIN solo se asigna a sí mismo
      if (userId !== assignedToId) {
        throw new Error('ADMINs solo pueden asignarse a sí mismos');
      }
    } else if (role !== 'SUPERUSER') {
      throw new Error('Solo ADMINs y SUPERUSERs pueden asignar tickets');
    }

    // Verificar que el usuario existe y es ADMIN
    const targetUser = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (!targetUser || targetUser.role === 'USER') {
      throw new Error('El usuario asignado no es un ADMIN válido');
    }

    const updated = await TicketRepository.assignTicket(id, assignedToId);

    // Registrar evento
    await EventRepository.create({
      type: EventType.ASSIGNED,
      payloadJson: { assignedToId },
      ticketId: id,
      actorId: userId,
    });

    return updated;
  }

  // Agregar comentario
  static async addComment(
    ticketId: number,
    body: string,
    isInternal: boolean,
    userId: number,
    role: string
  ) {
    const ticket = await TicketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    // Si es nota interna, validar rol (solo ADMIN/SUPERUSER)
    if (isInternal && role === 'USER') {
      throw new Error('No tienes permiso para agregar notas internas');
    }

    const comment = await CommentRepository.create({
      body,
      isInternal,
      ticketId,
      authorId: userId
    });

    // Registrar evento de comentario
    await EventRepository.create({
      type: EventType.COMMENT_ADDED,
      payloadJson: { isInternal },
      ticketId,
      actorId: userId
    });

    return comment;
  }

  static async getStats(userId: number, role: string) {
    // Por ahora las estadísticas son globales para admins
    // Si fuera USER, tal vez ver solo sus stats, pero dashboard suele ser para admins
    if (role === 'USER') {
      throw new Error('No tienes permiso para ver estadísticas globales');
    }
    return TicketRepository.getStats();
  }

  static async getLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [events, total] = await Promise.all([
      EventRepository.findAll(skip, take),
      EventRepository.count(),
    ]);

    return {
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}