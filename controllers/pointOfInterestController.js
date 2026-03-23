import PointOfInterest from '../models/pointOfInterestModel.js';
import cloudinary from '../config/cloudinary.js';

function uploadImageToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'smartur/points-of-interest',
                resource_type: 'image',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(buffer);
    });
}

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
                    id_point: point.id_point,
                    name: point.name,
                    description: point.description,
                    typeId: point.id_type,
                    id_type: point.id_type,
                    locationId: point.id_location,
                    id_location: point.id_location,
                    sustainability: point.sustainability,
                    image_url: point.image_url || null,
                    rating: point.rating != null ? parseFloat(point.rating) : 4.0,
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
                    id_point: point.id_point,
                    name: point.name,
                    description: point.description,
                    typeId: point.id_type,
                    id_type: point.id_type,
                    locationId: point.id_location,
                    id_location: point.id_location,
                    sustainability: point.sustainability,
                    image_url: point.image_url || null,
                    rating: point.rating != null ? parseFloat(point.rating) : 4.0,
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
            const payload = { ...req.body };

            if (req.file?.buffer) {
                const uploaded = await uploadImageToCloudinary(req.file.buffer);
                payload.image_url = uploaded.secure_url;
            }

            const result = await PointOfInterest.create(payload);
            res.status(201).json({
                message: 'Punto de interés creado exitosamente',
                point: {
                    id: result.id_point,
                    id_point: result.id_point,
                    name: result.name,
                    description: result.description,
                    typeId: result.id_type,
                    id_type: result.id_type,
                    locationId: result.id_location,
                    id_location: result.id_location,
                    sustainability: result.sustainability,
                    image_url: result.image_url || null,
                    rating: result.rating != null ? parseFloat(result.rating) : 4.0,
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
                    id_point: point.id_point,
                    name: point.name,
                    description: point.description,
                    typeId: point.id_type,
                    id_type: point.id_type,
                    locationId: point.id_location,
                    id_location: point.id_location,
                    sustainability: point.sustainability,
                    image_url: point.image_url || null,
                    rating: point.rating != null ? parseFloat(point.rating) : 4.0,
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
            const payload = { ...req.body };

            if (req.file?.buffer) {
                const uploaded = await uploadImageToCloudinary(req.file.buffer);
                payload.image_url = uploaded.secure_url;
            }

            const point = await PointOfInterest.update(req.params.id_point, payload);
            if (!point) {
                return res.status(404).json({ message: 'Punto de interés no encontrado' });
            }
            res.status(200).json({
                message: 'Punto de interés actualizado exitosamente',
                point: {
                    id: point.id_point,
                    id_point: point.id_point,
                    name: point.name,
                    description: point.description,
                    typeId: point.id_type,
                    id_type: point.id_type,
                    locationId: point.id_location,
                    id_location: point.id_location,
                    sustainability: point.sustainability,
                    image_url: point.image_url || null,
                    rating: point.rating != null ? parseFloat(point.rating) : 4.0,
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
