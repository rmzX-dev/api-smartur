import pool from '../config/db.js'

class TouristActivities {
    static async findAllTouristActivities() {
        const result = await pool.query(
            `SELECT id_activity, id_company, production_value, environmental_impact, social_impact
     FROM tourist_activities`
        )
        return result.rows
    }

    static async findTouristActivitiesById(id_activity) {
        const result = await pool.query(
            `SELECT id_activity, id_company, production_value, environmental_impact, social_impact
     FROM tourist_activities
     WHERE id_activity = $1`,
            [id_activity]
        )
        return result.rows[0]
    }

    static async createTouristActivities(data) {
        const { id_company, production_value, environmental_impact, social_impact } = data

        const result = await pool.query(
            `INSERT INTO tourist_activities (id_company, production_value, environmental_impact, social_impact) 
            VALUES ($1, $2, $3, $4) RETURNING id_activity, id_company, production_value, environmental_impact, social_impact`,
            [id_company, production_value, environmental_impact, social_impact]
        )
        return result.rows[0]
    }


    static async deleteTouristActivities(id_activity) {
        const result = await pool.query(
            `DELETE FROM tourist_activities
            WHERE id_activity = $1
            RETURNING id_activity, id_company, production_value, environmental_impact, social_impact`,
            [id_activity]
        )
        return result.rows[0]
    }
}

export default TouristActivities