import ServiceEvaluationController from '../controllers/serviceEvaluationController.js';
import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get(
    '/service-evaluation',
    verifyToken,
    ServiceEvaluationController.findAllServiceEvaluationController
);
router.get(
    '/service-evaluation/:id_evaluation',
    verifyToken,
    ServiceEvaluationController.findServiceEvaluationByIdController
);
router.post(
    '/service-evaluation/register',
    verifyToken,
    requireRole([1]),
    ServiceEvaluationController.createServiceEvaluationController
);
router.post(
    '/service-evaluation/batch-register',
    verifyToken,
    requireRole([1]),
    ServiceEvaluationController.createFullEvaluationController
);
router.delete(
    '/service-evaluation/delete/:id_evaluation',
    verifyToken,
    requireRole([1]),
    ServiceEvaluationController.deleteServiceEvaluationController
);
router.patch(
    '/service-evaluation/update/:id_evaluation',
    verifyToken,
    requireRole([1]),
    ServiceEvaluationController.updateServiceEvaluationController
);
router.patch(
    '/service-evaluation/status/:id_evaluation',
    verifyToken,
    requireRole([1]),
    ServiceEvaluationController.updateStatusController
);

export default router;
