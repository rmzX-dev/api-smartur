import Location from '../models/locationModel.js'

class locationController {
    static async findAllLocationController(req, res) {
        try {
            const locations = await Location.getLocation()
            res.json({
                message: 'Locations successfully obtained',
                count: locations.length,
                locations: locations.map((locations) => ({
                    id: locations.id_location,
                    name: locations.name,
                    state: locations.state,
                    municipality: locations.municipality,
                    latitude: locations.latitude,
                    longitude: locations.longitude,
                })),
            })
        } catch (error) {
            console.error('Error fetching locations:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async findLocationById(req, res) {
        try {
            const locationData = await Location.getLocationById(
                req.params.id_location
            )

            if (!locationData) {
                return res
                    .status(404)
                    .json({ message: 'Ubicación no encontrada' })
            }

            res.status(200).json({
                message: 'Ubicación obtenida exitosamente',
                location: {
                    id: locationData.id_location,
                    name: locationData.name,
                    state: locationData.state,
                    municipality: locationData.municipality,
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                },
            })
        } catch (error) {
            console.error('Error fetching location:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async createLocationController(req, res) {
        try {
            const { name, state, municipality, latitude, longitude } = req.body

            if (!name) {
                return res.status(400).json({
                    message: 'El nombre es requerido',
                })
            }

            const location = await Location.createLocation({
                name,
                state,
                municipality,
                latitude,
                longitude,
            })

            res.status(201).json({
                message: 'Ubicacion registrada exitosamente',
                location: {
                    id: location.id_location,
                    name: location.name,
                    state: location.state,
                    municipality: location.municipality,
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
            })
        } catch (error) {
            console.error('Error creating location:', error)
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async deleteLocationController(req, res) {
        try {
            const location = await Location.getLocationById(
                req.params.id_location
            )

            if (!location) {
                return res
                    .status(404)
                    .json({ message: 'Ubicacion no encontrada' })
            }

            await Location.deleteLocation(req.params.id_location)

            res.json({
                message: 'Ubicacion eliminada exitosamente',
                location: {
                    id: location.id_location,
                    name: location.name,
                    state: location.state,
                    municipality: location.municipality,
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
            })
        } catch (error) {
            if (error.message === 'Ubicacion no encontrada') {
                return res.status(404).json({ message: error.message })
            }
            console.error('Error deleting location:', error)
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }
}

export default locationController
