// src/routes/index.ts - Route aggregator
import { Router } from 'express';
import authRoutes from './auth';
import ticketRoutes from './ticket';
import userRoutes from './user';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);

export default router;