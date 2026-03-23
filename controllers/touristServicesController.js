import TouristServices from '../models/touristServicesModel.js';
import cloudinary from '../config/cloudinary.js';

function uploadImageToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'smartur/tourist-services',
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

class TouristServicesController {
    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);

            const search = req.query.search || '';
            const company = req.query.company ? parseInt(req.query.company) : null;
            const type = req.query.type || null;
            const active = req.query.active !== undefined ? req.query.active === 'true' : null;
            const id_location = req.query.id_location ? parseInt(req.query.id_location) : null;

            const result = await TouristServices.findAll(
                page,
                limit,
                search,
                company,
                type,
                active,
                id_location
            );

            res.json({
                message: 'Servicios obtenidos exitosamente',
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                services: result.services.map((service) => ({
                    id: service.id_service,
                    id_service: service.id_service,
                    name: service.name,
                    description: service.description,
                    id_company: service.id_company,
                    id_location: service.id_location,
                    service_type: service.service_type,
                    active: service.active,
                    id_evaluation: service.id_evaluation,
                    total_score: service.total_score,
                    image_url: service.image_url || null,
                    created_at: service.created_at,
                })),
            });
        } catch (error) {
            console.error('Error fetching services:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async getById(req, res) {
        try {
            const service = await TouristServices.findById(req.params.id);

            if (!service) {
                return res.status(404).json({ message: 'Servicio no encontrado' });
            }

            res.json({
                message: 'Servicio obtenido exitosamente',
                service: {
                    id: service.id_service,
                    id_service: service.id_service,
                    name: service.name,
                    description: service.description,
                    id_company: service.id_company,
                    id_location: service.id_location,
                    service_type: service.service_type,
                    active: service.active,
                    id_evaluation: service.id_evaluation,
                    total_score: service.total_score,
                    image_url: service.image_url || null,
                    created_at: service.created_at,
                },
            });
        } catch (error) {
            console.error('Error fetching service:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async create(req, res) {
        try {
            const { name, id_company, id_location, service_type } = req.body;

            if (!name || !id_company || !id_location || !service_type) {
                return res.status(400).json({
                    message: 'Nombre, empresa, ubicación y tipo de servicio son requeridos',
                });
            }

            const payload = { ...req.body };

            if (req.file?.buffer) {
                const uploaded = await uploadImageToCloudinary(req.file.buffer);
                payload.image_url = uploaded.secure_url;
            }

            const service = await TouristServices.create(payload);

            res.status(201).json({
                message: 'Servicio creado exitosamente',
                service: {
                    id: service.id_service,
                    id_service: service.id_service,
                    name: service.name,
                    description: service.description,
                    id_company: service.id_company,
                    id_location: service.id_location,
                    service_type: service.service_type,
                    active: service.active,
                    image_url: service.image_url || null,
                    created_at: service.created_at,
                },
            });
        } catch (error) {
            console.error('Error creating service:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async update(req, res) {
        try {
            const payload = { ...req.body };

            if (req.file?.buffer) {
                const uploaded = await uploadImageToCloudinary(req.file.buffer);
                payload.image_url = uploaded.secure_url;
            }

            const service = await TouristServices.update(req.params.id, payload);

            if (!service) {
                return res.status(404).json({ message: 'Servicio no encontrado' });
            }

            res.json({
                message: 'Servicio actualizado exitosamente',
                service: {
                    id: service.id_service,
                    id_service: service.id_service,
                    name: service.name,
                    description: service.description,
                    id_company: service.id_company,
                    id_location: service.id_location,
                    service_type: service.service_type,
                    active: service.active,
                    image_url: service.image_url || null,
                    created_at: service.created_at,
                },
            });
        } catch (error) {
            console.error('Error updating service:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async delete(req, res) {
        try {
            const service = await TouristServices.delete(req.params.id);

            if (!service) {
                return res.status(404).json({ message: 'Servicio no encontrado' });
            }

            res.json({
                message: 'Servicio eliminado exitosamente',
                service: {
                    id: service.id_service,
                    name: service.name,
                },
            });
        } catch (error) {
            console.error('Error deleting service:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }
}

export default TouristServicesController;
