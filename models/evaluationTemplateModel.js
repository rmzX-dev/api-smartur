import pool from '../config/db.js'

class Template {
    static async findTemplate() {
        const result = await pool.query('SELECT * FROM evaluation_template')
        return result.rows
    }

    static async findTemplateByid(id_template) {
        const result = await pool.query(
            'select * from evaluation_template WHERE id_template = $1',
            [id_template]
        )
        return result.rows[0]
    }

    static async createTemplate(data) {
        const { name, version, service_type, active } = data

        const result = await pool.query(
            `INSERT INTO evaluation_template (name, version, service_type, active) VALUES ($1 , $2, $3, $4) RETURNING name, version, service_type, active`,
            [name, version, service_type, active]
        )
        return result.rows[0]
    }

    static async deleteTemplate(id_template) {
        const result = await pool.query(
            'DELETE FROM evaluation_template WHERE id_template = $1 RETURNING name, version, service_type, active',
            [id_template]
        )
        return result.rows[0]
    }
}

export default Template
