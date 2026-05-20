import Subcriterion from '../models/subcriterionModel.js';

class SubcriterionController {
    static async findAllByCriterion(req, res) {
        try {
            const subcriteria = await Subcriterion.findAllByCriterion(req.params.id_criterion);
            res.json({
                message: 'Subcriterios obtenidos exitosamente',
                subcriteria,
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error al obtener subcriterios',
                error: error.message,
            });
        }
    }

    static async create(req, res) {
        try {
            const { id_criterion, description, score, order_index } = req.body;
            if (!id_criterion || !description) {
                return res.status(400).json({ message: 'id_criterion y description son requeridos' });
            }
            const subcriterion = await Subcriterion.create(req.body);
            res.status(201).json({
                message: 'Subcriterio creado exitosamente',
                subcriterion,
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error al crear subcriterio',
                error: error.message,
            });
        }
    }

    static async update(req, res) {
        try {
            const subcriterion = await Subcriterion.update(req.params.id_subcriterion, req.body);
            if (!subcriterion) {
                return res.status(404).json({ message: 'Subcriterio no encontrado' });
            }
            res.json({
                message: 'Subcriterio actualizado exitosamente',
                subcriterion,
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error al actualizar subcriterio',
                error: error.message,
            });
        }
    }

    static async delete(req, res) {
        try {
            const subcriterion = await Subcriterion.delete(req.params.id_subcriterion);
            if (!subcriterion) {
                return res.status(404).json({ message: 'Subcriterio no encontrado' });
            }
            res.json({
                message: 'Subcriterio eliminado exitosamente',
                subcriterion,
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error al eliminar subcriterio',
                error: error.message,
            });
        }
    }

    static async batchUpdate(req, res) {
        try {
            const { id_criterion } = req.params;
            const { subcriteria } = req.body;
            if (!Array.isArray(subcriteria)) {
                return res.status(400).json({ message: 'subcriteria debe ser un arreglo' });
            }
            const result = await Subcriterion.batchUpdate(id_criterion, subcriteria);
            res.json({
                message: 'Subcriterios actualizados exitosamente',
                subcriteria: result,
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error al actualizar subcriterios',
                error: error.message,
            });
        }
    }
}

export default SubcriterionController;
