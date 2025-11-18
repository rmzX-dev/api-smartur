import pool from '../config/db.js'

class PointOfInterest {
    static async findAll() {
        const result = await pool.query('SELECT * FROM point_of_interest')
        return result.rows
    }

    static async findById(id_point) {
        const result = await pool.query(
            'SELECT * FROM point_of_interest WHERE id_point = $1',
            [id_point]
        )
        return result.rows[0]
    }

    static async create(data) {
        const { name, description, id_type, id_location, sustainability } = data

        const result = await pool.query(
            `INSERT INTO point_of_interest 
            (name, description, id_type, id_location, sustainability) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [name, description, id_type, id_location, sustainability]
        )
        return result.rows[0]
    }

    static async update(id_point, data) {
        const { name, description, id_type, id_location, sustainability } = data

        const result = await pool.query(
            `UPDATE point_of_interest 
            SET name = $1, description = $2, id_type = $3, id_location = $4, sustainability = $5
            WHERE id_point = $6 
            RETURNING *`,
            [name, description, id_type, id_location, sustainability, id_point]
        )
        return result.rows[0]
    }

    static async delete(id_point) {
        const result = await pool.query(
            'DELETE FROM point_of_interest WHERE id_point = $1 RETURNING *',
            [id_point]
        )
        return result.rows[0]
    }
}

export default PointOfInterest
