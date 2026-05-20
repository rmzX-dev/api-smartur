import express from 'express';
import CriterionController from '../controllers/criterionController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/criterion/', verifyToken, CriterionController.findAllCriterionController);
router.get(
    '/criterion/:id_criterion',
    verifyToken,
    CriterionController.findCriterionByIdController
);
router.post(
    '/criterion/register',
    verifyToken,
    requireRole([1]),
    CriterionController.createCriterionController
);
router.delete(
    '/criterion/delete/:id_criterion',
    verifyToken,
    requireRole([1]),
    CriterionController.deleteCriterionController
);
router.patch(
    '/criterion/update/:id_criterion',
    verifyToken,
    requireRole([1]),
    CriterionController.updateCriterionController
);

export default router;
