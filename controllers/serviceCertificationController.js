import ServiceCertification from '../models/serviceCertificationModel.js'

class ServiceCertificationController {
    static async findAllCertificationsController(req, res) {
        try {
            const certifications =
                await ServiceCertification.findAllCertifications()
            res.json({
                message: 'Certificaciones obtenidas exitosamente',
                count: certifications.length,
                certifications: certifications.map((cert) => ({
                    id: cert.id_certification,
                    serviceId: cert.id_service,
                    certificationType: cert.certification_type,
                    obtainmentDate: cert.obtainment_date,
                    expirationDate: cert.expiration_date,
                    issuingOrganization: cert.issuing_organization,
                    evidenceUrl: cert.evidence_url,
                    status: cert.status,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findCertificationByIdController(req, res) {
        try {
            const certification =
                await ServiceCertification.findCertificationById(
                    req.params.id_certification
                )
            if (!certification) {
                return res
                    .status(404)
                    .json({ message: 'Certificación no encontrada' })
            }
            res.status(200).json({
                message: 'Certificación obtenida exitosamente',
                certification: {
                    id: certification.id_certification,
                    serviceId: certification.id_service,
                    certificationType: certification.certification_type,
                    obtainmentDate: certification.obtainment_date,
                    expirationDate: certification.expiration_date,
                    issuingOrganization: certification.issuing_organization,
                    evidenceUrl: certification.evidence_url,
                    status: certification.status,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findCertificationsByServiceIdController(req, res) {
        try {
            const certifications =
                await ServiceCertification.findCertificationsByServiceId(
                    req.params.id_service
                )
            res.status(200).json({
                message: 'Certificaciones por servicio obtenidas exitosamente',
                count: certifications.length,
                certifications: certifications.map((cert) => ({
                    id: cert.id_certification,
                    serviceId: cert.id_service,
                    certificationType: cert.certification_type,
                    obtainmentDate: cert.obtainment_date,
                    expirationDate: cert.expiration_date,
                    issuingOrganization: cert.issuing_organization,
                    evidenceUrl: cert.evidence_url,
                    status: cert.status,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findCertificationsByTypeController(req, res) {
        try {
            const certifications =
                await ServiceCertification.findCertificationsByType(
                    req.params.certification_type
                )
            res.status(200).json({
                message: 'Certificaciones por tipo obtenidas exitosamente',
                count: certifications.length,
                certifications: certifications.map((cert) => ({
                    id: cert.id_certification,
                    serviceId: cert.id_service,
                    certificationType: cert.certification_type,
                    obtainmentDate: cert.obtainment_date,
                    expirationDate: cert.expiration_date,
                    issuingOrganization: cert.issuing_organization,
                    evidenceUrl: cert.evidence_url,
                    status: cert.status,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findCertificationsByStatusController(req, res) {
        try {
            const certifications =
                await ServiceCertification.findCertificationsByStatus(
                    req.params.status
                )
            res.status(200).json({
                message: 'Certificaciones por estado obtenidas exitosamente',
                count: certifications.length,
                certifications: certifications.map((cert) => ({
                    id: cert.id_certification,
                    serviceId: cert.id_service,
                    certificationType: cert.certification_type,
                    obtainmentDate: cert.obtainment_date,
                    expirationDate: cert.expiration_date,
                    issuingOrganization: cert.issuing_organization,
                    evidenceUrl: cert.evidence_url,
                    status: cert.status,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async createCertificationController(req, res) {
        try {
            const result = await ServiceCertification.createCertification(
                req.body
            )
            res.status(201).json({
                message: 'Certificación creada exitosamente',
                certification: {
                    id: result.id_certification,
                    serviceId: result.id_service,
                    certificationType: result.certification_type,
                    obtainmentDate: result.obtainment_date,
                    expirationDate: result.expiration_date,
                    issuingOrganization: result.issuing_organization,
                    evidenceUrl: result.evidence_url,
                    status: result.status,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async deleteCertificationController(req, res) {
        try {
            const certification =
                await ServiceCertification.deleteCertification(
                    req.params.id_certification
                )
            if (!certification) {
                return res
                    .status(404)
                    .json({ message: 'Certificación no encontrada' })
            }
            res.status(200).json({
                message: 'Certificación eliminada exitosamente',
                certification: {
                    id: certification.id_certification,
                    serviceId: certification.id_service,
                    certificationType: certification.certification_type,
                    obtainmentDate: certification.obtainment_date,
                    expirationDate: certification.expiration_date,
                    issuingOrganization: certification.issuing_organization,
                    evidenceUrl: certification.evidence_url,
                    status: certification.status,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async updateCertificationController(req, res) {
        try {
            const certification =
                await ServiceCertification.updateCertification(
                    req.params.id_certification,
                    req.body
                )
            if (!certification) {
                return res
                    .status(404)
                    .json({ message: 'Certificación no encontrada' })
            }
            res.status(200).json({
                message: 'Certificación actualizada exitosamente',
                certification: {
                    id: certification.id_certification,
                    serviceId: certification.id_service,
                    certificationType: certification.certification_type,
                    obtainmentDate: certification.obtainment_date,
                    expirationDate: certification.expiration_date,
                    issuingOrganization: certification.issuing_organization,
                    evidenceUrl: certification.evidence_url,
                    status: certification.status,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async updateStatusController(req, res) {
        try {
            const { status } = req.body
            const certification = await ServiceCertification.updateStatus(
                req.params.id_certification,
                status
            )
            if (!certification) {
                return res
                    .status(404)
                    .json({ message: 'Certificación no encontrada' })
            }
            res.status(200).json({
                message: 'Estado de certificación actualizado exitosamente',
                certification: {
                    id: certification.id_certification,
                    serviceId: certification.id_service,
                    certificationType: certification.certification_type,
                    obtainmentDate: certification.obtainment_date,
                    expirationDate: certification.expiration_date,
                    issuingOrganization: certification.issuing_organization,
                    evidenceUrl: certification.evidence_url,
                    status: certification.status,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }
}

export default ServiceCertificationController
