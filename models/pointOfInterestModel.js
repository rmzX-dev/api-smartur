import pool from '../config/db.js';

class PointOfInterest {
    static async findAll(
        page = 1,
        limit = 50,
        search = '',
        id_location = null,
        id_type = null,
        sustainability = null
    ) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        conditions.push(`is_active = TRUE`);

        if (search) {
            conditions.push(`(name ILIKE $${index} OR description ILIKE $${index})`);
            values.push(`%${search}%`);
            index++;
        }

        if (id_location !== null) {
            conditions.push(`id_location = $${index}`);
            values.push(id_location);
            index++;
        }

        if (id_type !== null) {
            conditions.push(`id_type = $${index}`);
            values.push(id_type);
            index++;
        }

        if (sustainability !== null) {
            conditions.push(`sustainability = $${index}`);
            values.push(sustainability);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM point_of_interest ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // Obtener datos paginados
        const dataQuery = await pool.query(
            `SELECT * FROM point_of_interest
             ${whereClause}
             ORDER BY id_point
             LIMIT $${index}
             OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            points: dataQuery.rows,
        };
    }

    static async findById(id_point) {
        const result = await pool.query('SELECT * FROM point_of_interest WHERE id_point = $1 AND is_active = TRUE', [
            id_point,
        ]);
        return result.rows[0] || null;
    }

    static async create(data) {
        const { name, description, id_type, id_location, sustainability, image_url, rating } = data;

        const result = await pool.query(
            `INSERT INTO point_of_interest 
            (name, description, id_type, id_location, sustainability, image_url, rating) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [name, description, id_type, id_location, sustainability ?? false, image_url || null, rating ?? 4.0]
        );
        return result.rows[0];
    }

    static async update(id_point, data) {
        const { name, description, id_type, id_location, sustainability, image_url, rating } = data;

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
        if (id_type !== undefined) {
            fields.push(`id_type = $${index++}`);
            values.push(id_type);
        }
        if (id_location !== undefined) {
            fields.push(`id_location = $${index++}`);
            values.push(id_location);
        }
        if (sustainability !== undefined) {
            fields.push(`sustainability = $${index++}`);
            values.push(sustainability);
        }
        if (image_url !== undefined) {
            fields.push(`image_url = $${index++}`);
            values.push(image_url);
        }
        if (rating !== undefined) {
            fields.push(`rating = $${index++}`);
            values.push(rating);
        }

        if (fields.length === 0) return null;

        const result = await pool.query(
            `UPDATE point_of_interest 
            SET ${fields.join(', ')}
            WHERE id_point = $${index} AND is_active = TRUE
            RETURNING *`,
            [...values, id_point]
        );
        return result.rows[0] || null;
    }

    static async delete(id_point) {
        const result = await pool.query(
            'UPDATE point_of_interest SET is_active = FALSE WHERE id_point = $1 AND is_active = TRUE RETURNING *',
            [id_point]
        );
        return result.rows[0] || null;
    }
}

export default PointOfInterest;
