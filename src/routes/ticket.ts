import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Crear ticket
router.post('/', TicketController.create);

// Listar tickets
router.get('/', TicketController.list);

// Obtener ticket por ID
router.get('/:id', TicketController.getById);

// Actualizar ticket
router.put('/:id', TicketController.update);

// Asignar ticket
router.patch('/:id/assign', TicketController.assign);

export default router;