import ServiceEvaluationController from '../controllers/serviceEvaluationController.js';
import express from 'express';

const router = express.Router();

router.get('/', ServiceEvaluationController.findAllServiceEvaluationController);

router.post('/register', ServiceEvaluationController.createServiceEvaluationController);

router.post('/batch-register', ServiceEvaluationController.createFullEvaluationController);

router.get('/:id_evaluation', ServiceEvaluationController.findServiceEvaluationByIdController);

router.delete(
    '/delete/:id_evaluation',
    ServiceEvaluationController.deleteServiceEvaluationController
);

router.put('/update/:id_evaluation', ServiceEvaluationController.updateServiceEvaluationController);

router.put('/status/:id_evaluation', ServiceEvaluationController.updateStatusController);

export default router;
