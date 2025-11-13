import pool from '../config/db.js'

class company {
    static async findAllCompany() {
        const result = await pool.query(`SELECT * from company`)
        return result.rows
    }

    static async findCompanyById(id_company) {
        const result = await pool.query(
            `SELECT * FROM company WHERE id_company = $1`,
            [id_company]
        )

        return result.rows[0] || null
    }

    static async createCompany(data) {
        const { name, address, phone, id_sector, id_location } = data

        const result = await pool.query(
            'INSERT INTO company (name, address, phone, id_sector, id_location) VALUES ($1,$2,$3,$4,$5) RETURNING id_company, name, address, phone, id_sector, id_location, registration_date',
            [name, address, phone, id_sector, id_location]
        )
        return result.rows[0]
    }

    static async deleteCompany(id_company) {
        const result = await pool.query(
            'DELETE FROM company WHERE id_company = $1 RETURNING *',
            [id_company]
        )

        return result.rows[0]
    }
}

export default company
