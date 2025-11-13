import pool from '../config/db.js'

/**
 * CREATE TABLE traveler_profile (
  id_profile SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  age INT,
  gender VARCHAR(20),
  travel_type VARCHAR(50),
  interests TEXT,
  restrictions TEXT,
  sustainable_preferences BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);
 */
class TravelerProfile {
    static async findAllTravelerProfile() {
        const result = await pool.query(`SELECT * FROM traveler_profile`)
        return result.rows
    }

    static async findTravelerProfileById(id_profile) {
        const result = await pool.query(
            `SELECT * FROM traveler_profile WHERE id_profile = $1`,
            [id_profile]
        )
        return result.rows[0] || null
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
        } = data

        const result = await pool.query(
            `INSERT INTO traveler_profile (user_id, age, gender, travel_type, interests, restrictions, sustainable_preferences) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_profile, user_id, age, gender, travel_type, interests, restrictions, sustainable_preferences`,
            [
                user_id,
                age,
                gender,
                travel_type,
                interests,
                restrictions,
                sustainable_preferences,
            ]
        )
        return result.rows[0]
    }

    static async updateTravelerProfile(id_profile, data) {
        const {
            age,
            gender,
            travel_type,
            interests,
            restrictions,
            sustainable_preferences,
        } = data

        const result = await pool.query(
            `UPDATE traveler_profile SET age = $1, gender = $2, travel_type = $3, interests = $4, restrictions = $5, sustainable_preferences = $6 WHERE id_profile = $7 RETURNING id_profile, user_id, age, gender, travel_type, interests, restrictions, sustainable_preferences`,
            [
                age,
                gender,
                travel_type,
                interests,
                restrictions,
                sustainable_preferences,
                id_profile,
            ]
        )
        return result.rows[0]
    }

    static async deleteTravelerProfile(id_profile) {
        const result = await pool.query(
            `DELETE FROM traveler_profile 
         WHERE id_profile = $1 
         RETURNING id_profile, user_id, age, gender, travel_type, interests, restrictions, sustainable_preferences`,
            [id_profile]
        )
        return result.rows[0]
    }
}

export default TravelerProfile
