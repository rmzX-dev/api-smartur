import TourismEmploymentController from "../controllers/tourismEmploymentController.js";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get(
  "/tourism-employment",
  verifyToken,
  TourismEmploymentController.findAllController,
);
router.get(
  "/tourism-employment/:id_employment",
  verifyToken,
  TourismEmploymentController.findByIdController,
);
router.post(
  "/tourism-employment/register",
  verifyToken,
  requireRole([1]),
  TourismEmploymentController.createController,
);

export default router;
