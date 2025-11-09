import express from 'express'
import AdminController from '../controllers/adminController.js'

const router = express.Router()

router.get('/admin', AdminController.findAllAdminController)
router.get('/admin/:id', AdminController.findByIdAminController)
router.post('/admin/register', AdminController.createAdminController)
router.delete('/users/delete/:id', AdminController.deleteUserController)
router.delete('/admin/delete/:id', AdminController.deleteUserController)


export default router