import PointOfInterestController from '../controllers/pointOfInterestController.js';
import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
import upload from '../middleware/multer.js';
import {
    validateCreatePOI,
    validateUpdatePOI,
} from '../validators/pointOfInterestValidators.js';

const router = express.Router();

router.get('/points-of-interest', verifyToken, PointOfInterestController.findAllController);
router.get(
    '/points-of-interest/:id_point',
    verifyToken,
    PointOfInterestController.findByIdController
);
router.post(
    '/points-of-interest/register',
    verifyToken,
    requireRole([1]),
    upload.single('image'),
    validateCreatePOI,
    PointOfInterestController.createController
);
router.delete(
    '/points-of-interest/delete/:id_point',
    verifyToken,
    requireRole([1]),
    PointOfInterestController.deleteController
);
router.patch(
    '/points-of-interest/update/:id_point',
    verifyToken,
    requireRole([1]),
    upload.single('image'),
    validateUpdatePOI,
    PointOfInterestController.updateController
);

export default router;
