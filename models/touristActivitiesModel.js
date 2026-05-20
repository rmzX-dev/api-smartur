import pool from '../config/db.js';

class TouristActivities {
    static async findAllTouristActivities(page = 1, limit = 50, id_company = null) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        conditions.push(`is_active = TRUE`);

        if (id_company !== null) {
            conditions.push(`id_company = $${index}`);
            values.push(id_company);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM tourist_activities ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // Obtener datos paginados
        const dataQuery = await pool.query(
            `SELECT id_activity, id_company, production_value, environmental_impact, social_impact
             FROM tourist_activities
             ${whereClause}
             ORDER BY id_activity
             LIMIT $${index}
             OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            activities: dataQuery.rows,
        };
    }

    static async findTouristActivitiesById(id_activity) {
        const result = await pool.query(
            `SELECT id_activity, id_company, production_value, environmental_impact, social_impact
     FROM tourist_activities
     WHERE id_activity = $1 AND is_active = TRUE`,
            [id_activity]
        );
        return result.rows[0] || null;
    }

    static async createTouristActivities(data) {
        const { id_company, production_value, environmental_impact, social_impact } = data;

        const result = await pool.query(
            `INSERT INTO tourist_activities (id_company, production_value, environmental_impact, social_impact) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id_activity, id_company, production_value, environmental_impact, social_impact`,
            [id_company, production_value, environmental_impact, social_impact]
        );
        return result.rows[0];
    }

    static async updateTouristActivities(id_activity, data) {
        const { id_company, production_value, environmental_impact, social_impact } = data;

        const fields = [];
        const values = [];
        let index = 1;

        if (id_company !== undefined) {
            fields.push(`id_company = $${index++}`);
            values.push(id_company);
        }
        if (production_value !== undefined) {
            fields.push(`production_value = $${index++}`);
            values.push(production_value);
        }
        if (environmental_impact !== undefined) {
            fields.push(`environmental_impact = $${index++}`);
            values.push(environmental_impact);
        }
        if (social_impact !== undefined) {
            fields.push(`social_impact = $${index++}`);
            values.push(social_impact);
        }

        if (fields.length === 0) return null;

        const result = await pool.query(
            `UPDATE tourist_activities
            SET ${fields.join(', ')}
            WHERE id_activity = $${index} AND is_active = TRUE
            RETURNING id_activity, id_company, production_value, environmental_impact, social_impact`,
            [...values, id_activity]
        );
        return result.rows[0] || null;
    }

    static async deleteTouristActivities(id_activity) {
        const result = await pool.query(
            `UPDATE tourist_activities
            SET is_active = FALSE
            WHERE id_activity = $1 AND is_active = TRUE
            RETURNING id_activity, id_company, production_value, environmental_impact, social_impact`,
            [id_activity]
        );
        return result.rows[0] || null;
    }
}

export default TouristActivities;
