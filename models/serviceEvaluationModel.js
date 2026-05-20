import pool from '../config/db.js';

class ServiceEvaluation {
    static async findAllServiceEvaluation(
        page = 1,
        limit = 50,
        id_service = null,
        status = '',
        evaluator_id = null
    ) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        conditions.push(`e.is_active = TRUE`);

        if (id_service !== null) {
            conditions.push(`e.id_service = $${index}`);
            values.push(id_service);
            index++;
        }

        if (status) {
            conditions.push(`e.status ILIKE $${index}`);
            values.push(`%${status}%`);
            index++;
        }

        if (evaluator_id !== null) {
            conditions.push(`e.evaluator_id = $${index}`);
            values.push(evaluator_id);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM service_evaluation e ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // Obtener datos paginados
        const dataQuery = await pool.query(
            `SELECT 
                e.*, 
                s.name as service_name, 
                c.name as restaurant_name, 
                c.address as restaurant_address
            FROM service_evaluation e
            INNER JOIN tourist_service s ON e.id_service = s.id_service
            INNER JOIN company c ON s.id_company = c.id_company
            ${whereClause}
            ORDER BY e.created_at DESC
            LIMIT $${index}
            OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            evaluations: dataQuery.rows,
        };
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
            WHERE e.id_evaluation = $1 AND e.is_active = TRUE
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
            WHERE id_evaluation = $9 AND is_active = TRUE
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
            "UPDATE service_evaluation SET is_active = FALSE, status = 'deleted', updated_at = NOW() WHERE id_evaluation = $1 AND is_active = TRUE RETURNING *",
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
