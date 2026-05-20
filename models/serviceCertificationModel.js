import pool from '../config/db.js';

class ServiceCertification {
    static async findAllCertifications(
        page = 1,
        limit = 50,
        id_service = null,
        certification_type = '',
        status = ''
    ) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        conditions.push(`is_active = TRUE`);

        if (id_service !== null) {
            conditions.push(`id_service = $${index}`);
            values.push(id_service);
            index++;
        }

        if (certification_type) {
            conditions.push(`certification_type ILIKE $${index}`);
            values.push(`%${certification_type}%`);
            index++;
        }

        if (status) {
            conditions.push(`status ILIKE $${index}`);
            values.push(`%${status}%`);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM service_certification ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // Obtener datos paginados
        const dataQuery = await pool.query(
            `SELECT * FROM service_certification
             ${whereClause}
             ORDER BY id_certification
             LIMIT $${index}
             OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            certifications: dataQuery.rows,
        };
    }

    static async findCertificationById(id_certification) {
        const result = await pool.query(
            'SELECT * FROM service_certification WHERE id_certification = $1 AND is_active = TRUE',
            [id_certification]
        );
        return result.rows[0] || null;
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
        } = data;

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
        );
        return result.rows[0];
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
        } = data;

        const fields = [];
        const values = [];
        let index = 1;

        if (id_service !== undefined) {
            fields.push(`id_service = $${index++}`);
            values.push(id_service);
        }
        if (certification_type !== undefined) {
            fields.push(`certification_type = $${index++}`);
            values.push(certification_type);
        }
        if (obtainment_date !== undefined) {
            fields.push(`obtainment_date = $${index++}`);
            values.push(obtainment_date);
        }
        if (expiration_date !== undefined) {
            fields.push(`expiration_date = $${index++}`);
            values.push(expiration_date);
        }
        if (issuing_organization !== undefined) {
            fields.push(`issuing_organization = $${index++}`);
            values.push(issuing_organization);
        }
        if (evidence_url !== undefined) {
            fields.push(`evidence_url = $${index++}`);
            values.push(evidence_url);
        }
        if (status !== undefined) {
            fields.push(`status = $${index++}`);
            values.push(status);
        }

        if (fields.length === 0) return null;

        const result = await pool.query(
            `UPDATE service_certification 
            SET ${fields.join(', ')}
            WHERE id_certification = $${index} AND is_active = TRUE
            RETURNING *`,
            [...values, id_certification]
        );
        return result.rows[0] || null;
    }

    static async deleteCertification(id_certification) {
        const result = await pool.query(
            "UPDATE service_certification SET is_active = FALSE, status = 'inactive' WHERE id_certification = $1 AND is_active = TRUE RETURNING *",
            [id_certification]
        );
        return result.rows[0] || null;
    }

    static async updateStatus(id_certification, status) {
        const result = await pool.query(
            'UPDATE service_certification SET status = $1 WHERE id_certification = $2 RETURNING *',
            [status, id_certification]
        );
        return result.rows[0] || null;
    }
}

export default ServiceCertification;
