<<<<<<< HEAD
import ServiceEvaluationController from "../controllers/serviceEvaluationController.js";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get(
  "/service-evaluation",
  verifyToken,
  ServiceEvaluationController.findAllServiceEvaluationController,
);
router.get(
  "/service-evaluation/:id_evaluation",
  verifyToken,
  ServiceEvaluationController.findServiceEvaluationByIdController,
);
router.post(
  "/service-evaluation/register",
  verifyToken,
  requireRole([1]),
  ServiceEvaluationController.createServiceEvaluationController,
);
router.delete(
  "/service-evaluation/delete/:id_evaluation",
  verifyToken,
  requireRole([1]),
  ServiceEvaluationController.deleteServiceEvaluationController,
);
router.put(
  "/service-evaluation/update/:id_evaluation",
  verifyToken,
  requireRole([1]),
  ServiceEvaluationController.updateServiceEvaluationController,
);
router.put(
  "/service-evaluation/status/:id_evaluation",
  verifyToken,
  requireRole([1]),
  ServiceEvaluationController.updateStatusController,
);

=======
import ServiceEvaluationController from '../controllers/serviceEvaluationController.js';
import express from 'express';

const router = express.Router();

router.get('/', ServiceEvaluationController.findAllServiceEvaluationController);

router.post('/register', ServiceEvaluationController.createServiceEvaluationController);

router.post('/batch-register', ServiceEvaluationController.createFullEvaluationController);

router.get('/:id_evaluation', ServiceEvaluationController.findServiceEvaluationByIdController);

router.delete(
    '/delete/:id_evaluation',
    ServiceEvaluationController.deleteServiceEvaluationController
);

router.put('/update/:id_evaluation', ServiceEvaluationController.updateServiceEvaluationController);

router.put('/status/:id_evaluation', ServiceEvaluationController.updateStatusController);

>>>>>>> 467a09b7a48563e19856dabdea321df0e2d7c904
export default router;
