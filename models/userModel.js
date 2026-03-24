import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import { normalizeEmail } from '../validators/userValidators.js';

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

        // 1️ Contar total con filtros
        const countQuery = await pool.query(`SELECT COUNT(*) FROM "user" ${whereClause}`, values);

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // 2️ Obtener datos paginados
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

    static async findByEmail(email) {
        try {
            const normalizedEmail = normalizeEmail(email);
            const result = await pool.query('SELECT * FROM "user" WHERE LOWER(email) = LOWER($1)', [
                normalizedEmail,
            ]);
            return result.rows[0];
        } catch (error) {
            throw new Error('Error al buscar usuario');
        }
    }

    static async create(data) {
        const { name, email, password, role_id, photo_url = null, avatar_icon_key = null } = data;
        const normalizedEmail = normalizeEmail(email);
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO "user" (name, email, password, role_id, photo_url, avatar_icon_key) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [name, normalizedEmail, hashedPassword, role_id, photo_url, avatar_icon_key]
        );

        return result.rows[0];
    }

    static async deactivateAndReset(user_id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Desactivar usuario y resetear avatar/fotos
            const userResult = await client.query(
                `UPDATE "user" 
                 SET is_active = FALSE, 
                     photo_url = NULL, 
                     avatar_icon_key = NULL 
                 WHERE user_id = $1 
                 RETURNING *`,
                [user_id]
            );

            if (userResult.rowCount === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            // 2. Borrar contenido generado para "empezar de cero" si vuelve
            await client.query('DELETE FROM community_post WHERE user_id = $1', [user_id]);
            await client.query('DELETE FROM user_favorite WHERE user_id = $1', [user_id]);
            await client.query('DELETE FROM user_visit WHERE user_id = $1', [user_id]);
            await client.query('DELETE FROM traveler_profile WHERE user_id = $1', [user_id]);

            await client.query('COMMIT');
            return userResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async delete(user_id) {
        // Ahora borrar una cuenta (admin o usuario) implica un reset completo
        return await this.deactivateAndReset(user_id);
    }

    static async patch(user_id, data, executor = pool) {
        const fields = [];
        const values = [];
        let index = 1;

        if (data.name !== undefined) {
            fields.push(`name = $${index++}`);
            values.push(data.name);
        }

        if (data.password !== undefined) {
            const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
            fields.push(`password = $${index++}`);
            values.push(hashedPassword);
        }

        if (data.role_id !== undefined) {
            fields.push(`role_id = $${index++}`);
            values.push(data.role_id);
        }

        if (data.is_active !== undefined) {
            fields.push(`is_active = $${index++}`);
            values.push(data.is_active);
        }

        if (Object.prototype.hasOwnProperty.call(data, 'photo_url')) {
            fields.push(`photo_url = $${index++}`);
            values.push(data.photo_url);
        }

        if (Object.prototype.hasOwnProperty.call(data, 'avatar_icon_key')) {
            fields.push(`avatar_icon_key = $${index++}`);
            values.push(data.avatar_icon_key);
        }

        if (Object.prototype.hasOwnProperty.call(data, 'birth_date')) {
            fields.push(`birth_date = $${index++}`);
            values.push(data.birth_date);
        }

        if (fields.length === 0) {
            return null;
        }

        const result = await executor.query(
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
