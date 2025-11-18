import PointOfInterest from '../models/pointOfInterestModel.js'

class PointOfInterestController {
    static async findAllController(req, res) {
        try {
            const points = await PointOfInterest.findAll()
            res.json({
                message: 'Puntos de interés obtenidos exitosamente',
                count: points.length,
                points: points.map((point) => ({
                    id: point.id_point,
                    name: point.name,
                    description: point.description,
                    typeId: point.id_type,
                    locationId: point.id_location,
                    sustainability: point.sustainability,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findByIdController(req, res) {
        try {
            const point = await PointOfInterest.findById(req.params.id_point)
            if (!point) {
                return res
                    .status(404)
                    .json({ message: 'Punto de interés no encontrado' })
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
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async createController(req, res) {
        try {
            const result = await PointOfInterest.create(req.body)
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
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async deleteController(req, res) {
        try {
            const point = await PointOfInterest.delete(req.params.id_point)
            if (!point) {
                return res
                    .status(404)
                    .json({ message: 'Punto de interés no encontrado' })
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
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async updateController(req, res) {
        try {
            const point = await PointOfInterest.update(
                req.params.id_point,
                req.body
            )
            if (!point) {
                return res
                    .status(404)
                    .json({ message: 'Punto de interés no encontrado' })
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
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }
}

export default PointOfInterestController
