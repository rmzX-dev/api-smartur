import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import redisClient from '../config/redis.js';

const SALT_ROUNDS = 10;

class User {
    static async findAll(page = 1, limit = 50, search = '', role = null) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        if (search) {
            conditions.push(`(name ILIKE $${index} OR email ILIKE $${index})`);
            values.push(`%${search}%`);
            index++;
        }

        if (role) {
            conditions.push(`role_id = $${index}`);
            values.push(role);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // 1️⃣ Contar total con filtros
        const countQuery = await pool.query(`SELECT COUNT(*) FROM "user" ${whereClause}`, values);

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // 2️⃣ Obtener datos paginados
        const dataQuery = await pool.query(
            `
        SELECT *
        FROM "user"
        ${whereClause}
        ORDER BY user_id
        LIMIT $${index}
        OFFSET $${index + 1}
        `,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            users: dataQuery.rows,
        };
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
        const { name, email, password, role_id } = data;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO "user" (name, email, password, role_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [name, email, hashedPassword, role_id]
        );

        return result.rows[0];
    }

    static async delete(user_id) {
        const result = await pool.query(
            `UPDATE "user" 
         SET is_active = FALSE
         WHERE user_id = $1 AND is_active = TRUE
         RETURNING *`,
            [user_id]
        );
        return result.rows[0] || null;
    }

    static async patch(user_id, data) {
        const { name, password, role_id, is_active } = data;

        const fields = [];
        const values = [];
        let index = 1;

        if (name !== undefined) {
            fields.push(`name = $${index++}`);
            values.push(name);
        }

        if (password !== undefined) {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            fields.push(`password = $${index++}`);
            values.push(hashedPassword);
        }

        if (role_id !== undefined) {
            fields.push(`role_id = $${index++}`);
            values.push(role_id);
        }

        if (is_active !== undefined) {
            fields.push(`is_active = $${index++}`);
            values.push(is_active);
        }

        if (fields.length === 0) {
            return null;
        }

        const result = await pool.query(
            `UPDATE "user"
         SET ${fields.join(', ')}
         WHERE user_id = $${index}
         RETURNING *`,
            [...values, user_id]
        );

        return result.rows[0] || null;
    }
}

export default User;
