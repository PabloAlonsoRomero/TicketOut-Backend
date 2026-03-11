// src/routes/index.ts - Route aggregator
import { Router } from 'express';
import authRoutes from './auth';
import ticketRoutes from './ticket';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);

export default router;