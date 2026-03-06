import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { comparePassword, hashPassword } from "../services/auth";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, username, name } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email o Username ya están en uso" });
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        passwordHash: hashedPassword,
        role: "USER", // Rol por defecto
      },
    });

    res.status(201).json({ 
      message: "Usuario registrado con éxito",
      userId: user.id 
    });
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al registrar al usuario" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.warn(`Login attempt failed for email: ${email} - User not found.`); // Added logging
    return res.status(401).json({ error: "Credenciales inválidas" });
  }
  if (!user.isActive) {
    console.warn(`Login attempt failed for email: ${email} - User inactive.`); // Added logging
    return res.status(403).json({ error: "Usuario inactivo" });
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    console.warn(`Login attempt failed for email: ${email} - Incorrect password.`); // Added logging
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "una_cadena_secreta_cualquiera",
    { expiresIn: "8h" }
  );

  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

export default router;