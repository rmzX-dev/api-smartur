import pool from '../config/db.js';

class TravelerProfile {
    static async findAllTravelerProfile(
        page = 1,
        limit = 50,
        search = '',
        gender = '',
        travel_type = ''
    ) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        if (search) {
            conditions.push(`user_id::TEXT ILIKE $${index}`);
            values.push(`%${search}%`);
            index++;
        }

        if (gender) {
            conditions.push(`gender ILIKE $${index}`);
            values.push(`%${gender}%`);
            index++;
        }

        if (travel_type) {
            conditions.push(`travel_type ILIKE $${index}`);
            values.push(`%${travel_type}%`);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM traveler_profile ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // Obtener datos paginados
        const dataQuery = await pool.query(
            `SELECT * FROM traveler_profile
             ${whereClause}
             ORDER BY id_profile
             LIMIT $${index}
             OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            profiles: dataQuery.rows,
        };
    }

    static async findTravelerProfileById(id_profile) {
        const result = await pool.query(`SELECT * FROM traveler_profile WHERE id_profile = $1`, [
            id_profile,
        ]);
        return result.rows[0] || null;
    }

    static async createTravelerProfile(data) {
        const {
            user_id,
            age,
            gender,
            travel_type,
            interests,
            restrictions,
            sustainable_preferences,
        } = data;

        const result = await pool.query(
            `INSERT INTO traveler_profile (user_id, age, gender, travel_type, interests, restrictions, sustainable_preferences) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id_profile, user_id, age, gender, travel_type, interests, restrictions, sustainable_preferences`,
            [user_id, age, gender, travel_type, interests, restrictions, sustainable_preferences]
        );
        return result.rows[0];
    }

    static async updateTravelerProfile(id_profile, data) {
        const { age, gender, travel_type, interests, restrictions, sustainable_preferences } = data;

        const fields = [];
        const values = [];
        let index = 1;

        if (age !== undefined) {
            fields.push(`age = $${index++}`);
            values.push(age);
        }
        if (gender !== undefined) {
            fields.push(`gender = $${index++}`);
            values.push(gender);
        }
        if (travel_type !== undefined) {
            fields.push(`travel_type = $${index++}`);
            values.push(travel_type);
        }
        if (interests !== undefined) {
            fields.push(`interests = $${index++}`);
            values.push(interests);
        }
        if (restrictions !== undefined) {
            fields.push(`restrictions = $${index++}`);
            values.push(restrictions);
        }
        if (sustainable_preferences !== undefined) {
            fields.push(`sustainable_preferences = $${index++}`);
            values.push(sustainable_preferences);
        }

        if (fields.length === 0) return null;

        const result = await pool.query(
            `UPDATE traveler_profile 
             SET ${fields.join(', ')} 
             WHERE id_profile = $${index} 
             RETURNING id_profile, user_id, age, gender, travel_type, interests, restrictions, sustainable_preferences`,
            [...values, id_profile]
        );
        return result.rows[0] || null;
    }

    static async deleteTravelerProfile(id_profile) {
        const result = await pool.query(
            `DELETE FROM traveler_profile 
         WHERE id_profile = $1 
         RETURNING id_profile, user_id, age, gender, travel_type, interests, restrictions, sustainable_preferences`,
            [id_profile]
        );
        return result.rows[0] || null;
    }
}

export default TravelerProfile;
