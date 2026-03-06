// src/routes/index.ts - Route aggregator
import { Router } from 'express';

export const router = Router();

// Aquí se registrarán las rutas de cada módulo
// Ejemplo:
import authRoutes from './auth';

router.use('/auth', authRoutes);