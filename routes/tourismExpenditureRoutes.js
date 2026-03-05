import TourismExpenditureController from "../controllers/tourismExpenditureController.js";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get(
  "/tourism-expenditures",
  verifyToken,
  TourismExpenditureController.findAllController,
);
router.get(
  "/tourism-expenditures/:id_expenditure",
  verifyToken,
  TourismExpenditureController.findByIdController,
);
router.post(
  "/tourism-expenditures/register",
  verifyToken,
  requireRole([1]),
  TourismExpenditureController.createController,
);

export default router;
