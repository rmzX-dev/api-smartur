import express from 'express'
import UserController from '../controllers/userController.js'

const router = express.Router()

router.get('/users', UserController.findAllUserController)
router.get('/users/:id', UserController.findUserByIdController)
router.post('/users/register', UserController.createUserController)
router.delete('/users/delete/:id', UserController.deleteUserController)


export default router
