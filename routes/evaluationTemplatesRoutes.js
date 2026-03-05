<<<<<<< HEAD
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
=======
import express from 'express';
import templateController from '../controllers/evaluationTemplateController.js';

const router = express.Router();

router.get('/templates', templateController.findTemplateController);
router.get('/templates/:id_template', templateController.findTemplateByIdController);
router.get('/templates/:id_template/rubric', templateController.getRubricController);
router.post('/templates/register', templateController.createTemplateController);
router.delete('/templates/delete/:id_template', templateController.deleteTemplateController);
>>>>>>> 467a09b7a48563e19856dabdea321df0e2d7c904

export default router;
