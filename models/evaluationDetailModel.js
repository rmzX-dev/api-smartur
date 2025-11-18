import pool from '../config/db.js'

class EvaluationDetail {
    static async findAllEvaluationDetail() {
        const result = await pool.query('SELECT * FROM evaluation_detail')
        return result.rows
    }

    static async findEvaluationDetailById(id_detail) {
        const result = await pool.query(
            'SELECT * FROM evaluation_detail WHERE id_detail = $1',
            [id_detail]
        )
        return result.rows[0]
    }

    static async findEvaluationDetailByEvaluationId(id_evaluation) {
        const result = await pool.query(
            'SELECT * FROM evaluation_detail WHERE id_evaluation = $1',
            [id_evaluation]
        )
        return result.rows
    }

    static async createEvaluationDetail(data) {
        const {
            id_evaluation,
            id_criterion,
            assigned_score,
            id_selected_subcriterion,
            observations,
            attached_evidences,
        } = data

        const evidencesJson = Array.isArray(attached_evidences)
            ? JSON.stringify(attached_evidences)
            : attached_evidences

        const result = await pool.query(
            `INSERT INTO evaluation_detail 
            (id_evaluation, id_criterion, assigned_score, id_selected_subcriterion, observations, attached_evidences, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
            RETURNING *`,
            [
                id_evaluation,
                id_criterion,
                assigned_score,
                id_selected_subcriterion,
                observations,
                evidencesJson,
            ]
        )
        return result.rows[0]
    }

    static async updateEvaluationDetail(id_detail, data) {
        const {
            id_evaluation,
            id_criterion,
            assigned_score,
            id_selected_subcriterion,
            observations,
            attached_evidences,
        } = data

        const evidencesJson = Array.isArray(attached_evidences)
            ? JSON.stringify(attached_evidences)
            : attached_evidences

        const result = await pool.query(
            `UPDATE evaluation_detail 
            SET id_evaluation = $1, id_criterion = $2, assigned_score = $3, 
                id_selected_subcriterion = $4, observations = $5, attached_evidences = $6
            WHERE id_detail = $7 
            RETURNING *`,
            [
                id_evaluation,
                id_criterion,
                assigned_score,
                id_selected_subcriterion,
                observations,
                evidencesJson,
                id_detail,
            ]
        )
        return result.rows[0]
    }

    static async deleteEvaluationDetail(id_detail) {
        const result = await pool.query(
            'DELETE FROM evaluation_detail WHERE id_detail = $1 RETURNING *',
            [id_detail]
        )
        return result.rows[0]
    }
}

export default EvaluationDetail
