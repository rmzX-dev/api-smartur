import pool from '../config/db.js';

class TourismInputs {
    static async findAll(page = 1, limit = 50, id_company = null, input_type = '') {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        if (id_company !== null) {
            conditions.push(`id_company = $${index}`);
            values.push(id_company);
            index++;
        }

        if (input_type) {
            conditions.push(`input_type ILIKE $${index}`);
            values.push(`%${input_type}%`);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM tourism_inputs ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // Obtener datos paginados
        const dataQuery = await pool.query(
            `SELECT * FROM tourism_inputs
             ${whereClause}
             ORDER BY id_input DESC
             LIMIT $${index}
             OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            inputs: dataQuery.rows,
        };
    }

    static async findById(id_input) {
        const result = await pool.query('SELECT * FROM tourism_inputs WHERE id_input = $1', [
            id_input,
        ]);
        return result.rows[0] || null;
    }

    static async create(data) {
        const { id_company, input_type, cost, consumption, carbon_footprint } = data;

        const result = await pool.query(
            `INSERT INTO tourism_inputs 
            (id_company, input_type, cost, consumption, carbon_footprint) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [id_company, input_type, cost, consumption, carbon_footprint]
        );
        return result.rows[0];
    }
}

export default TourismInputs;
