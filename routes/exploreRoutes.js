import express from 'express';
import ExploreController from '../controllers/exploreController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/explore/home', verifyToken, ExploreController.getHome);

export default router;
