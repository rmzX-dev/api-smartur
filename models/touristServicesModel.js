import pool from '../config/db.js';

class TouristServices {
    static async findAll(
        page = 1,
        limit = 50,
        search = '',
        company = null,
        type = null,
        active = null,
        id_location = null
    ) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        if (search) {
            conditions.push(`ts.name ILIKE $${index}`);
            values.push(`%${search}%`);
            index++;
        }

        if (company) {
            conditions.push(`ts.id_company = $${index}`);
            values.push(company);
            index++;
        }

        if (type) {
            conditions.push(`ts.service_type = $${index}`);
            values.push(type);
            index++;
        }

        if (active !== null) {
            conditions.push(`ts.active = $${index}`);
            values.push(active);
            index++;
        }

        if (id_location !== null) {
            conditions.push(`ts.id_location = $${index}`);
            values.push(id_location);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // 1️⃣ Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM tourist_service ts ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // 2️⃣ Obtener datos paginados con evaluación si existe
        const dataQuery = await pool.query(
            `
        SELECT ts.*, 
            (SELECT id_evaluation FROM service_evaluation WHERE id_service = ts.id_service ORDER BY created_at DESC LIMIT 1) as id_evaluation,
            (SELECT total_score FROM service_evaluation WHERE id_service = ts.id_service ORDER BY created_at DESC LIMIT 1) as total_score
        FROM tourist_service ts
        ${whereClause}
        ORDER BY ts.id_service
        LIMIT $${index}
        OFFSET $${index + 1}
        `,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            services: dataQuery.rows,
        };
    }

    static async findById(id_service) {
        const result = await pool.query(
            `SELECT ts.*, 
                (SELECT id_evaluation FROM service_evaluation WHERE id_service = ts.id_service ORDER BY created_at DESC LIMIT 1) as id_evaluation,
                (SELECT total_score FROM service_evaluation WHERE id_service = ts.id_service ORDER BY created_at DESC LIMIT 1) as total_score
             FROM tourist_service ts
             WHERE ts.id_service = $1`,
            [id_service]
        );
        return result.rows[0] || null;
    }

    static async create(data) {
        const { name, description, id_company, id_location, service_type, active, image_url } = data;

        const result = await pool.query(
            `INSERT INTO tourist_service (name, description, id_company, id_location, service_type, active, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [name, description, id_company, id_location, service_type, active ?? true, image_url || null]
        );

        return result.rows[0];
    }

    static async update(id_service, data) {
        const { name, description, id_company, id_location, service_type, active, image_url } = data;

        const fields = [];
        const values = [];
        let index = 1;

        if (name !== undefined) {
            fields.push(`name = $${index++}`);
            values.push(name);
        }

        if (description !== undefined) {
            fields.push(`description = $${index++}`);
            values.push(description);
        }

        if (id_company !== undefined) {
            fields.push(`id_company = $${index++}`);
            values.push(id_company);
        }

        if (id_location !== undefined) {
            fields.push(`id_location = $${index++}`);
            values.push(id_location);
        }

        if (service_type !== undefined) {
            fields.push(`service_type = $${index++}`);
            values.push(service_type);
        }

        if (active !== undefined) {
            fields.push(`active = $${index++}`);
            values.push(active);
        }

        if (image_url !== undefined) {
            fields.push(`image_url = $${index++}`);
            values.push(image_url);
        }

        if (fields.length === 0) {
            return null;
        }

        const result = await pool.query(
            `UPDATE tourist_service
         SET ${fields.join(', ')}
         WHERE id_service = $${index}
         RETURNING *`,
            [...values, id_service]
        );

        return result.rows[0] || null;
    }

    static async delete(id_service) {
        const result = await pool.query(
            `UPDATE tourist_service 
         SET active = FALSE
         WHERE id_service = $1 AND active = TRUE
         RETURNING *`,
            [id_service]
        );
        return result.rows[0] || null;
    }
}

export default TouristServices;
