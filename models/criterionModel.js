import pool from '../config/db.js'

class Criterion {
    static async findAllCriterion() {
        const result = await pool.query('SELECT * FROM evaluation_criterion')
        return result.rows
    }

    static async findCriterionById(id_criterion) {
        const result = await pool.query(
            `SELECT * FROM evaluation_criterion WHERE id_criterion = $1`,
            [id_criterion]
        )
        return result.rows[0]
    }

    static async createCriterion(data) {
        const { id_template, name, description, weight, order_index, active } =
            data 
        const result = await pool.query(
            `INSERT INTO evaluation_criterion (id_template, name, description, weight, order_index, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_criterion, id_template, name, description, weight, order_index, active`, 
            [id_template, name, description, weight, order_index, active]
        )
        return result.rows[0]
    }

    static async deleteCriterion(id_criterion) {
        const result = await pool.query(
            'DELETE FROM evaluation_criterion WHERE id_criterion = $1 RETURNING *',
            [id_criterion]
        )
        return result.rows[0]
    }

    static async updateCriterion(id_criterion, data) {
        const { name, description, weight, order_index, active } = data 
        const result = await pool.query(
            `UPDATE evaluation_criterion SET name = $1, description = $2, weight = $3, order_index = $4, active = $5 WHERE id_criterion = $6 RETURNING id_criterion, id_template, name, description, weight, order_index, active`, 
            [name, description, weight, order_index, active, id_criterion]
        )
        return result.rows[0]
    }
}

export default Criterion
