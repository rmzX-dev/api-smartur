import pool from '../config/db.js';

class TourismEmployment {
    static async findAll(page = 1, limit = 50, id_company = null, gender = '', contract_type = '') {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        if (id_company !== null) {
            conditions.push(`id_company = $${index}`);
            values.push(id_company);
            index++;
        }

        if (gender) {
            conditions.push(`gender ILIKE $${index}`);
            values.push(`%${gender}%`);
            index++;
        }

        if (contract_type) {
            conditions.push(`contract_type ILIKE $${index}`);
            values.push(`%${contract_type}%`);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM tourism_employment ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // Obtener datos paginados
        const dataQuery = await pool.query(
            `SELECT * FROM tourism_employment
             ${whereClause}
             ORDER BY start_date DESC
             LIMIT $${index}
             OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            employments: dataQuery.rows,
        };
    }

    static async findById(id_employment) {
        const result = await pool.query(
            'SELECT * FROM tourism_employment WHERE id_employment = $1',
            [id_employment]
        );
        return result.rows[0] || null;
    }

    static async create(data) {
        const { id_company, position, contract_type, gender, salary, start_date } = data;

        const result = await pool.query(
            `INSERT INTO tourism_employment 
            (id_company, position, contract_type, gender, salary, start_date) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [id_company, position, contract_type, gender, salary, start_date]
        );
        return result.rows[0];
    }
}

export default TourismEmployment;
