import express from 'express'
import UserController from '../controllers/userController.js'
import ServicesController from '../controllers/serviceController.js'

const router = express.Router()

router.get('/users', UserController.findAllController)
router.get('/users/:id', UserController.findByIdController)
router.post('/users/register', UserController.createUserController)
router.post('/users/admin', UserController.createAdminController)
router.delete('/users/delete/:id', UserController.deleteUserController)

// olvide contraseña
router.post(
    '/users/forgot-password',
    ServicesController.forgotPasswordController
)
router.post(
    '/users/verify-reset-code',
    ServicesController.verifyResetCodeController
)
router.post('/users/reset-password', ServicesController.resetPasswordController)

// Paso 1: Verificar credenciales y generar código 2FA
router.post('/login', ServicesController.loginController)

// Paso 2: Verificar código 2FA y obtener JWT final
router.post(
    '/verify-2fa',
    ServicesController.verifyTwoStepVerificationCodeController
)

export default router
