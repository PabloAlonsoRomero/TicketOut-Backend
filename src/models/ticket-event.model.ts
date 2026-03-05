import { EventType } from './event-type.enum';

export interface TicketEvent {
  id: number;
  type: EventType;
  payloadJson: Record<string, any>;
  ticketId: number;
  actorId: number;
  createdAt: Date;
}

export type CreateTicketEventInput = Omit<TicketEvent, 'id' | 'createdAt'>;
