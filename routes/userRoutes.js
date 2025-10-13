import express from 'express'
import UserController from '../controllers/userController.js'

const router = express.Router()

router.get('/users', UserController.findAllController)
router.get('/users/:id', UserController.findByIdController)
router.post('/users/register', UserController.createUserController)
router.post('/users/admin', UserController.createAdminController)
router.delete('/users/delete/:id', UserController.deleteUserController)

router.post('/users/forgot-password', UserController.forgotPasswordController)
router.post('/users/reset-password', UserController.resetPasswordController)
router.post('/users/login', UserController.loginController)

export default router