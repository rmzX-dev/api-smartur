import pool from '../config/db.js';

class ServiceEvaluation {
    static async findAllServiceEvaluation() {
        const query = `
            SELECT 
                e.*, 
                s.name as service_name, 
                c.name as restaurant_name, 
                c.address as restaurant_address
            FROM service_evaluation e
            INNER JOIN tourist_service s ON e.id_service = s.id_service
            INNER JOIN company c ON s.id_company = c.id_company
            ORDER BY e.created_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    static async findServiceEvaluationById(id_evaluation) {
        const query = `
            SELECT 
                e.*, 
                s.name as service_name, 
                c.name as restaurant_name, 
                c.address as restaurant_address
            FROM service_evaluation e
            INNER JOIN tourist_service s ON e.id_service = s.id_service
            INNER JOIN company c ON s.id_company = c.id_company
            WHERE e.id_evaluation = $1
        `;
        const result = await pool.query(query, [id_evaluation]);
        return result.rows[0];
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
        } = data;

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
        );
        return result.rows[0];
    }

    static async createCompleteEvaluation(evaluationData, details) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const {
                id_service,
                id_template,
                evaluator_id,
                evaluation_time,
                general_observations,
                evaluation_date,
            } = evaluationData;

            // 1. Validar que el servicio existe
            const serviceCheck = await client.query(
                'SELECT id_service FROM tourist_service WHERE id_service = $1',
                [id_service]
            );
            if (serviceCheck.rowCount === 0) throw new Error('Servicio turístico no encontrado');

            // 2. Calcular puntaje total promediado o sumado
            const totalScore =
                details.length > 0
                    ? details.reduce((acc, curr) => acc + Number(curr.assigned_score || 0), 0) /
                      details.length
                    : 0;

            // 3. Insertar Cabecera
            const headerResult = await client.query(
                `INSERT INTO service_evaluation 
                (id_service, id_template, evaluation_date, evaluator_id, status, total_score, evaluation_time, general_observations, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, 'completed', $5, $6, $7, NOW(), NOW()) 
                RETURNING id_evaluation, total_score`,
                [
                    id_service,
                    id_template,
                    evaluation_date || new Date(),
                    evaluator_id,
                    totalScore,
                    evaluation_time,
                    general_observations,
                ]
            );

            const id_evaluation = headerResult.rows[0].id_evaluation;

            // 4. Inserción Masiva de Detalles
            for (const detail of details) {
                // Formateo JSON obligatorio
                const evidencesJson = JSON.stringify(detail.attached_evidences || []);

                // Asegurar null para id_selected_subcriterion si no es válido
                const subcriterionId =
                    detail.id_selected_subcriterion && !isNaN(detail.id_selected_subcriterion)
                        ? detail.id_selected_subcriterion
                        : null;

                await client.query(
                    `INSERT INTO evaluation_detail 
                    (id_evaluation, id_criterion, assigned_score, id_selected_subcriterion, observations, attached_evidences, created_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                    [
                        id_evaluation,
                        detail.id_criterion,
                        Number(detail.assigned_score || 0),
                        subcriterionId,
                        detail.observations,
                        evidencesJson,
                    ]
                );
            }

            await client.query('COMMIT');
            return { id_evaluation, total_score: totalScore };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
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
        } = data;

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
        );
        return result.rows[0];
    }

    static async deleteServiceEvaluation(id_evaluation) {
        const result = await pool.query(
            'DELETE FROM service_evaluation WHERE id_evaluation = $1 RETURNING *',
            [id_evaluation]
        );
        return result.rows[0];
    }

    static async updateStatus(id_evaluation, status) {
        const result = await pool.query(
            'UPDATE service_evaluation SET status = $1, updated_at = NOW() WHERE id_evaluation = $2 RETURNING *',
            [status, id_evaluation]
        );
        return result.rows[0];
    }
}

export default ServiceEvaluation;
