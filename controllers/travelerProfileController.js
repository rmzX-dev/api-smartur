import TravelerProfile from '../models/travelerProfileModel.js'

export class TravelerProfileController {
    static async findAllTravelerProfileController(req, res) {
        try {
            const travelerProfiles =
                await TravelerProfile.findAllTravelerProfile()
            res.json({
                message: 'Traveler Profiles obtenidas exitosamente',
                count: travelerProfiles.length,
                travelerProfiles: travelerProfiles.map((travelerProfile) => ({
                    id: travelerProfile.id_profile,
                    user_id: travelerProfile.user_id,
                    age: travelerProfile.age,
                    gender: travelerProfile.gender,
                    travel_type: travelerProfile.travel_type,
                    interests: travelerProfile.interests,
                    restrictions: travelerProfile.restrictions,
                    sustainable_preferences:
                        travelerProfile.sustainable_preferences,
                })),
            })
        } catch (error) {
            console.error('Error fetching traveler profiles:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async findTravelerProfileByIdController(req, res) {
        try {
            const travelerProfile =
                await TravelerProfile.findTravelerProfileById(
                    req.params.id_traveler
                )
            if (!travelerProfile) {
                return res
                    .status(404)
                    .json({ message: 'Traveler Profile no encontrado' })
            }
            res.status(200).json({
                message: 'Traveler Profile obtenido exitosamente',
                travelerProfile: {
                    id: travelerProfile.id_profile,
                    user_id: travelerProfile.user_id,
                    age: travelerProfile.age,
                    gender: travelerProfile.gender,
                    travel_type: travelerProfile.travel_type,
                    interests: travelerProfile.interests,
                    restrictions: travelerProfile.restrictions,
                    sustainable_preferences:
                        travelerProfile.sustainable_preferences,
                },
            })
        } catch (error) {
            console.error('Error fetching traveler profile:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async createTravelerProfileController(req, res) {
        try {
            const result = await TravelerProfile.createTravelerProfile(req.body)
            res.status(201).json({
                message: 'Traveler Profile creado exitosamente',
                travelerProfile: {
                    id: result.id_traveler,
                    user_id: result.id_user,
                    age: result.age,
                    gender: result.gender,
                    travel_type: result.travel_type,
                    interests: result.interests,
                    restrictions: result.restrictions,
                    sustainable_preferences: result.sustainable_preferences,
                },
            })
        } catch (error) {
            console.error('Error creating traveler profile:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async updateTravelerProfileController(req, res) {
        try {
            const travelerProfile = await TravelerProfile.updateTravelerProfile(
                req.params.id_traveler,
                req.body
            )
            if (!travelerProfile) {
                return res
                    .status(404)
                    .json({ message: 'Traveler Profile no encontrado' })
            }
            res.json({
                message: 'Traveler Profile actualizado exitosamente',
                travelerProfile: {
                    id: travelerProfile.id_profile,
                    user_id: travelerProfile.user_id,
                    age: travelerProfile.age,
                    gender: travelerProfile.gender,
                    travel_type: travelerProfile.travel_type,
                    interests: travelerProfile.interests,
                    restrictions: travelerProfile.restrictions,
                    sustainable_preferences:
                        travelerProfile.sustainable_preferences,
                },
            })
        } catch (error) {
            console.error('Error updating traveler profile:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async deleteTravelerProfileController(req, res) {
        try {
            const travelerProfile = await TravelerProfile.deleteTravelerProfile(
                req.params.id_profile
            )
            if (!travelerProfile) {
                return res
                    .status(404)
                    .json({ message: 'Traveler Profile no encontrado' })
            }
        
            res.json({
                message: 'Traveler Profile eliminado exitosamente',
                travelerProfile: {
                    id: travelerProfile.id_profile,
                    user_id: travelerProfile.user_id,
                    age: travelerProfile.age,
                    gender: travelerProfile.gender,
                    travel_type: travelerProfile.travel_type,
                    interests: travelerProfile.interests,
                    restrictions: travelerProfile.restrictions,
                    sustainable_preferences:
                        travelerProfile.sustainable_preferences,
                },
            })
        } catch (error) {
            console.error('Error deleting traveler profile:', error)
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }
}

export default TravelerProfileController
