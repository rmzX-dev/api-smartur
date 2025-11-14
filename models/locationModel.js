import pool from '../config/db.js'

class Location {
    static async getLocation() {
        const result = await pool.query('SELECT * FROM location')
        return result.rows
    }

    static async getLocationById(id_location) {
        const result = await pool.query(
            'SELECT id_location, name, state, municipality, latitude, longitude FROM location WHERE id_location = $1',
            [id_location]
        )
        return result.rows[0] || null
    }

    static async createLocation(data) {
        const { name, state, municipality, latitude, longitude } = data
        const result = await pool.query(
            'INSERT INTO location (name, state, municipality, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING id_location, name, state, municipality, latitude, longitude',
            [name, state, municipality, latitude, longitude]
        )
        return result.rows[0]
    }

    static async deleteLocation(id_location) {
        const result = await pool.query(
            'DELETE FROM location WHERE id_location = $1 RETURNING *',
            [id_location]
        )

        if (result.rows.length === 0) {
            throw new Error('Ubicacion no encontrada')
        }

        return result.rows[0]
    }
}

export default Location
