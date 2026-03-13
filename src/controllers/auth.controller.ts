import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, username, name } = req.body;

      if (!email || !password || !username || !name) {
        return res.status(400).json({
          error: "email, password, username y name son requeridos",
        });
      }

      const user = await AuthService.register({ email, password, username, name });

      return res.status(201).json({
        message: "Usuario registrado con éxito",
        userId: user.id,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error inesperado";
      if (message.includes("en uso")) {
        return res.status(409).json({ error: message });
      }

      return res.status(500).json({ error: "Ocurrió un error al registrar al usuario" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "email y password son requeridos" });
      }

      const response = await AuthService.login({ email, password });
      return res.status(200).json(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error inesperado";

      if (message === "Usuario inactivo") {
        return res.status(403).json({ error: message });
      }

      if (message === "Credenciales inválidas") {
        return res.status(401).json({ error: message });
      }

      return res.status(500).json({ error: "Ocurrió un error al iniciar sesión" });
    }
  }
}