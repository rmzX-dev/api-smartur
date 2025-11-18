import ServiceCertificationController from '../controllers/serviceCertificationController.js'
import express from 'express'

const router = express.Router()

router.get('/service-certifications', ServiceCertificationController.findAllCertificationsController)
router.get('/service-certifications/:id_certification', ServiceCertificationController.findCertificationByIdController)
router.get('/service-certifications/service/:id_service', ServiceCertificationController.findCertificationsByServiceIdController)
router.get('/service-certifications/type/:certification_type', ServiceCertificationController.findCertificationsByTypeController)
router.get('/service-certifications/status/:status', ServiceCertificationController.findCertificationsByStatusController)
router.post('/service-certifications/register', ServiceCertificationController.createCertificationController)
router.delete('/service-certifications/delete/:id_certification', ServiceCertificationController.deleteCertificationController)
router.put('/service-certifications/update/:id_certification', ServiceCertificationController.updateCertificationController)
router.put('/service-certifications/status/:id_certification', ServiceCertificationController.updateStatusController)

export default router