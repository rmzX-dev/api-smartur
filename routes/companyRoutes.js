import express from 'express'
import CompanyController from '../controllers/companyController.js'

const router = express.Router()

router.get('/company', CompanyController.findAllCompanyController)
router.get('/company/:id_company', CompanyController.findCompanyByIdController)
router.post('/company/register', CompanyController.createCompanyController)
router.delete(
    '/company/delete/:id_company',
    CompanyController.deleteCompanyController
)

export default router
