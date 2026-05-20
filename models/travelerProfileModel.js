import pool from "../config/db.js";

class TravelerProfile {
  static async findAllTravelerProfile(
    page = 1,
    limit = 50,
    search = "",
    gender = "",
    travel_type = "",
  ) {
    const offset = (page - 1) * limit;

    const values = [];
    const conditions = [];
    let index = 1;

    conditions.push(`tp.is_active = TRUE`);
    conditions.push(`u.is_active = TRUE`);

    if (search) {
      conditions.push(`(tp.user_id::TEXT ILIKE $${index} OR u.name ILIKE $${index} OR u.email ILIKE $${index})`);
      values.push(`%${search}%`);
      index++;
    }

    if (gender) {
      conditions.push(`tp.gender ILIKE $${index}`);
      values.push(`%${gender}%`);
      index++;
    }

    if (travel_type) {
      conditions.push(`tp.travel_type ILIKE $${index}`);
      values.push(`%${travel_type}%`);
      index++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Contar total con filtros
    const countQuery = await pool.query(
      `SELECT COUNT(*)
         FROM traveler_profile tp
         JOIN "user" u ON u.user_id = tp.user_id
         ${whereClause}`,
      values,
    );

    const totalRecords = parseInt(countQuery.rows[0].count);
    const totalPages = Math.ceil(totalRecords / limit);

    // Obtener datos paginados
    const dataQuery = await pool.query(
      `SELECT
              tp.*,
              u.name AS user_name,
              u.email AS user_email,
              u.photo_url AS user_photo_url,
              u.avatar_icon_key AS user_avatar_icon_key,
              u.birth_date AS user_birth_date
         FROM traveler_profile tp
         JOIN "user" u ON u.user_id = tp.user_id
             ${whereClause}
             ORDER BY tp.id_profile
             LIMIT $${index}
             OFFSET $${index + 1}`,
      [...values, limit, offset],
    );

    return {
      totalRecords,
      totalPages,
      currentPage: page,
      profiles: dataQuery.rows,
    };
  }

  static async findTravelerProfileById(id_profile) {
    const result = await pool.query(
      `SELECT
          tp.*,
          u.name AS user_name,
          u.email AS user_email,
          u.photo_url AS user_photo_url,
          u.avatar_icon_key AS user_avatar_icon_key,
          u.birth_date AS user_birth_date
       FROM traveler_profile tp
       JOIN "user" u ON u.user_id = tp.user_id
       WHERE tp.id_profile = $1
         AND tp.is_active = TRUE`,
      [id_profile],
    );
    return result.rows[0] || null;
  }

  static async findByUserId(user_id) {
    const result = await pool.query(
      `SELECT * FROM traveler_profile WHERE user_id = $1 AND is_active = TRUE`,
      [user_id],
    );
    return result.rows[0] || null;
  }

  static async savePreferences(userId, data, executor = pool) {
    const {
      age,
      age_range,
      gender,
      interests,
      activity_level,
      preferred_place,
      travel_type,
      has_accessibility,
      accessibility_detail,
      has_visited_before,
      restrictions,
      sustainable_preferences,
    } = data;

    const query = `
            INSERT INTO traveler_profile 
                (user_id, age, age_range, gender, interests, activity_level, 
                preferred_place, travel_type, has_accessibility, 
                accessibility_detail, has_visited_before, restrictions,
                sustainable_preferences)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                is_active = TRUE,
                age = EXCLUDED.age,
                age_range = EXCLUDED.age_range,
                gender = EXCLUDED.gender,
                interests = EXCLUDED.interests,
                activity_level = EXCLUDED.activity_level,
                preferred_place = EXCLUDED.preferred_place,
                travel_type = EXCLUDED.travel_type,
                has_accessibility = EXCLUDED.has_accessibility,
                accessibility_detail = EXCLUDED.accessibility_detail,
                has_visited_before = EXCLUDED.has_visited_before,
                restrictions = EXCLUDED.restrictions,
                sustainable_preferences = EXCLUDED.sustainable_preferences
            RETURNING *;
        `;

    const values = [
      userId,
      age,
      age_range,
      gender,
      interests,
      activity_level,
      preferred_place,
      travel_type,
      has_accessibility,
      accessibility_detail,
      has_visited_before,
      restrictions,
      sustainable_preferences,
    ];

    const result = await executor.query(query, values);
    return result.rows[0];
  }

  static async createTravelerProfile(data) {
    const {
      user_id,
      age,
      age_range,
      gender,
      travel_type,
      interests,
      activity_level,
      preferred_place,
      has_accessibility,
      accessibility_detail,
      has_visited_before,
      restrictions,
      sustainable_preferences,
    } = data;

    const result = await pool.query(
      `INSERT INTO traveler_profile 
                (user_id, age, age_range, gender, travel_type, interests, 
                activity_level, preferred_place, has_accessibility, 
                accessibility_detail, has_visited_before, restrictions, 
                sustainable_preferences) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
             RETURNING *`,
      [
        user_id,
        age,
        age_range,
        gender,
        travel_type,
        interests,
        activity_level,
        preferred_place,
        has_accessibility,
        accessibility_detail,
        has_visited_before,
        restrictions,
        sustainable_preferences,
      ],
    );
    return result.rows[0];
  }

  static async updateTravelerProfile(id_profile, data) {
    const allowedFields = [
      "age",
      "age_range",
      "gender",
      "travel_type",
      "interests",
      "activity_level",
      "preferred_place",
      "has_accessibility",
      "accessibility_detail",
      "has_visited_before",
      "restrictions",
      "sustainable_preferences",
    ];

    const fields = [];
    const values = [];
    let index = 1;

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${index++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) return null;

    const result = await pool.query(
      `UPDATE traveler_profile 
             SET ${fields.join(", ")} 
             WHERE id_profile = $${index} AND is_active = TRUE
             RETURNING *`,
      [...values, id_profile],
    );
    return result.rows[0] || null;
  }

  static async deleteTravelerProfile(id_profile) {
    const result = await pool.query(
      `UPDATE traveler_profile
             SET is_active = FALSE
             WHERE id_profile = $1 AND is_active = TRUE
             RETURNING *`,
      [id_profile],
    );
    return result.rows[0] || null;
  }
}

export default TravelerProfile;
