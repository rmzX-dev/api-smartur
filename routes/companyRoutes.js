import express from 'express';
import CompanyController from '../controllers/companyController.js';

const router = express.Router();

router.get('/companies', CompanyController.getAll);
router.get('/companies/:id', CompanyController.getById);
router.post('/companies', CompanyController.create);
router.patch('/companies/:id', CompanyController.update);
router.delete('/companies/:id', CompanyController.delete);

export default router;
