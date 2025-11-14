import locationController from "../controllers/locationController.js";
import express from 'express'

const router = express.Router()
router.get('/location', locationController.findAllLocationController)
router.get('/location/:id_location', locationController.findLocationById)
router.post('/location/register', locationController.createLocationController)
router.delete('/location/delete/:id_location', locationController.deleteLocationController)

export default router