import { Request, Response } from 'express';
import { TicketService } from '@/services/ticket.service';
import {
  createTicketValidator,
  updateTicketValidator,
  assignTicketValidator,
} from '@/validators/ticket.validator';

export class TicketController {
  static async create(req: Request, res: Response) {
    try {
      const data = createTicketValidator.parse(req.body);
      const userId = (req as any).userId;

      const ticket = await TicketService.createTicket(data, userId);
      res.status(201).json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const role = (req as any).role;

      const ticket = await TicketService.getTicket(parseInt(String(id)), userId, role);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      const statusCode = error.message.includes('permiso') ? 403 : 404;
      res.status(statusCode).json({ success: false, error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { page = '1', limit = '20', status, priority, category, search, mine } = req.query;
      const userId = (req as any).userId;
      const role = (req as any).role;

      const filters = {
        status: status as string,
        priority: priority as string,
        category: category as string,
        search: search as string,
        mine: mine === 'true',
      };

      const result = await TicketService.listTickets(
        parseInt(String(page)),
        parseInt(String(limit)),
        filters,
        userId,
        role
      );

      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateTicketValidator.parse(req.body);
      const userId = (req as any).userId;
      const role = (req as any).role;

      const ticket = await TicketService.updateTicket(parseInt(String(id)), data, userId, role);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      const statusCode = error.message.includes('permiso') ? 403 : 400;
      res.status(statusCode).json({ success: false, error: error.message });
    }
  }

  static async assign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { assignedToId } = assignTicketValidator.parse(req.body);
      const userId = (req as any).userId;
      const role = (req as any).role;

      const ticket = await TicketService.assignTicket(parseInt(String(id)), assignedToId, userId, role);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      const statusCode = error.message.includes('permiso') ? 403 : 400;
      res.status(statusCode).json({ success: false, error: error.message });
    }
  }
}