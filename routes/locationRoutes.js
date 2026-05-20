import express from "express";
import LocationController from "../controllers/locationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get("/locations", verifyToken, LocationController.getAll);
router.get("/locations/:id", verifyToken, LocationController.getById);
router.post(
  "/locations",
  verifyToken,
  requireRole([1]),
  LocationController.create,
);
router.patch(
  "/locations/:id",
  verifyToken,
  requireRole([1]),
  LocationController.update,
);
router.delete(
  "/locations/:id",
  verifyToken,
  requireRole([1]),
  LocationController.delete,
);

export default router;
