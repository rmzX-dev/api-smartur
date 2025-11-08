import express from 'express'
import UserController from '../controllers/userController.js'
import ServicesController from '../controllers/serviceController.js'
import AdminController from '../controllers/adminController.js'

const router = express.Router()

router.get('/users', UserController.findAllUserController)
router.get('/users/:id', UserController.findUserByIdController)
router.post('/users/register', UserController.createUserController)
router.delete('/users/delete/:id', UserController.deleteUserController)

//Crear administrador
router.get('/admin', AdminController.findAllAdminController)
router.get('/admin/:id', AdminController.findByIdAminController)
router.post('/admin/register', AdminController.createAdminController)
router.delete('/users/delete/:id', AdminController.deleteUserController)
router.delete('/admin/delete/:id', AdminController.deleteUserController)


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
