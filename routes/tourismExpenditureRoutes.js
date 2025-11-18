import TourismExpenditureController from '../controllers/tourismExpenditureController.js'
import express from 'express'

const router = express.Router()

router.get(
    '/tourism-expenditures',
    TourismExpenditureController.findAllController
)
router.get(
    '/tourism-expenditures/:id_expenditure',
    TourismExpenditureController.findByIdController
)
router.post(
    '/tourism-expenditures/register',
    TourismExpenditureController.createController
)

export default router
