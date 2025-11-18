import PointOfInterestController from '../controllers/pointOfInterestController.js'
import express from 'express'

const router = express.Router()

router.get('/points-of-interest', PointOfInterestController.findAllController)
router.get('/points-of-interest/:id_point', PointOfInterestController.findByIdController)
router.post('/points-of-interest/register', PointOfInterestController.createController)
router.delete('/points-of-interest/delete/:id_point', PointOfInterestController.deleteController)
router.put('/points-of-interest/update/:id_point', PointOfInterestController.updateController)

export default router