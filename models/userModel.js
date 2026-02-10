import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import redisClient from '../config/redis.js';

const SALT_ROUNDS = 10;

class User {
    static async findAll(page = 1, limit = 100) {
        const offset = (page - 1) * limit;

        const cacheKey = `users:page:${page}:limit:${limit}`;

        const cachedUsers = await redisClient.get(cacheKey);
        if (cachedUsers) {
            return JSON.parse(cachedUsers);
        }

        const result = await pool.query(
            `SELECT * FROM "user"
       WHERE role_id = 2
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        await redisClient.set(cacheKey, JSON.stringify(result.rows), {
            EX: 30,
        });

        return result.rows;
    }

    static async findById(user_id) {
        const result = await pool.query(
            `SELECT * FROM "user" 
         WHERE user_id = $1 and role_id = 2`,
            [user_id]
        );
        return result.rows[0] || null;
    }

    static async create(data) {
        const { name, email, password, role_id = 2 } = data;
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
             WHERE user_id = $3 and role_id = 2
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
         WHERE user_id = $1
         RETURNING *`,
            [user_id]
        );
        return result.rows[0] || null;
    }
}

export default User;
