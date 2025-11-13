import express from 'express'
import templateController from "../controllers/evaluationTemplateController.js";

const router = express.Router()

router.get('/templates', templateController.findTemplateController)
router.get('/templates/:id_template', templateController.findTemplateByIdController)
router.post('/templates/register', templateController.createTemplateController)
router.delete('/templates/delete/:id_template', templateController.deleteTemplateController)

export default router