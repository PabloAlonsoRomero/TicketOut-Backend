import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "./auth";

const prisma = new PrismaClient();

export class AuthService {
  static async register(input: {
    email: string;
    password: string;
    username: string;
    name: string;
    role?: "USER" | "ADMIN" | "SUPERUSER";
  }) {
    const { email, password, username, name, role = "USER" } = input;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw new Error("Email o Username ya están en uso");
    }

    const passwordHash = await hashPassword(password);

    return prisma.user.create({
      data: {
        email,
        username,
        name,
        passwordHash,
        role: role as any,
      },
    });
  }

  static async login(input: { email: string; password: string }) {
    const { email, password } = input;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    if (!user.isActive) {
      throw new Error("Usuario inactivo");
    }

    const validPassword = await comparePassword(password, user.passwordHash);
    if (!validPassword) {
      throw new Error("Credenciales inválidas");
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "una_cadena_secreta_cualquiera",
      { expiresIn: "8h" }
    );

    console.log('Sending user data to client:', {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }
}