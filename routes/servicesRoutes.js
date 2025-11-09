import express from 'express'
import ServicesController from '../controllers/serviceController.js'

const router = express.Router()

router.post('/users/forgot-password',ServicesController.forgotPasswordController)
router.post('/users/verify-reset-code',ServicesController.verifyResetCodeController)
router.post('/users/reset-password', ServicesController.resetPasswordController)
router.post('/login', ServicesController.loginController)
router.post('/verify-2fa',ServicesController.verifyTwoStepVerificationCodeController)

export default router