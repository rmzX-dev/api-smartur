import pool from '../config/db.js'

class ServiceCertification {
    static async findAllCertifications() {
        const result = await pool.query('SELECT * FROM service_certification')
        return result.rows
    }

    static async findCertificationById(id_certification) {
        const result = await pool.query(
            'SELECT * FROM service_certification WHERE id_certification = $1',
            [id_certification]
        )
        return result.rows[0]
    }

    static async findCertificationsByServiceId(id_service) {
        const result = await pool.query(
            'SELECT * FROM service_certification WHERE id_service = $1',
            [id_service]
        )
        return result.rows
    }

    static async findCertificationsByType(certification_type) {
        const result = await pool.query(
            'SELECT * FROM service_certification WHERE certification_type = $1',
            [certification_type]
        )
        return result.rows
    }

    static async findCertificationsByStatus(status) {
        const result = await pool.query(
            'SELECT * FROM service_certification WHERE status = $1',
            [status]
        )
        return result.rows
    }

    static async createCertification(data) {
        const {
            id_service,
            certification_type,
            obtainment_date,
            expiration_date,
            issuing_organization,
            evidence_url,
            status,
        } = data

        const result = await pool.query(
            `INSERT INTO service_certification 
            (id_service, certification_type, obtainment_date, expiration_date, issuing_organization, evidence_url, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [
                id_service,
                certification_type,
                obtainment_date,
                expiration_date,
                issuing_organization,
                evidence_url,
                status,
            ]
        )
        return result.rows[0]
    }

    static async updateCertification(id_certification, data) {
        const {
            id_service,
            certification_type,
            obtainment_date,
            expiration_date,
            issuing_organization,
            evidence_url,
            status,
        } = data

        const result = await pool.query(
            `UPDATE service_certification 
            SET id_service = $1, certification_type = $2, obtainment_date = $3, 
                expiration_date = $4, issuing_organization = $5, evidence_url = $6, status = $7
            WHERE id_certification = $8 
            RETURNING *`,
            [
                id_service,
                certification_type,
                obtainment_date,
                expiration_date,
                issuing_organization,
                evidence_url,
                status,
                id_certification,
            ]
        )
        return result.rows[0]
    }

    static async deleteCertification(id_certification) {
        const result = await pool.query(
            'DELETE FROM service_certification WHERE id_certification = $1 RETURNING *',
            [id_certification]
        )
        return result.rows[0]
    }

    static async updateStatus(id_certification, status) {
        const result = await pool.query(
            'UPDATE service_certification SET status = $1 WHERE id_certification = $2 RETURNING *',
            [status, id_certification]
        )
        return result.rows[0]
    }
}

export default ServiceCertification
