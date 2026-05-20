import express from 'express';
import ServiceCertificationController from '../controllers/serviceCertificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Lectura pública (requiere autenticación)
router.get(
    '/service-certifications',
    verifyToken,
    ServiceCertificationController.findAllCertificationsController
);
router.get(
    '/service-certifications/:id_certification',
    verifyToken,
    ServiceCertificationController.findCertificationByIdController
);
router.get(
    '/service-certifications/service/:id_service',
    verifyToken,
    ServiceCertificationController.findCertificationsByServiceIdController
);
router.get(
    '/service-certifications/type/:certification_type',
    verifyToken,
    ServiceCertificationController.findCertificationsByTypeController
);
router.get(
    '/service-certifications/status/:status',
    verifyToken,
    ServiceCertificationController.findCertificationsByStatusController
);

// Escritura: solo admin
router.post(
    '/service-certifications/register',
    verifyToken,
    requireRole([1]),
    ServiceCertificationController.createCertificationController
);
router.delete(
    '/service-certifications/delete/:id_certification',
    verifyToken,
    requireRole([1]),
    ServiceCertificationController.deleteCertificationController
);
router.patch(
    '/service-certifications/update/:id_certification',
    verifyToken,
    requireRole([1]),
    ServiceCertificationController.updateCertificationController
);
router.patch(
    '/service-certifications/status/:id_certification',
    verifyToken,
    requireRole([1]),
    ServiceCertificationController.updateStatusController
);

export default router;
