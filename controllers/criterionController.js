import Criterion from '../models/criterionModel.js';

class CriterionController {
    static async findAllCriterionController(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);
            const search = req.query.search || '';
            const id_template = req.query.id_template ? parseInt(req.query.id_template) : null;
            const active = req.query.active !== undefined ? req.query.active === 'true' : null;

            const result = await Criterion.findAllCriterion(
                page,
                limit,
                search,
                id_template,
                active
            );

            res.json({
                message: 'Criterios obtenidos exitosamente',
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                criteria: result.criteria.map((criterion) => ({
                    id_criterion: criterion.id_criterion,
                    id_template: criterion.id_template,
                    name: criterion.name,
                    description: criterion.description,
                    weight: criterion.weight,
                    order_index: criterion.order_index,
                    active: criterion.active,
                    field_type: criterion.field_type || 'scale',
                    is_required: criterion.is_required !== false,
                })),
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async findCriterionByIdController(req, res) {
        try {
            const criterion = await Criterion.findCriterionById(req.params.id_criterion);
            if (!criterion) {
                return res.status(404).json({ message: 'Criterio no encontrado' });
            }
            res.status(200).json({
                message: 'Criterio obtenido exitosamente',
                criterion: {
                    id_criterion: criterion.id_criterion,
                    id_template: criterion.id_template,
                    name: criterion.name,
                    description: criterion.description,
                    weight: criterion.weight,
                    order_index: criterion.order_index,
                    active: criterion.active,
                    field_type: criterion.field_type || 'scale',
                    is_required: criterion.is_required !== false,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async createCriterionController(req, res) {
        try {
            const result = await Criterion.createCriterion(req.body);
            res.status(201).json({
                message: 'Criterio creado exitosamente',
                criterion: {
                    id_criterion: result.id_criterion,
                    id_template: result.id_template,
                    name: result.name,
                    description: result.description,
                    weight: result.weight,
                    order_index: result.order_index,
                    active: result.active,
                    field_type: result.field_type,
                    is_required: result.is_required,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async deleteCriterionController(req, res) {
        try {
            const criterion = await Criterion.deleteCriterion(req.params.id_criterion);
            if (!criterion) {
                return res.status(404).json({ message: 'Criterio no encontrado' });
            }
            res.status(200).json({
                message: 'Criterio eliminado exitosamente',
                criterion: {
                    id_criterion: criterion.id_criterion,
                    id_template: criterion.id_template,
                    name: criterion.name,
                    description: criterion.description,
                    weight: criterion.weight,
                    order_index: criterion.order_index,
                    active: criterion.active,
                    field_type: criterion.field_type || 'scale',
                    is_required: criterion.is_required !== false,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async updateCriterionController(req, res) {
        try {
            const criterion = await Criterion.updateCriterion(req.params.id_criterion, req.body);
            if (!criterion) {
                return res.status(404).json({ message: 'Criterio no encontrado' });
            }
            res.status(200).json({
                message: 'Criterio actualizado exitosamente',
                criterion: {
                    id_criterion: criterion.id_criterion,
                    id_template: criterion.id_template,
                    name: criterion.name,
                    description: criterion.description,
                    weight: criterion.weight,
                    order_index: criterion.order_index,
                    active: criterion.active,
                    field_type: criterion.field_type || 'scale',
                    is_required: criterion.is_required !== false,
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

export default CriterionController;
