import pool from '../config/db.js';
import TravelerProfile from '../models/travelerProfileModel.js';
import User from '../models/userModel.js';
import { normalizeBirthDateInput, formatBirthDateForApi } from '../utils/birthDate.js';

const serializeTravelerProfile = (travelerProfile) => ({
    id: travelerProfile.id_profile,
    user_id: travelerProfile.user_id,
    user: travelerProfile.user_name
        ? {
            id: travelerProfile.user_id,
            name: travelerProfile.user_name,
            email: travelerProfile.user_email,
            photo_url: travelerProfile.user_photo_url ?? null,
            avatar_icon_key: travelerProfile.user_avatar_icon_key ?? null,
        }
        : null,
    birthDate: formatBirthDateForApi(travelerProfile.user_birth_date),
    age: travelerProfile.age ?? null,
    age_range: travelerProfile.age_range ?? null,
    gender: travelerProfile.gender ?? null,
    interests: travelerProfile.interests || [],
    activity_level: travelerProfile.activity_level ?? null,
    preferred_place: travelerProfile.preferred_place ?? null,
    travel_type: travelerProfile.travel_type ?? null,
    has_accessibility: travelerProfile.has_accessibility ?? false,
    accessibility_detail: travelerProfile.accessibility_detail ?? null,
    has_visited_before: travelerProfile.has_visited_before ?? false,
    restrictions: travelerProfile.restrictions ?? null,
    sustainable_preferences: travelerProfile.sustainable_preferences ?? false,
});

export class TravelerProfileController {
    static async findAllTravelerProfileController(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);
            const search = req.query.search || '';
            const gender = req.query.gender || '';
            const travel_type = req.query.travel_type || '';

            const result = await TravelerProfile.findAllTravelerProfile(
                page,
                limit,
                search,
                gender,
                travel_type
            );

            res.json({
                message: 'Traveler Profiles obtenidas exitosamente',
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                travelerProfiles: result.profiles.map(serializeTravelerProfile),
            });
        } catch (error) {
            console.error('Error fetching traveler profiles:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async findTravelerProfileByIdController(req, res) {
        try {
            const travelerProfile = await TravelerProfile.findTravelerProfileById(
                req.params.id_profile
            );
            if (!travelerProfile) {
                return res.status(404).json({ message: 'Traveler Profile no encontrado' });
            }
            res.status(200).json({
                message: 'Traveler Profile obtenido exitosamente',
                travelerProfile: serializeTravelerProfile(travelerProfile),
            });
        } catch (error) {
            console.error('Error fetching traveler profile:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async createTravelerProfileController(req, res) {
        try {
            const result = await TravelerProfile.createTravelerProfile(req.body);
            const travelerProfile = await TravelerProfile.findTravelerProfileById(result.id_profile);
            res.status(201).json({
                message: 'Traveler Profile creado exitosamente',
                travelerProfile: serializeTravelerProfile(travelerProfile || result),
            });
        } catch (error) {
            console.error('Error creating traveler profile:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async updateTravelerProfileController(req, res) {
        try {
            const updatedProfile = await TravelerProfile.updateTravelerProfile(
                req.params.id_profile,
                req.body
            );
            if (!updatedProfile) {
                return res.status(404).json({ message: 'Traveler Profile no encontrado' });
            }
            const travelerProfile = await TravelerProfile.findTravelerProfileById(req.params.id_profile);
            res.json({
                message: 'Traveler Profile actualizado exitosamente',
                travelerProfile: serializeTravelerProfile(travelerProfile || updatedProfile),
            });
        } catch (error) {
            console.error('Error updating traveler profile:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async deleteTravelerProfileController(req, res) {
        try {
            const travelerProfile = await TravelerProfile.deleteTravelerProfile(
                req.params.id_profile
            );
            if (!travelerProfile) {
                return res.status(404).json({ message: 'Traveler Profile no encontrado' });
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
                    sustainable_preferences: travelerProfile.sustainable_preferences,
                },
            });
        } catch (error) {
            console.error('Error deleting traveler profile:', error);
            res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    static async savePreferences(req, res) {
        const userId = req.user.id;
        const profileBody = { ...req.body };
        delete profileBody.birth_date;

        let birthDateToSet;
        const hasBirthKey = Object.prototype.hasOwnProperty.call(req.body, 'birth_date');
        if (hasBirthKey) {
            const check = normalizeBirthDateInput(req.body.birth_date);
            if (!check.ok) {
                return res.status(400).json({ message: check.error });
            }
            birthDateToSet = check.value;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const data = await TravelerProfile.savePreferences(userId, profileBody, client);

            if (hasBirthKey) {
                const u = await User.patch(String(userId), { birth_date: birthDateToSet }, client);
                if (!u) {
                    await client.query('ROLLBACK');
                    return res.status(404).json({ message: 'Usuario no encontrado' });
                }
            }

            await client.query('COMMIT');
            res.status(200).json({
                message: 'Preferencias de SMARTUR actualizadas',
                data: data,
            });
        } catch (error) {
            await client.query('ROLLBACK').catch(() => {});
            console.error('Error en savePreferences:', error);
            res.status(500).json({
                message: 'Error al guardar el perfil del viajero',
                error: error.message,
            });
        } finally {
            client.release();
        }
    }

    /** Perfil del viajero del usuario autenticado (app móvil). */
    static async getMyProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
            const birthDate = formatBirthDateForApi(user?.birth_date);
            const profile = await TravelerProfile.findByUserId(userId);
            if (!profile) {
                return res.status(200).json({
                    message: 'Sin perfil de viajero aún',
                    travelerProfile: null,
                    birthDate,
                });
            }
            res.json({
                message: 'Perfil del viajero',
                birthDate,
                travelerProfile: {
                    id: profile.id_profile,
                    user_id: profile.user_id,
                    age: profile.age,
                    age_range: profile.age_range,
                    gender: profile.gender,
                    interests: profile.interests || [],
                    activity_level: profile.activity_level,
                    preferred_place: profile.preferred_place,
                    travel_type: profile.travel_type,
                    has_accessibility: profile.has_accessibility,
                    accessibility_detail: profile.accessibility_detail,
                    has_visited_before: profile.has_visited_before,
                    restrictions: profile.restrictions,
                    sustainable_preferences: profile.sustainable_preferences,
                },
            });
        } catch (error) {
            console.error('Error en getMyProfile:', error);
            res.status(500).json({
                message: 'Error al obtener el perfil',
                error: error.message,
            });
        }
    }
}

export default TravelerProfileController;
