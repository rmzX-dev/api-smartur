import Location from '../models/locationModel.js';

class LocationController {
    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);

            const search = req.query.search || '';
            const state = req.query.state || '';

            const result = await Location.findAll(page, limit, search, state);

            res.json({
                message: 'Ubicaciones obtenidas exitosamente',
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                locations: result.locations.map((loc) => ({
                    id: loc.id_location,
                    id_location: loc.id_location,
                    name: loc.name,
                    state: loc.state,
                    municipality: loc.municipality,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                })),
            });
        } catch (error) {
            console.error('Error fetching locations:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async getById(req, res) {
        try {
            const location = await Location.findById(req.params.id);

            if (!location) {
                return res.status(404).json({ message: 'Ubicación no encontrada' });
            }

            res.json({
                message: 'Ubicación obtenida exitosamente',
                location: {
                    id: location.id_location,
                    id_location: location.id_location,
                    name: location.name,
                    state: location.state,
                    municipality: location.municipality,
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
            });
        } catch (error) {
            console.error('Error fetching location:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async create(req, res) {
        try {
            const { name, state } = req.body;

            if (!name || !state) {
                return res.status(400).json({ message: 'Nombre y estado son requeridos' });
            }

            const location = await Location.create(req.body);

            res.status(201).json({
                message: 'Ubicación creada exitosamente',
                location: {
                    id: location.id_location,
                    name: location.name,
                    state: location.state,
                    municipality: location.municipality,
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
            });
        } catch (error) {
            console.error('Error creating location:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async update(req, res) {
        try {
            const location = await Location.update(req.params.id, req.body);

            if (!location) {
                return res.status(404).json({ message: 'Ubicación no encontrada' });
            }

            res.json({
                message: 'Ubicación actualizada exitosamente',
                location: {
                    id: location.id_location,
                    name: location.name,
                    state: location.state,
                    municipality: location.municipality,
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
            });
        } catch (error) {
            console.error('Error updating location:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async delete(req, res) {
        try {
            const location = await Location.delete(req.params.id);

            if (!location) {
                return res.status(404).json({ message: 'Ubicación no encontrada' });
            }

            res.json({
                message: 'Ubicación eliminada exitosamente',
                location: {
                    id: location.id_location,
                    name: location.name,
                },
            });
        } catch (error) {
            console.error('Error deleting location:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }
}

export default LocationController;
