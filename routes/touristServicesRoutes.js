import express from 'express'
import TouristServicesController from '../controllers/touristServicesController.js'

const router = express.Router()

router.get('/touristServices/', TouristServicesController.findAllServicesController)
router.get('/touristServices/:id_service', TouristServicesController.findServicesByIdController)
router.post('/touristServices/register', TouristServicesController.createServicesController)
router.delete('/touristServices/delete/:id_service', TouristServicesController.deleteServicesController)
router.put('/touristServices/update/:id_service', TouristServicesController.updateServicesController)

export default router