import express from 'express';
import travelerProfileController from '../controllers/travelerProfileController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Perfil del usuario autenticado (debe ir antes de /profiles/:id_profile)
router.get('/profiles/me', verifyToken, travelerProfileController.getMyProfile);

// Listar todos los perfiles: solo admin
router.get(
    '/profiles',
    verifyToken,
    requireRole([1]),
    travelerProfileController.findAllTravelerProfileController
);
// Ver perfil individual: autenticado (ownership se puede añadir si el modelo lo expone por user_id)
router.get(
    '/profiles/:id_profile',
    verifyToken,
    travelerProfileController.findTravelerProfileByIdController
);
// Crear perfil: usuario autenticado
router.post(
    '/profiles/register',
    verifyToken,
    travelerProfileController.createTravelerProfileController
);
// Actualizar perfil: usuario autenticado
router.patch(
    '/profiles/update/:id_profile',
    verifyToken,
    travelerProfileController.updateTravelerProfileController
);
// Eliminar: solo admin
router.delete(
    '/profiles/delete/:id_profile',
    verifyToken,
    requireRole([1]),
    travelerProfileController.deleteTravelerProfileController
);

// Guardar/actualizar preferencias: usuario autenticado
router.post('/profiles/preferences', verifyToken, travelerProfileController.savePreferences);

export default router;
