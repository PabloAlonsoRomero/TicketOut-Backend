import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export class SearchController {
  static async globalSearch(req: AuthRequest, res: Response) {
    try {
      const q = req.query.q as string;
      if (!q || q.trim().length < 2) {
        return res.json({ success: true, data: { tickets: [], users: [] } });
      }

      const query = q.toLowerCase();
      // Intentar extraer ID numérico si el usuario pone algo como "TKT-2" o solo "2"
      const cleanId = q.toLowerCase().replace('tkt-', '').trim();
      const numericId = parseInt(cleanId);

      const [tickets, users] = await Promise.all([
        prisma.ticket.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
              ...( !isNaN(numericId) ? [{ id: numericId }] : [] )
            ]
          },
          take: 6,
          select: {
            id: true,
            title: true,
            status: true,
            category: true
          }
        }),
        prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { username: { contains: query } },
              { email: { contains: query } }
            ]
          },
          take: 4,
          select: {
            id: true,
            name: true,
            username: true,
            role: true
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          tickets,
          users
        }
      });
    } catch (error: any) {
      console.error('Error en búsqueda global:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
