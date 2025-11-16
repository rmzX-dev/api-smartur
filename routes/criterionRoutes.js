import express from 'express'
import CriterionController from '../controllers/criterionController.js'

const router = express.Router()

router.get('/criterion/', CriterionController.findAllCriterionController)
router.get(
    '/criterion/:id_criterion',
    CriterionController.findCriterionByIdController
)
router.post(
    '/criterion/register',
    CriterionController.createCriterionController
)
router.delete(
    '/criterion/delete/:id_criterion',
    CriterionController.deleteCriterionController
)
router.put(
    '/criterion/update/:id_criterion',
    CriterionController.updateCriterionController
)

export default router
