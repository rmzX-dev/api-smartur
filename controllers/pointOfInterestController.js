import PointOfInterest from '../models/pointOfInterestModel.js';

class PointOfInterestController {
    static async findAllController(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);
            const search = req.query.search || '';
            const id_location = req.query.id_location ? parseInt(req.query.id_location) : null;
            const id_type = req.query.id_type ? parseInt(req.query.id_type) : null;
            const sustainability =
                req.query.sustainability !== undefined ? req.query.sustainability === 'true' : null;

            const result = await PointOfInterest.findAll(
                page,
                limit,
                search,
                id_location,
                id_type,
                sustainability
            );

            res.json({
                message: 'Puntos de interés obtenidos exitosamente',
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                points: result.points.map((point) => ({
                    id: point.id_point,
                    name: point.name,
                    description: point.description,
                    typeId: point.id_type,
                    locationId: point.id_location,
                    sustainability: point.sustainability,
                })),
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async findByIdController(req, res) {
        try {
            const point = await PointOfInterest.findById(req.params.id_point);
            if (!point) {
                return res.status(404).json({ message: 'Punto de interés no encontrado' });
            }
            res.status(200).json({
                message: 'Punto de interés obtenido exitosamente',
                point: {
                    id: point.id_point,
                    name: point.name,
                    description: point.description,
                    typeId: point.id_type,
                    locationId: point.id_location,
                    sustainability: point.sustainability,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async createController(req, res) {
        try {
            const result = await PointOfInterest.create(req.body);
            res.status(201).json({
                message: 'Punto de interés creado exitosamente',
                point: {
                    id: result.id_point,
                    name: result.name,
                    description: result.description,
                    typeId: result.id_type,
                    locationId: result.id_location,
                    sustainability: result.sustainability,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async deleteController(req, res) {
        try {
            const point = await PointOfInterest.delete(req.params.id_point);
            if (!point) {
                return res.status(404).json({ message: 'Punto de interés no encontrado' });
            }
            res.status(200).json({
                message: 'Punto de interés eliminado exitosamente',
                point: {
                    id: point.id_point,
                    name: point.name,
                    description: point.description,
                    typeId: point.id_type,
                    locationId: point.id_location,
                    sustainability: point.sustainability,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async updateController(req, res) {
        try {
            const point = await PointOfInterest.update(req.params.id_point, req.body);
            if (!point) {
                return res.status(404).json({ message: 'Punto de interés no encontrado' });
            }
            res.status(200).json({
                message: 'Punto de interés actualizado exitosamente',
                point: {
                    id: point.id_point,
                    name: point.name,
                    description: point.description,
                    typeId: point.id_type,
                    locationId: point.id_location,
                    sustainability: point.sustainability,
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

export default PointOfInterestController;
