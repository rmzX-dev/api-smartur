import express from 'express'
import UserController from '../controllers/userController.js'
import ServicesController from '../controllers/serviceController.js'

const router = express.Router()

router.get('/users', UserController.findAllController)
router.get('/users/:id', UserController.findByIdController)
router.post('/users/register', UserController.createUserController)
router.delete('/users/delete/:id', UserController.deleteUserController)

//Crear administrador
router.post('/users/admin', UserController.createAdminController)

// Recuperar contraseña
router.post(
    '/users/forgot-password',
    ServicesController.forgotPasswordController
)
router.post(
    '/users/verify-reset-code',
    ServicesController.verifyResetCodeController
)
router.post('/users/reset-password', ServicesController.resetPasswordController)

//Login
router.post('/login', ServicesController.loginController)

//2FA y JWT
router.post(
    '/verify-2fa',
    ServicesController.verifyTwoStepVerificationCodeController
)

export default router
