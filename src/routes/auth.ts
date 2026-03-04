import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { comparePassword } from "../services/auth";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });
  if (!user.isActive) return res.status(403).json({ error: "Usuario inactivo" });

  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || "secret", { expiresIn: "8h" });
  res.json({ token });
});

export default router;
