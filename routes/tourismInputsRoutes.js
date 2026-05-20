import TourismInputsController from "../controllers/tourismInputsController.js";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get(
  "/tourism-inputs",
  verifyToken,
  TourismInputsController.findAllController,
);
router.get(
  "/tourism-inputs/:id_input",
  verifyToken,
  TourismInputsController.findByIdController,
);
router.post(
  "/tourism-inputs/register",
  verifyToken,
  requireRole([1]),
  TourismInputsController.createController,
);

export default router;
