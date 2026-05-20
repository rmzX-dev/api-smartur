import express from 'express';
import DashboardController from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard/stats', verifyToken, DashboardController.getStats);

export default router;
