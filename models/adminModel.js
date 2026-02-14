import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import redisClient from '../config/redis.js';

const SALT_ROUNDS = 10;

class Admin {
    static async findAll(page = 1, limit = 50) {
        const offset = (page - 1) * limit;

        const cacheKey = `admins:page:${page}:limit:${limit}`;

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const dataQuery = await pool.query(
            `SELECT *
         FROM "user"
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countQuery = await pool.query(
            `SELECT COUNT(*) 
         FROM "user"
         WHERE role_id = 1`
        );

        const totalRecords = Number(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        const response = {
            admins: dataQuery.rows,
            totalRecords,
            totalPages,
            currentPage: page,
        };

        // Cache completo (no solo rows)
        await redisClient.set(cacheKey, JSON.stringify(response), {
            EX: 60,
        });

        return response;
    }

    static async findById(user_id) {
        const result = await pool.query(
            `SELECT * FROM "user" 
         WHERE user_id = $1`,
            [user_id]
        );
        return result.rows[0] || null;
    }

    static async create(data) {
        const { name, email, password, role_id = 1 } = data;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO "user" (name, email, password, role_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [name, email, hashedPassword, role_id]
        );

        return result.rows[0];
    }

    static async update(user_id, data) {
        const { name, email } = data;

        const result = await pool.query(
            `UPDATE "user" 
             SET name = COALESCE($1, name), email = COALESCE($2, email)
             WHERE user_id = $3
             RETURNING *`,
            [name, email, user_id]
        );

        return result.rows[0] || null;
    }

    static async delete(user_id) {
        const result = await pool.query(
            `UPDATE "user" 
         SET is_active = FALSE
         WHERE user_id = $1
         RETURNING *`,
            [user_id]
        );
        return result.rows[0] || null;
    }

    static async toggleActive(user_id) {
        const result = await pool.query(
            `UPDATE "user" 
         SET is_active = NOT is_active
         WHERE user_id = $1 and role_id = 1
         RETURNING *`,
            [user_id]
        );
        return result.rows[0] || null;
    }
}

export default Admin;
