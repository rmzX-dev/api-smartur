import TourismEmploymentController from '../controllers/tourismEmploymentController.js'
import express from 'express'

const router = express.Router()

router.get('/tourism-employment', TourismEmploymentController.findAllController)
router.get(
    '/tourism-employment/:id_employment',
    TourismEmploymentController.findByIdController
)
router.post(
    '/tourism-employment/register',
    TourismEmploymentController.createController
)

export default router
