import express from "express";
import travelerProfileController from "../controllers/travelerProfileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// Listar todos los perfiles: solo admin
router.get(
  "/profiles",
  verifyToken,
  requireRole([1]),
  travelerProfileController.findAllTravelerProfileController,
);
// Ver perfil individual: autenticado (ownership se puede añadir si el modelo lo expone por user_id)
router.get(
  "/profiles/:id_profile",
  verifyToken,
  travelerProfileController.findTravelerProfileByIdController,
);
// Crear perfil: usuario autenticado
router.post(
  "/profiles/register",
  verifyToken,
  travelerProfileController.createTravelerProfileController,
);
// Actualizar perfil: usuario autenticado
router.put(
  "/profiles/update/:id_profile",
  verifyToken,
  travelerProfileController.updateTravelerProfileController,
);
// Eliminar: solo admin
router.delete(
  "/profiles/delete/:id_profile",
  verifyToken,
  requireRole([1]),
  travelerProfileController.deleteTravelerProfileController,
);

export default router;
