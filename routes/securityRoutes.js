import express from "express";
import { getSecurityEvents } from "../services/monitoringService.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

/**
 * GET /api/v2/security/events
 * Evidencia A09: Lista los eventos registrados en security_events.
 * Protegido con verifyToken + requireRole([1]) (también evidencia A01).
 */
router.get(
  "/security/events",
  verifyToken,
  requireRole([1]),
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const { severity } = req.query;
      const events = await getSecurityEvents({ limit, severity });
      res.json(events);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al consultar eventos de seguridad",
          error: error.message,
        });
    }
  },
);

export default router;
