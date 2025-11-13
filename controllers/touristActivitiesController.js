import TouristActivitiesModel from '../models/touristActivitiesModel.js'

export class TouristActivitiesController {
    static async findAllTouristActivitiesController(req, res) {
        try {
            const touristActivities = await TouristActivitiesModel.findAllTouristActivities()
            res.json({
                message: 'Actividades turísticas obtenidas exitosamente',
                count: touristActivities.length,
                touristActivities: touristActivities.map((touristActivities) => ({
                    id: touristActivities.id_activity,
                    company: touristActivities.id_company,
                    production_value: touristActivities.production_value,
                    environmental_impact: touristActivities.environmental_impact,
                    social_impact: touristActivities.social_impact,
                })),
            })
        } catch (error) {
            console.error('Error fetching tourist activities:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async findTouristActivitiesByIdController(req, res) {
        try {
            const touristActivitiesData = await TouristActivitiesModel.findTouristActivitiesById(
                req.params.id_activity
            )
            if (!touristActivitiesData) {
                return res
                    .status(404)
                    .json({ message: 'Actividad turística no encontrada' })
            }
            res.status(200).json({
                message: 'Actividad turística obtenida exitosamente',
                touristActivities: {
                    id: touristActivitiesData.id_activity,
                    company: touristActivitiesData.id_company,
                    production_value: touristActivitiesData.production_value,
                    environmental_impact: touristActivitiesData.environmental_impact,
                    social_impact: touristActivitiesData.social_impact,
                },
            })
        } catch (error) {
            console.error('Error fetching tourist activity:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async createTouristActivitiesController(req, res) {
        try {
            const result = await TouristActivitiesModel.createTouristActivities(req.body)
            res.status(201).json({
                message: 'Actividad turística creada exitosamente',
                touristActivities: {
                    id: result.id_activity,
                    company: result.id_company,
                    production_value: result.production_value,
                    environmental_impact: result.environmental_impact,
                    social_impact: result.social_impact,
                },
            })
        } catch (error) {
            console.error('Error creating tourist activity:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async updateTouristActivitiesController(req, res) {
        try {
            const touristActivities = await TouristActivitiesModel.updateTouristActivities(
                req.params.id_activity,
                req.body
            )
            if (!touristActivities) {
                return res
                    .status(404)
                    .json({ message: 'Actividad turística no encontrada' })
            }
            res.json({
                message: 'Actividad turística actualizada exitosamente',
                touristActivities: {
                    id: touristActivities.id_activity,
                    company: touristActivities.id_company,
                    production_value: touristActivities.production_value,
                    environmental_impact: touristActivities.environmental_impact,
                    social_impact: touristActivities.social_impact,
                },
            })
        } catch (error) {
            console.error('Error updating tourist activity:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async deleteTouristActivitiesController(req, res) {
        try {
            const touristActivities = await TouristActivitiesModel.deleteTouristActivities(
                req.params.id_activity
            )

            if (!touristActivities) {
                return res
                    .status(404)
                    .json({ message: 'Actividad turística no encontrada' })
            }

            res.json({
                message: 'Actividad turística eliminada exitosamente',
                touristActivities: {
                    id: touristActivities.id_activity,
                    company: touristActivities.id_company,
                    production_value: touristActivities.production_value,
                    environmental_impact: touristActivities.environmental_impact,
                    social_impact: touristActivities.social_impact,
                },
            })
        } catch (error) {
            if (error.message === 'Actividad turística no encontrada') {
                return res.status(404).json({ message: error.message })
            }
            console.error('Error deleting tourist activity:', error)
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }
}   

export default TouristActivitiesController  