import pool from '../config/db.js';

class TourismExpenditure {
    static async findAll(
        page = 1,
        limit = 50,
        id_tourist = null,
        expenditure_type = '',
        destination = ''
    ) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        if (id_tourist !== null) {
            conditions.push(`id_tourist = $${index}`);
            values.push(id_tourist);
            index++;
        }

        if (expenditure_type) {
            conditions.push(`expenditure_type ILIKE $${index}`);
            values.push(`%${expenditure_type}%`);
            index++;
        }

        if (destination) {
            conditions.push(`destination ILIKE $${index}`);
            values.push(`%${destination}%`);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM tourism_expenditure ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // Obtener datos paginados
        const dataQuery = await pool.query(
            `SELECT * FROM tourism_expenditure
             ${whereClause}
             ORDER BY date DESC
             LIMIT $${index}
             OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            expenditures: dataQuery.rows,
        };
    }

    static async findById(id_expenditure) {
        const result = await pool.query(
            'SELECT * FROM tourism_expenditure WHERE id_expenditure = $1',
            [id_expenditure]
        );
        return result.rows[0] || null;
    }

    static async create(data) {
        const { id_tourist, expenditure_type, amount, destination } = data;

        const result = await pool.query(
            `INSERT INTO tourism_expenditure 
            (id_tourist, expenditure_type, amount, destination) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`,
            [id_tourist, expenditure_type, amount, destination]
        );
        return result.rows[0];
    }
}

export default TourismExpenditure;
