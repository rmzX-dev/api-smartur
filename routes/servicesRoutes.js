import express from 'express'
import ServicesController from '../controllers/serviceController.js'

const router = express.Router()

router.post('/login', ServicesController.loginController)

router.post('/two-factor', ServicesController.verifyTwoStepVerificationCodeController);

router.post('/forgot', ServicesController.forgotPasswordController)

router.post('/reset', ServicesController.resetPasswordController)
export default router