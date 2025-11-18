import EvaluationDetailController from '../controllers/evaluationDetailController.js'
import express from 'express'

const router = express.Router()

router.get(
    '/evaluation-detail',
    EvaluationDetailController.findAllEvaluationDetailController
)
router.get(
    '/evaluation-detail/:id_detail',
    EvaluationDetailController.findEvaluationDetailByIdController
)
router.get(
    '/evaluation-detail/evaluation/:id_evaluation',
    EvaluationDetailController.findEvaluationDetailByEvaluationIdController
)
router.post(
    '/evaluation-detail/register',
    EvaluationDetailController.createEvaluationDetailController
)
router.delete(
    '/evaluation-detail/delete/:id_detail',
    EvaluationDetailController.deleteEvaluationDetailController
)
router.put(
    '/evaluation-detail/update/:id_detail',
    EvaluationDetailController.updateEvaluationDetailController
)

export default router
