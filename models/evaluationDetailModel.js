import pool from '../config/db.js';

class EvaluationDetail {
    static async findAllEvaluationDetail(
        page = 1,
        limit = 50,
        id_evaluation = null,
        id_criterion = null
    ) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        conditions.push(`is_active = TRUE`);

        if (id_evaluation !== null) {
            conditions.push(`id_evaluation = $${index}`);
            values.push(id_evaluation);
            index++;
        }

        if (id_criterion !== null) {
            conditions.push(`id_criterion = $${index}`);
            values.push(id_criterion);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM evaluation_detail ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // Obtener datos paginados
        const dataQuery = await pool.query(
            `SELECT * FROM evaluation_detail
             ${whereClause}
             ORDER BY id_detail
             LIMIT $${index}
             OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            details: dataQuery.rows,
        };
    }

    static async findEvaluationDetailById(id_detail) {
        const result = await pool.query('SELECT * FROM evaluation_detail WHERE id_detail = $1 AND is_active = TRUE', [
            id_detail,
        ]);
        return result.rows[0] || null;
    }

    static async findEvaluationDetailByEvaluationId(id_evaluation) {
        const result = await pool.query(
            `SELECT ed.*, ec.name as criterion_name 
             FROM evaluation_detail ed
             INNER JOIN evaluation_criterion ec ON ed.id_criterion = ec.id_criterion
             WHERE ed.id_evaluation = $1 AND ed.is_active = TRUE`,
            [id_evaluation]
        );
        return result.rows;
    }

    static async createEvaluationDetail(data) {
        const {
            id_evaluation,
            id_criterion,
            assigned_score,
            id_selected_subcriterion,
            observations,
            attached_evidences,
        } = data;

        // Formateo JSON obligatorio
        const evidencesJson = JSON.stringify(attached_evidences || []);

        // Asegurar null para id_selected_subcriterion si no es válido
        const subcriterionId =
            id_selected_subcriterion && !isNaN(id_selected_subcriterion)
                ? id_selected_subcriterion
                : null;

        const result = await pool.query(
            `INSERT INTO evaluation_detail 
            (id_evaluation, id_criterion, assigned_score, id_selected_subcriterion, observations, attached_evidences, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
            RETURNING *`,
            [
                id_evaluation,
                id_criterion,
                Number(assigned_score || 0),
                subcriterionId,
                observations,
                evidencesJson,
            ]
        );
        return result.rows[0];
    }

    static async updateEvaluationDetail(id_detail, data) {
        const {
            id_evaluation,
            id_criterion,
            assigned_score,
            id_selected_subcriterion,
            observations,
            attached_evidences,
        } = data;

        const fields = [];
        const values = [];
        let index = 1;

        if (id_evaluation !== undefined) {
            fields.push(`id_evaluation = $${index++}`);
            values.push(id_evaluation);
        }
        if (id_criterion !== undefined) {
            fields.push(`id_criterion = $${index++}`);
            values.push(id_criterion);
        }
        if (assigned_score !== undefined) {
            fields.push(`assigned_score = $${index++}`);
            values.push(Number(assigned_score || 0));
        }
        if (id_selected_subcriterion !== undefined) {
            const subcriterionId =
                id_selected_subcriterion && !isNaN(id_selected_subcriterion)
                    ? id_selected_subcriterion
                    : null;
            fields.push(`id_selected_subcriterion = $${index++}`);
            values.push(subcriterionId);
        }
        if (observations !== undefined) {
            fields.push(`observations = $${index++}`);
            values.push(observations);
        }
        if (attached_evidences !== undefined) {
            fields.push(`attached_evidences = $${index++}`);
            values.push(JSON.stringify(attached_evidences || []));
        }

        if (fields.length === 0) return null;

        const result = await pool.query(
            `UPDATE evaluation_detail 
            SET ${fields.join(', ')}
            WHERE id_detail = $${index} AND is_active = TRUE
            RETURNING *`,
            [...values, id_detail]
        );
        return result.rows[0] || null;
    }

    static async deleteEvaluationDetail(id_detail) {
        const result = await pool.query(
            'UPDATE evaluation_detail SET is_active = FALSE WHERE id_detail = $1 AND is_active = TRUE RETURNING *',
            [id_detail]
        );
        return result.rows[0] || null;
    }
}

export default EvaluationDetail;
