import express from 'express';
import SubcriterionController from '../controllers/subcriterionController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get(
    '/subcriteria/criterion/:id_criterion',
    verifyToken,
    SubcriterionController.findAllByCriterion
);
router.post(
    '/subcriteria',
    verifyToken,
    requireRole([1]),
    SubcriterionController.create
);
router.patch(
    '/subcriteria/:id_subcriterion',
    verifyToken,
    requireRole([1]),
    SubcriterionController.update
);
router.delete(
    '/subcriteria/:id_subcriterion',
    verifyToken,
    requireRole([1]),
    SubcriterionController.delete
);
router.put(
    '/subcriteria/criterion/:id_criterion/batch',
    verifyToken,
    requireRole([1]),
    SubcriterionController.batchUpdate
);

export default router;
