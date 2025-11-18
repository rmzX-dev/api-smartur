import ServiceEvaluationController from '../controllers/ServiceEvaluationController.js'
import express from 'express'

const router = express.Router()

router.get('/service-evaluation', ServiceEvaluationController.findAllServiceEvaluationController)
router.get('/service-evaluation/:id_evaluation', ServiceEvaluationController.findServiceEvaluationByIdController)
router.post('/service-evaluation/register', ServiceEvaluationController.createServiceEvaluationController)
router.delete('/service-evaluation/delete/:id_evaluation', ServiceEvaluationController.deleteServiceEvaluationController)
router.put('/service-evaluation/update/:id_evaluation', ServiceEvaluationController.updateServiceEvaluationController)
router.put('/service-evaluation/status/:id_evaluation', ServiceEvaluationController.updateStatusController)

export default router

