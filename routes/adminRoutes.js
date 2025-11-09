import express from 'express'
import AdminController from '../controllers/adminController.js'

const router = express.Router()

router.get('/admin', AdminController.findAllAdminController)
router.get('/admin/:id', AdminController.findByIdAdminController)
router.post('/admin/register', AdminController.createAdminController)
router.delete('/admin/delete/:id', AdminController.deleteAdminController)

export default router