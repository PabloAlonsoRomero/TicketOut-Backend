import { TicketStatus } from './ticket-status.enum';
import { TicketPriority } from './ticket-priority.enum';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdById: number;
  assignedToId: number | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

export type CreateTicketInput = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTicketInput = Partial<Omit<Ticket, 'id' | 'createdById' | 'createdAt'>>;
