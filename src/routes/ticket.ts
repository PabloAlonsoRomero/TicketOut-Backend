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

// Estadísticas para el dashboard
router.get('/stats', TicketController.getDashboardStats);

// Obtener ticket por ID
router.get('/:id', TicketController.getById);

// Actualizar ticket
router.put('/:id', TicketController.update);

// Asignar ticket
router.patch('/:id/assign', TicketController.assign);

// Agregar comentario
router.post('/:id/comments', TicketController.addComment);

export default router;