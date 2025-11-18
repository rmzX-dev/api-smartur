import TourismInputsController from '../controllers/tourismInputsController.js'
import express from 'express'

const router = express.Router()

router.get('/tourism-inputs', TourismInputsController.findAllController)
router.get('/tourism-inputs/:id_input', TourismInputsController.findByIdController)
router.post('/tourism-inputs/register', TourismInputsController.createController)

export default router