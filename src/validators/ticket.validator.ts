import { z } from 'zod';
import { TicketStatus, TicketPriority } from '@/models';

export const createTicketValidator = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(3).max(5000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  category: z.string().optional().default('GENERAL'),
});

export const updateTicketValidator = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(3).max(5000).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.string().optional(),
  assignedToId: z.number().int().positive().optional().nullable(),
});

export const assignTicketValidator = z.object({
  assignedToId: z.number().int().positive(),
});

export type CreateTicketInput = z.infer<typeof createTicketValidator>;
export type UpdateTicketInput = z.infer<typeof updateTicketValidator>;
export type AssignTicketInput = z.infer<typeof assignTicketValidator>;