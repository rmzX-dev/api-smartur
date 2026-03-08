
import express from "express";
import templateController from "../controllers/evaluationTemplateController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get(
  "/templates",
  verifyToken,
  templateController.findTemplateController,
);
router.get(
  "/templates/:id_template",
  verifyToken,
  templateController.findTemplateByIdController,
);
router.post(
  "/templates/register",
  verifyToken,
  requireRole([1]),
  templateController.createTemplateController,
);
router.delete(
  "/templates/delete/:id_template",
  verifyToken,
  requireRole([1]),
  templateController.deleteTemplateController,
);
export default router;
