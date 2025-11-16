import TouristServices from "../models/touristServicesModel.js";

class TouristServicesController {
    static async findAllServicesController(req, res) {
        try {
            const services = await TouristServices.findAllServices();
            res.json({
                message: "Servicios obtenidos exitosamente",
                count: services.length,
                services: services.map((service) => ({
                    id: service.id_service,
                    name: service.name,
                    description: service.description,
                    id_company: service.id_company,
                    id_location: service.id_location,
                    service_type: service.service_type,
                    active: service.active,
                })),
            });
        } catch (error) {
            res.status(500).json({
                message: "Error interno en el servidor",
                error: error.message,
            });
        }
    }

    static async findServicesByIdController(req, res) {
        try {
            const service = await TouristServices.findServicesById(
                req.params.id_service
            );
            if (!service) {
                return res
                    .status(404)
                    .json({ message: "Servicio no encontrado" });
            }
            res.status(200).json({
                message: "Servicio obtenido exitosamente",
                service: {
                    id: service.id_service,
                    name: service.name,
                    description: service.description,
                    id_company: service.id_company,
                    id_location: service.id_location,
                    service_type: service.service_type,
                    active: service.active,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: "Error interno en el servidor",
                error: error.message,
            });
        }
    }

    static async createServicesController(req, res) {
        try {
            const result = await TouristServices.createServices(req.body);
            res.status(201).json({
                message: "Servicio creado exitosamente",
                service: {
                    id: result.id_service,
                    name: result.name,
                    description: result.description,
                    id_company: result.id_company,
                    id_location: result.id_location,
                    service_type: result.service_type,
                    active: result.active,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: "Error interno en el servidor",
                error: error.message,
            });
        }
    }

    static async deleteServicesController(req, res) {
        try {
            const service = await TouristServices.deleteServices(
                req.params.id_service
            );
            if (!service) {
                return res
                    .status(404)
                    .json({ message: "Servicio no encontrado" });
            }
            res.status(200).json({
                message: "Servicio eliminado exitosamente",
                service: {
                    id: service.id_service,
                    name: service.name,
                    description: service.description,
                    id_company: service.id_company,
                    id_location: service.id_location,
                    service_type: service.service_type,
                    active: service.active,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: "Error interno en el servidor",
                error: error.message,
            });
        }
    }

    static async updateServicesController(req, res) {
        try {
            const service = await TouristServices.updateServices(
                req.params.id_service,
                req.body
            );
            if (!service) {
                return res
                    .status(404)
                    .json({ message: "Servicio no encontrado" });
            }
            res.status(200).json({
                message: "Servicio actualizado exitosamente",
                service: {
                    id: service.id_service,
                    name: service.name,
                    description: service.description,
                    id_company: service.id_company,
                    id_location: service.id_location,
                    service_type: service.service_type,
                    active: service.active,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: "Error interno en el servidor",
                error: error.message,
            });
        }
    }
}

export default TouristServicesController;   