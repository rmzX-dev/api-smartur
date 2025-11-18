import pool from '../config/db.js'

class TourismEmployment {
    async create(data) {
        const {
            id_company,
            position,
            contract_type,
            gender,
            salary,
            start_date,
        } = data

        const result = await pool.query(
            `INSERT INTO tourism_employment 
            (id_company, position, contract_type, gender, salary, start_date) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [id_company, position, contract_type, gender, salary, start_date]
        )
        return result.rows[0]
    }

    async findAll() {
        const result = await pool.query(
            'SELECT * FROM tourism_employment ORDER BY start_date DESC'
        )
        return result.rows
    }

    async findById(id_employment) {
        const result = await pool.query(
            'SELECT * FROM tourism_employment WHERE id_employment = $1',
            [id_employment]
        )
        return result.rows[0]
    }
}

export default new TourismEmployment()
