import pool from '../config/db.js';

class Location {
    static async findAll(page = 1, limit = 50, search = '', state = '') {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        conditions.push(`is_active = TRUE`);

        if (search) {
            conditions.push(`name ILIKE $${index}`);
            values.push(`%${search}%`);
            index++;
        }

        if (state) {
            conditions.push(`state ILIKE $${index}`);
            values.push(`%${state}%`);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // 1️⃣ Contar total con filtros
        const countQuery = await pool.query(`SELECT COUNT(*) FROM location ${whereClause}`, values);

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // 2️⃣ Obtener datos paginados
        const dataQuery = await pool.query(
            `
        SELECT *
        FROM location
        ${whereClause}
        ORDER BY id_location
        LIMIT $${index}
        OFFSET $${index + 1}
        `,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            locations: dataQuery.rows,
        };
    }

    static async findById(id_location) {
        const result = await pool.query(
            `SELECT * FROM location 
         WHERE id_location = $1 AND is_active = TRUE`,
            [id_location]
        );
        return result.rows[0] || null;
    }

    static async create(data) {
        const { name, state, municipality, latitude, longitude } = data;

        const result = await pool.query(
            `INSERT INTO location (name, state, municipality, latitude, longitude) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [name, state, municipality, latitude, longitude]
        );

        return result.rows[0];
    }

    static async update(id_location, data) {
        const { name, state, municipality, latitude, longitude } = data;

        const fields = [];
        const values = [];
        let index = 1;

        if (name !== undefined) {
            fields.push(`name = $${index++}`);
            values.push(name);
        }

        if (state !== undefined) {
            fields.push(`state = $${index++}`);
            values.push(state);
        }

        if (municipality !== undefined) {
            fields.push(`municipality = $${index++}`);
            values.push(municipality);
        }

        if (latitude !== undefined) {
            fields.push(`latitude = $${index++}`);
            values.push(latitude);
        }

        if (longitude !== undefined) {
            fields.push(`longitude = $${index++}`);
            values.push(longitude);
        }

        if (fields.length === 0) {
            return null;
        }

        const result = await pool.query(
            `UPDATE location
         SET ${fields.join(', ')}
         WHERE id_location = $${index} AND is_active = TRUE
         RETURNING *`,
            [...values, id_location]
        );

        return result.rows[0] || null;
    }

    static async delete(id_location) {
        const result = await pool.query(
            `UPDATE location
         SET is_active = FALSE
         WHERE id_location = $1 AND is_active = TRUE
         RETURNING *`,
            [id_location]
        );
        return result.rows[0] || null;
    }
}

export default Location;
