import EvaluationDetail from '../models/evaluationDetailModel.js'

class EvaluationDetailController {
    static async findAllEvaluationDetailController(req, res) {
        try {
            const details = await EvaluationDetail.findAllEvaluationDetail()
            res.json({
                message: 'Detalles de evaluación obtenidos exitosamente',
                count: details.length,
                details: details.map((detail) => ({
                    id: detail.id_detail,
                    evaluationId: detail.id_evaluation,
                    criterionId: detail.id_criterion,
                    assignedScore: detail.assigned_score,
                    selectedSubcriterionId: detail.id_selected_subcriterion,
                    observations: detail.observations,
                    attachedEvidences: detail.attached_evidences,
                    createdAt: detail.created_at,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findEvaluationDetailByIdController(req, res) {
        try {
            const detail = await EvaluationDetail.findEvaluationDetailById(
                req.params.id_detail
            )
            if (!detail) {
                return res
                    .status(404)
                    .json({ message: 'Detalle de evaluación no encontrado' })
            }
            res.status(200).json({
                message: 'Detalle de evaluación obtenido exitosamente',
                detail: {
                    id: detail.id_detail,
                    evaluationId: detail.id_evaluation,
                    criterionId: detail.id_criterion,
                    assignedScore: detail.assigned_score,
                    selectedSubcriterionId: detail.id_selected_subcriterion,
                    observations: detail.observations,
                    attachedEvidences: detail.attached_evidences,
                    createdAt: detail.created_at,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findEvaluationDetailByEvaluationIdController(req, res) {
        try {
            const details =
                await EvaluationDetail.findEvaluationDetailByEvaluationId(
                    req.params.id_evaluation
                )
            res.status(200).json({
                message:
                    'Detalles de evaluación por evaluación obtenidos exitosamente',
                count: details.length,
                details: details.map((detail) => ({
                    id: detail.id_detail,
                    evaluationId: detail.id_evaluation,
                    criterionId: detail.id_criterion,
                    assignedScore: detail.assigned_score,
                    selectedSubcriterionId: detail.id_selected_subcriterion,
                    observations: detail.observations,
                    attachedEvidences: detail.attached_evidences,
                    createdAt: detail.created_at,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async createEvaluationDetailController(req, res) {
        try {
            const result = await EvaluationDetail.createEvaluationDetail(
                req.body
            )
            res.status(201).json({
                message: 'Detalle de evaluación creado exitosamente',
                detail: {
                    id: result.id_detail,
                    evaluationId: result.id_evaluation,
                    criterionId: result.id_criterion,
                    assignedScore: result.assigned_score,
                    selectedSubcriterionId: result.id_selected_subcriterion,
                    observations: result.observations,
                    attachedEvidences: result.attached_evidences,
                    createdAt: result.created_at,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async deleteEvaluationDetailController(req, res) {
        try {
            const detail = await EvaluationDetail.deleteEvaluationDetail(
                req.params.id_detail
            )
            if (!detail) {
                return res
                    .status(404)
                    .json({ message: 'Detalle de evaluación no encontrado' })
            }
            res.status(200).json({
                message: 'Detalle de evaluación eliminado exitosamente',
                detail: {
                    id: detail.id_detail,
                    evaluationId: detail.id_evaluation,
                    criterionId: detail.id_criterion,
                    assignedScore: detail.assigned_score,
                    selectedSubcriterionId: detail.id_selected_subcriterion,
                    observations: detail.observations,
                    attachedEvidences: detail.attached_evidences,
                    createdAt: detail.created_at,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async updateEvaluationDetailController(req, res) {
        try {
            const detail = await EvaluationDetail.updateEvaluationDetail(
                req.params.id_detail,
                req.body
            )
            if (!detail) {
                return res
                    .status(404)
                    .json({ message: 'Detalle de evaluación no encontrado' })
            }
            res.status(200).json({
                message: 'Detalle de evaluación actualizado exitosamente',
                detail: {
                    id: detail.id_detail,
                    evaluationId: detail.id_evaluation,
                    criterionId: detail.id_criterion,
                    assignedScore: detail.assigned_score,
                    selectedSubcriterionId: detail.id_selected_subcriterion,
                    observations: detail.observations,
                    attachedEvidences: detail.attached_evidences,
                    createdAt: detail.created_at,
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

export default EvaluationDetailController
