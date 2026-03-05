import express from "express";
import TouristServicesController from "../controllers/touristServicesController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get("/tourist-services", verifyToken, TouristServicesController.getAll);
router.get(
  "/tourist-services/:id",
  verifyToken,
  TouristServicesController.getById,
);
router.post(
  "/tourist-services",
  verifyToken,
  requireRole([1]),
  TouristServicesController.create,
);
router.patch(
  "/tourist-services/:id",
  verifyToken,
  requireRole([1]),
  TouristServicesController.update,
);
router.delete(
  "/tourist-services/:id",
  verifyToken,
  requireRole([1]),
  TouristServicesController.delete,
);

export default router;
