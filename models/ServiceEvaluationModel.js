import pool from '../config/db.js'

class ServiceEvaluation {
    static async findAllServiceEvaluation() {
        const result = await pool.query('SELECT * FROM service_evaluation')
        return result.rows
    }

    static async findServiceEvaluationById(id_evaluation) {
        const result = await pool.query(
            'SELECT * FROM service_evaluation WHERE id_evaluation = $1',
            [id_evaluation]
        )
        return result.rows[0]
    }

    static async createServiceEvaluation(data) {
        const {
            id_service,
            id_template,
            evaluation_date,
            evaluator_id,
            status,
            total_score,
            evaluation_time,
            general_observations,
        } = data

        const result = await pool.query(
            `INSERT INTO service_evaluation 
            (id_service, id_template, evaluation_date, evaluator_id, status, total_score, evaluation_time, general_observations, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
            RETURNING *`,
            [
                id_service,
                id_template,
                evaluation_date,
                evaluator_id,
                status,
                total_score,
                evaluation_time,
                general_observations,
            ]
        )
        return result.rows[0]
    }

    static async updateServiceEvaluation(id_evaluation, data) {
        const {
            id_service,
            id_template,
            evaluation_date,
            evaluator_id,
            status,
            total_score,
            evaluation_time,
            general_observations,
        } = data

        const result = await pool.query(
            `UPDATE service_evaluation 
            SET id_service = $1, id_template = $2, evaluation_date = $3, evaluator_id = $4, 
                status = $5, total_score = $6, evaluation_time = $7, general_observations = $8, 
                updated_at = NOW() 
            WHERE id_evaluation = $9 
            RETURNING *`,
            [
                id_service,
                id_template,
                evaluation_date,
                evaluator_id,
                status,
                total_score,
                evaluation_time,
                general_observations,
                id_evaluation,
            ]
        )
        return result.rows[0]
    }

    static async deleteServiceEvaluation(id_evaluation) {
        const result = await pool.query(
            'DELETE FROM service_evaluation WHERE id_evaluation = $1 RETURNING *',
            [id_evaluation]
        )
        return result.rows[0]
    }

    static async updateStatus(id_evaluation, status) {
        const result = await pool.query(
            'UPDATE service_evaluation SET status = $1, updated_at = NOW() WHERE id_evaluation = $2 RETURNING *',
            [status, id_evaluation]
        )
        return result.rows[0]
    }
}

export default ServiceEvaluation
