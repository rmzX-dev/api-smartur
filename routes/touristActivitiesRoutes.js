import express from 'express';
import TouristActivitiesController from '../controllers/touristActivitiesController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get(
    '/tourist_activities',
    verifyToken,
    TouristActivitiesController.findAllTouristActivitiesController
);
router.get(
    '/tourist_activities/:id_activity',
    verifyToken,
    TouristActivitiesController.findTouristActivitiesByIdController
);
router.post(
    '/tourist_activities/register',
    verifyToken,
    requireRole([1]),
    TouristActivitiesController.createTouristActivitiesController
);
router.delete(
    '/tourist_activities/delete/:id_activity',
    verifyToken,
    requireRole([1]),
    TouristActivitiesController.deleteTouristActivitiesController
);
router.patch(
    '/tourist_activities/update/:id_activity',
    verifyToken,
    requireRole([1]),
    TouristActivitiesController.updateTouristActivitiesController
);
export default router;
