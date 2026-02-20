import express from 'express';
import TouristServicesController from '../controllers/touristServicesController.js';

const router = express.Router();

router.get('/tourist-services', TouristServicesController.getAll);
router.get('/tourist-services/:id', TouristServicesController.getById);
router.post('/tourist-services', TouristServicesController.create);
router.patch('/tourist-services/:id', TouristServicesController.update);
router.delete('/tourist-services/:id', TouristServicesController.delete);

export default router;
