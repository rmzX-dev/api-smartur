import pool from '../config/db.js'

class TourismInputs {
    async create(data) {
        const { id_company, input_type, cost, consumption, carbon_footprint } =
            data

        const result = await pool.query(
            `INSERT INTO tourism_inputs 
            (id_company, input_type, cost, consumption, carbon_footprint) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [id_company, input_type, cost, consumption, carbon_footprint]
        )
        return result.rows[0]
    }

    async findAll() {
        const result = await pool.query(
            'SELECT * FROM tourism_inputs ORDER BY id_input DESC'
        )
        return result.rows
    }

    async findById(id_input) {
        const result = await pool.query(
            'SELECT * FROM tourism_inputs WHERE id_input = $1',
            [id_input]
        )
        return result.rows[0]
    }
}

export default new TourismInputs()
