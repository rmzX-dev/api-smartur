import ServiceEvaluation from "../models/ServiceEvaluationModel.js"

class ServiceEvaluationController {
    static async findAllServiceEvaluationController(req, res) {
        try {
            const evaluations = await ServiceEvaluation.findAllServiceEvaluation()
            res.json({
                message: 'Evaluaciones de servicio obtenidas exitosamente',
                count: evaluations.length,
                evaluations: evaluations.map((evaluation) => ({
                    id: evaluation.id_evaluation,
                    serviceId: evaluation.id_service,
                    templateId: evaluation.id_template,
                    evaluationDate: evaluation.evaluation_date,
                    evaluatorId: evaluation.evaluator_id,
                    status: evaluation.status,
                    totalScore: evaluation.total_score,
                    evaluationTime: evaluation.evaluation_time,
                    generalObservations: evaluation.general_observations,
                    createdAt: evaluation.created_at,
                    updatedAt: evaluation.updated_at,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findServiceEvaluationByIdController(req, res) {
        try {
            const evaluation = await ServiceEvaluation.findServiceEvaluationById(req.params.id_evaluation)
            if (!evaluation) {
                return res
                    .status(404)
                    .json({ message: 'Evaluación de servicio no encontrada' })
            }
            res.status(200).json({
                message: 'Evaluación de servicio obtenida exitosamente',
                evaluation: {
                    id: evaluation.id_evaluation,
                    serviceId: evaluation.id_service,
                    templateId: evaluation.id_template,
                    evaluationDate: evaluation.evaluation_date,
                    evaluatorId: evaluation.evaluator_id,
                    status: evaluation.status,
                    totalScore: evaluation.total_score,
                    evaluationTime: evaluation.evaluation_time,
                    generalObservations: evaluation.general_observations,
                    createdAt: evaluation.created_at,
                    updatedAt: evaluation.updated_at,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async createServiceEvaluationController(req, res) {
        try {
            const result = await ServiceEvaluation.createServiceEvaluation(req.body)
            res.status(201).json({
                message: 'Evaluación de servicio creada exitosamente',
                evaluation: {
                    id: result.id_evaluation,
                    serviceId: result.id_service,
                    templateId: result.id_template,
                    evaluationDate: result.evaluation_date,
                    evaluatorId: result.evaluator_id,
                    status: result.status,
                    totalScore: result.total_score,
                    evaluationTime: result.evaluation_time,
                    generalObservations: result.general_observations,
                    createdAt: result.created_at,
                    updatedAt: result.updated_at,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async deleteServiceEvaluationController(req, res) {
        try {
            const evaluation = await ServiceEvaluation.deleteServiceEvaluation(req.params.id_evaluation)
            if (!evaluation) {
                return res
                    .status(404)
                    .json({ message: 'Evaluación de servicio no encontrada' })
            }
            res.status(200).json({
                message: 'Evaluación de servicio eliminada exitosamente',
                evaluation: {
                    id: evaluation.id_evaluation,
                    serviceId: evaluation.id_service,
                    templateId: evaluation.id_template,
                    evaluationDate: evaluation.evaluation_date,
                    evaluatorId: evaluation.evaluator_id,
                    status: evaluation.status,
                    totalScore: evaluation.total_score,
                    evaluationTime: evaluation.evaluation_time,
                    generalObservations: evaluation.general_observations,
                    createdAt: evaluation.created_at,
                    updatedAt: evaluation.updated_at,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async updateServiceEvaluationController(req, res) {
        try {
            const evaluation = await ServiceEvaluation.updateServiceEvaluation(req.params.id_evaluation, req.body)
            if (!evaluation) {
                return res
                    .status(404)
                    .json({ message: 'Evaluación de servicio no encontrada' })
            }
            res.status(200).json({
                message: 'Evaluación de servicio actualizada exitosamente',
                evaluation: {
                    id: evaluation.id_evaluation,
                    serviceId: evaluation.id_service,
                    templateId: evaluation.id_template,
                    evaluationDate: evaluation.evaluation_date,
                    evaluatorId: evaluation.evaluator_id,
                    status: evaluation.status,
                    totalScore: evaluation.total_score,
                    evaluationTime: evaluation.evaluation_time,
                    generalObservations: evaluation.general_observations,
                    createdAt: evaluation.created_at,
                    updatedAt: evaluation.updated_at,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async updateStatusController(req, res) {
        try {
            const { status } = req.body
            const evaluation = await ServiceEvaluation.updateStatus(req.params.id_evaluation, status)
            if (!evaluation) {
                return res
                    .status(404)
                    .json({ message: 'Evaluación de servicio no encontrada' })
            }
            res.status(200).json({
                message: 'Estado de evaluación actualizado exitosamente',
                evaluation: {
                    id: evaluation.id_evaluation,
                    serviceId: evaluation.id_service,
                    templateId: evaluation.id_template,
                    evaluationDate: evaluation.evaluation_date,
                    evaluatorId: evaluation.evaluator_id,
                    status: evaluation.status,
                    totalScore: evaluation.total_score,
                    evaluationTime: evaluation.evaluation_time,
                    generalObservations: evaluation.general_observations,
                    updatedAt: evaluation.updated_at,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }
}

export default ServiceEvaluationController