import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

export class UserController {
  static async list(req: Request, res: Response) {
    console.log('[UserController] Handling list users request');
    try {
      const users = await UserService.getAllUsers();
      console.log(`[UserController] Found ${users.length} users`);
      res.json({ success: true, data: users });
    } catch (error: any) {
      console.error('[UserController] Error listing users:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async show(req: Request, res: Response) {
    try {
      const user = await UserService.getById(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async store(req: Request, res: Response) {
    try {
      const { name, username, email, password, role } = req.body;
      const user = await AuthService.register({ email, password, username, name, role: role as any });
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { name, username, email, password, role, isActive } = req.body;
      const data: any = { name, username, email, role, isActive };
      
      if (password) {
        const { hashPassword } = await import('../services/auth');
        data.passwordHash = await hashPassword(password);
      }

      const user = await UserService.update(Number(req.params.id), data);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      await UserService.delete(Number(req.params.id));
      res.json({ success: true, message: 'Usuario desactivado correctamente' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAssignable(req: Request, res: Response) {
    console.log('[UserController] Handling get assignable users request');
    try {
      const users = await UserService.getAssignableUsers();
      res.json({ success: true, data: users });
    } catch (error: any) {
      console.error('[UserController] Error getting assignable users:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
