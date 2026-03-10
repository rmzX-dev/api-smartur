import ServiceEvaluation from '../models/serviceEvaluationModel.js';
import EvaluationDetail from '../models/evaluationDetailModel.js';

class ServiceEvaluationController {
    static async findAllServiceEvaluationController(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);
            const id_service = req.query.id_service ? parseInt(req.query.id_service) : null;
            const status = req.query.status || '';
            const evaluator_id = req.query.evaluator_id ? parseInt(req.query.evaluator_id) : null;

            const result = await ServiceEvaluation.findAllServiceEvaluation(
                page,
                limit,
                id_service,
                status,
                evaluator_id
            );

            res.json({
                message: 'Evaluaciones de servicio obtenidas exitosamente',
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                evaluations: result.evaluations.map((evaluation) => ({
                    id: evaluation.id_evaluation,
                    serviceId: evaluation.id_service,
                    serviceName: evaluation.service_name,
                    restaurantName: evaluation.restaurant_name,
                    restaurantAddress: evaluation.restaurant_address,
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
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error en findAllServiceEvaluationController',
                error: error.message,
            });
        }
    }

    static async findServiceEvaluationByIdController(req, res) {
        try {
            const evaluation = await ServiceEvaluation.findServiceEvaluationById(
                req.params.id_evaluation
            );
            if (!evaluation) {
                return res.status(404).json({ message: 'Evaluación de servicio no encontrada' });
            }

            const details = await EvaluationDetail.findEvaluationDetailByEvaluationId(
                req.params.id_evaluation
            );

            res.status(200).json({
                message: 'Evaluación de servicio obtenida exitosamente',
                evaluation: {
                    id: evaluation.id_evaluation,
                    serviceId: evaluation.id_service,
                    serviceName: evaluation.service_name,
                    restaurantName: evaluation.restaurant_name,
                    restaurantAddress: evaluation.restaurant_address,
                    templateId: evaluation.id_template,
                    evaluationDate: evaluation.evaluation_date,
                    evaluatorId: evaluation.evaluator_id,
                    status: evaluation.status,
                    totalScore: evaluation.total_score,
                    evaluationTime: evaluation.evaluation_time,
                    generalObservations: evaluation.general_observations,
                    createdAt: evaluation.created_at,
                    updatedAt: evaluation.updated_at,
                    details: details,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error en findServiceEvaluationByIdController',
                error: error.message,
            });
        }
    }

    static async createServiceEvaluationController(req, res) {
        try {
            const result = await ServiceEvaluation.createServiceEvaluation(req.body);
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
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error en createServiceEvaluationController',
                error: error.message,
            });
        }
    }

    static async createFullEvaluationController(req, res) {
        try {
            const {
                id_service,
                id_template,
                evaluator_id,
                evaluation_time,
                general_observations,
                details,
                evaluation_date,
            } = req.body;

            if (!details || !Array.isArray(details) || details.length === 0) {
                return res
                    .status(400)
                    .json({ message: 'Se requieren los detalles de la evaluación' });
            }

            const result = await ServiceEvaluation.createCompleteEvaluation(
                {
                    id_service,
                    id_template,
                    evaluator_id,
                    evaluation_time,
                    general_observations,
                    evaluation_date,
                },
                details
            );

            res.status(201).json({
                message: 'Evaluación completa registrada con éxito',
                evaluationId: result.id_evaluation,
                finalScore: result.total_score,
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error en createFullEvaluationController (Backend)',
                error: error.message,
            });
        }
    }

    static async deleteServiceEvaluationController(req, res) {
        try {
            const evaluation = await ServiceEvaluation.deleteServiceEvaluation(
                req.params.id_evaluation
            );
            if (!evaluation) {
                return res.status(404).json({ message: 'Evaluación de servicio no encontrada' });
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
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async updateServiceEvaluationController(req, res) {
        try {
            const evaluation = await ServiceEvaluation.updateServiceEvaluation(
                req.params.id_evaluation,
                req.body
            );
            if (!evaluation) {
                return res.status(404).json({ message: 'Evaluación de servicio no encontrada' });
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
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async updateStatusController(req, res) {
        try {
            const { status } = req.body;
            const evaluation = await ServiceEvaluation.updateStatus(
                req.params.id_evaluation,
                status
            );
            if (!evaluation) {
                return res.status(404).json({ message: 'Evaluación de servicio no encontrada' });
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
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }
}

export default ServiceEvaluationController;
