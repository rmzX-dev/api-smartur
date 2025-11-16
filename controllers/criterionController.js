import Criterion from '../models/criterionModel.js'

class CriterionController {
    static async findAllCriterionController(req, res) {
        try {
            const criteria = await Criterion.findAllCriterion()
            res.json({
                message: 'Criterios obtenidos exitosamente',
                count: criteria.length,
                criteria: criteria.map((criterion) => ({
                    id: criterion.id_criterion,
                    name: criterion.name,
                    description: criterion.description,
                    weight: criterion.weight,
                    order: criterion.order_index,  
                    active: criterion.active,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findCriterionByIdController(req, res) {
        try {
            const criterion = await Criterion.findCriterionById(req.params.id_criterion)
            if (!criterion) {
                return res
                    .status(404)
                    .json({ message: 'Criterio no encontrado' })
            }
            res.status(200).json({
                message: 'Criterio obtenido exitosamente',
                criterion: {
                    id: criterion.id_criterion,
                    name: criterion.name,
                    description: criterion.description,
                    weight: criterion.weight,
                    order: criterion.order_index,  
                    active: criterion.active,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async createCriterionController(req, res) {
        try {
            const result = await Criterion.createCriterion(req.body)
            res.status(201).json({
                message: 'Criterio creado exitosamente',
                criterion: {
                    id: result.id_criterion,
                    name: result.name,
                    description: result.description,
                    weight: result.weight,
                    order: result.order_index, 
                    active: result.active,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async deleteCriterionController(req, res) {
        try {
            const criterion = await Criterion.deleteCriterion(req.params.id_criterion)
            if (!criterion) {
                return res
                    .status(404)
                    .json({ message: 'Criterio no encontrado' })
            }
            res.status(200).json({
                message: 'Criterio eliminado exitosamente',
                criterion: {
                    id: criterion.id_criterion,
                    name: criterion.name,
                    description: criterion.description,
                    weight: criterion.weight,
                    order: criterion.order_index, 
                    active: criterion.active,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async updateCriterionController(req, res) {
        try {
            const criterion = await Criterion.updateCriterion(req.params.id_criterion, req.body)
            if (!criterion) {
                return res
                    .status(404)
                    .json({ message: 'Criterio no encontrado' })
            }
            res.status(200).json({
                message: 'Criterio actualizado exitosamente',
                criterion: {
                    id: criterion.id_criterion,
                    name: criterion.name,
                    description: criterion.description,
                    weight: criterion.weight,
                    order: criterion.order_index, 
                    active: criterion.active,
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

export default CriterionController