import { User } from './user.model';
import { RefreshToken } from './refresh-token.model';
import { Ticket } from './ticket.model';
import { Comment } from './comment.model';
import { TicketEvent } from './ticket-event.model';

export interface UserWithRelations extends User {
  refreshTokens?: RefreshToken[];
  createdTickets?: Ticket[];
  assignedTickets?: Ticket[];
  comments?: Comment[];
  events?: TicketEvent[];
}

export interface TicketWithRelations extends Ticket {
  createdBy?: User;
  assignedTo?: User | null;
  comments?: Comment[];
  events?: TicketEvent[];
}

export interface CommentWithRelations extends Comment {
  ticket?: Ticket;
  author?: User;
}

export interface TicketEventWithRelations extends TicketEvent {
  ticket?: Ticket;
  actor?: User;
}
