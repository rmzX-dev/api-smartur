import express from "express";
import CompanyController from "../controllers/companyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get("/companies", verifyToken, CompanyController.getAll);
router.get("/companies/:id", verifyToken, CompanyController.getById);
router.post(
  "/companies",
  verifyToken,
  requireRole([1]),
  CompanyController.create,
);
router.patch(
  "/companies/:id",
  verifyToken,
  requireRole([1]),
  CompanyController.update,
);
router.delete(
  "/companies/:id",
  verifyToken,
  requireRole([1]),
  CompanyController.delete,
);

export default router;
