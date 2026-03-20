import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import {
  createTicketValidator,
  updateTicketValidator,
  assignTicketValidator,
} from '../validators/ticket.validator';
import { AuthRequest } from '../middlewares/auth.middleware';

export class TicketController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const data = createTicketValidator.parse(req.body);
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const ticket = await TicketService.createTicket(data, userId);
      res.status(201).json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const role = req.user?.role;
      if (!userId || !role) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const numericId = parseInt(String(id));
      if (isNaN(numericId)) {
        return res.status(400).json({ success: false, error: `ID de ticket inválido: ${id}` });
      }

      const ticket = await TicketService.getTicket(numericId, userId, role);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      const statusCode = error.message.includes('permiso') ? 403 : 404;
      res.status(statusCode).json({ success: false, error: error.message });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const { page = '1', limit = '20', status, priority, category, search, mine } = req.query;
      const userId = req.user?.id;
      const role = req.user?.role;
      if (!userId || !role) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

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

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = updateTicketValidator.parse(req.body);
      const userId = req.user?.id;
      const role = req.user?.role;
      if (!userId || !role) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const ticket = await TicketService.updateTicket(parseInt(String(id)), data, userId, role);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      const statusCode = error.message.includes('permiso') ? 403 : 400;
      res.status(statusCode).json({ success: false, error: error.message });
    }
  }

  static async assign(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { assignedToId } = assignTicketValidator.parse(req.body);
      const userId = req.user?.id;
      const role = req.user?.role;
      if (!userId || !role) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const ticket = await TicketService.assignTicket(parseInt(String(id)), assignedToId, userId, role);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      const statusCode = error.message.includes('permiso') ? 403 : 400;
      res.status(statusCode).json({ success: false, error: error.message });
    }
  }

  static async addComment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { body, isInternal = false } = req.body;
      const userId = req.user?.id;
      const role = req.user?.role;
      if (!userId || !role) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      if (!body) {
        return res.status(400).json({ success: false, error: 'El cuerpo del comentario es requerido' });
      }

      const comment = await TicketService.addComment(parseInt(String(id)), body, isInternal, userId, role);
      res.status(201).json({ success: true, data: comment });
    } catch (error: any) {
      const statusCode = error.message.includes('permiso') ? 403 : 400;
      res.status(statusCode).json({ success: false, error: error.message });
    }
  }

  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      console.log('GET /api/tickets/stats - Solicitado por:', req.user?.email);
      const userId = req.user?.id;
      const role = req.user?.role;
      if (!userId || !role) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const stats = await TicketService.getStats(userId, role);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Error GET /api/tickets/stats:', error.message);
      const statusCode = error.message.includes('permiso') ? 403 : 500;
      res.status(statusCode).json({ success: false, error: error.message });
    }
  }

  static async getLogs(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role === 'USER') {
        return res.status(403).json({ success: false, error: 'Acceso denegado' });
      }

      const { page = '1', limit = '50' } = req.query;
      const logs = await TicketService.getLogs(
        parseInt(String(page)),
        parseInt(String(limit))
      );

      res.json({ success: true, ...logs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}