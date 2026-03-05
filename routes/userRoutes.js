import express from "express";
import UserController from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";
import { verifyOwnership } from "../middleware/ownershipMiddleware.js";

const router = express.Router();

// RBAC: Solo admin puede listar todos los usuarios
router.get("/users", verifyToken, requireRole([1]), UserController.getAll);

// Ownership: solo el propio usuario o admin puede ver su perfil
router.get("/users/:id", verifyToken, verifyOwnership, UserController.getById);

// RBAC: Solo admin puede buscar usuarios por email
router.get(
  "/users/email/:email",
  verifyToken,
  requireRole([1]),
  UserController.findByEmail,
);

// Rutas públicas
router.post("/users/register", UserController.register);

// RBAC: Solo admin puede crear usuarios directamente
router.post("/users/", verifyToken, requireRole([1]), UserController.create);

// RBAC: Solo admin puede eliminar usuarios
router.delete(
  "/users/:id",
  verifyToken,
  requireRole([1]),
  UserController.delete,
);

// Ownership: solo el propio usuario o admin puede actualizar su perfil
router.patch("/users/:id", verifyToken, verifyOwnership, UserController.patch);

export default router;
