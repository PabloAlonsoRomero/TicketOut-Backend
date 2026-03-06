import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Extraer el token después de "Bearer "

    jwt.verify(token, process.env.JWT_SECRET || "una_cadena_secreta_cualquiera", (err, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Token inválido o expirado" });
      }

      // Adjuntar los datos del usuario al objeto request para que los controladores lo usen
      req.user = {
        id: user.sub,
        email: user.email,
        role: user.role
      };
      
      next();
    });
  } else {
    res.status(401).json({ error: "No se proporcionó un token de autenticación" });
  }
};