import pool from '../config/db.js'

class TourismExpenditure {
    static async findAll() {
        const result = await pool.query(
            'SELECT * FROM tourism_expenditure ORDER BY date DESC'
        )
        return result.rows
    }

    static async findById(id_expenditure) {
        const result = await pool.query(
            'SELECT * FROM tourism_expenditure WHERE id_expenditure = $1',
            [id_expenditure]
        )
        return result.rows[0]
    }

    static async create(data) {
        const { id_tourist, expenditure_type, amount, destination } = data

        const result = await pool.query(
            `INSERT INTO tourism_expenditure 
            (id_tourist, expenditure_type, amount, destination) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`,
            [id_tourist, expenditure_type, amount, destination]
        )
        return result.rows[0]
    }
}

export default TourismExpenditure
