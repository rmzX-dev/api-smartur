import EvaluationDetailController from '../controllers/evaluationDetailController.js';
import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get(
    '/evaluation-detail',
    verifyToken,
    EvaluationDetailController.findAllEvaluationDetailController
);
router.get(
    '/evaluation-detail/:id_detail',
    verifyToken,
    EvaluationDetailController.findEvaluationDetailByIdController
);
router.get(
    '/evaluation-detail/evaluation/:id_evaluation',
    verifyToken,
    EvaluationDetailController.findEvaluationDetailByEvaluationIdController
);
router.post(
    '/evaluation-detail/register',
    verifyToken,
    requireRole([1]),
    EvaluationDetailController.createEvaluationDetailController
);
router.delete(
    '/evaluation-detail/delete/:id_detail',
    verifyToken,
    requireRole([1]),
    EvaluationDetailController.deleteEvaluationDetailController
);
router.patch(
    '/evaluation-detail/update/:id_detail',
    verifyToken,
    requireRole([1]),
    EvaluationDetailController.updateEvaluationDetailController
);

export default router;
