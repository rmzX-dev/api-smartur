import express from 'express';
import LocationController from '../controllers/locationController.js';

const router = express.Router();

router.get('/locations', LocationController.getAll);
router.get('/locations/:id', LocationController.getById);
router.post('/locations', LocationController.create);
router.patch('/locations/:id', LocationController.update);
router.delete('/locations/:id', LocationController.delete);

export default router;
