import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Endpoint para listar todos los usuarios
router.get('/', UserController.list);

// Endpoint para crear un nuevo usuario
router.post('/', UserController.store);

// Endpoint para obtener usuarios asignables (Admins y Superusers)
router.get('/assignable', UserController.getAssignable);

// Endpoint para obtener un usuario específico
router.get('/:id', UserController.show);

// Endpoint para actualizar un usuario
router.put('/:id', UserController.update);

// Endpoint para eliminar (desactivar) un usuario
router.delete('/:id', UserController.remove);

export default router;
