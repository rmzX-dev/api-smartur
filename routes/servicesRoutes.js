import express from 'express'
import ServicesController from '../controllers/serviceController.js'
import UserController from '../controllers/userController.js'

const router = express.Router()

router.post('/login', ServicesController.loginController)

router.post('/two-factor', ServicesController.verifyTwoStepVerificationCodeController);

router.post('/forgot', ServicesController.forgotPasswordController)

router.post('/reset', ServicesController.resetPasswordController)

router.post('/register', UserController.register)

// google auth
router.post('/google-login', UserController.googleLogin);

export default router