import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

class User {
    static async findAllUser(page = 1, limit = 10, search = '', order = 'desc') {
        const offset = (page - 1) * limit;

        // Construir la condición de búsqueda
        let searchCondition = '';
        let queryParams = [limit, offset];

        if (search && search.trim()) {
            searchCondition = `AND (LOWER(u.name) LIKE $3 OR LOWER(u.email) LIKE $3)`;
            queryParams = [limit, offset, `%${search.trim().toLowerCase()}%`];
        }

        // Validar orden
        const orderDirection = order === 'asc' ? 'ASC' : 'DESC';

        const result = await pool.query(
            `SELECT u.user_id, 
            u.name, 
            u.email,
            u.role_id,
            r.name as role_name,
            u.is_active, 
            u.created_at, 
            u.updated_at, 
            u.deleted_at
     FROM "user" u
     INNER JOIN role r ON u.role_id = r.role_id
     WHERE u.role_id = 2 
       AND u.deleted_at IS NULL
       ${searchCondition}
     ORDER BY u.created_at ${orderDirection}
     LIMIT $1 OFFSET $2`,
            queryParams
        );

        // También aplicar búsqueda al conteo
        let countParams = [];
        let countSearchCondition = '';

        if (search && search.trim()) {
            countSearchCondition = `AND (LOWER(name) LIKE $1 OR LOWER(email) LIKE $1)`;
            countParams = [`%${search.trim().toLowerCase()}%`];
        }

        const countResult = await pool.query(
            `SELECT COUNT(*) as total
     FROM "user"
     WHERE role_id = 2 
       AND deleted_at IS NULL
       ${countSearchCondition}`,
            countParams
        );

        return {
            users: result.rows,
            total: parseInt(countResult.rows[0].total),
            page,
            limit,
            totalPages: Math.ceil(countResult.rows[0].total / limit),
        };
    }

    static async findById(user_id) {
        const result = await pool.query(
            `SELECT u.user_id, 
                    u.name, 
                    u.email,
                    u.password,
                    u.role_id,
                    r.name as role_name,
                    u.is_active, 
                    u.created_at, 
                    u.updated_at, 
                    u.deleted_at
             FROM "user" u
             INNER JOIN role r ON u.role_id = r.role_id
             WHERE u.user_id = $1 
               AND u.deleted_at IS NULL`,
            [user_id]
        );
        return result.rows[0];
    }

    static async findUserByName(name) {
        const result = await pool.query(
            `SELECT u.user_id, 
                    u.name, 
                    u.email,
                    u.password,
                    u.role_id,
                    r.name as role_name,
                    u.is_active, 
                    u.created_at
             FROM "user" u
             INNER JOIN role r ON u.role_id = r.role_id
             WHERE u.name = $1 
               AND u.role_id = 2 
               AND u.deleted_at IS NULL`,
            [name]
        );
        return result.rows[0] || null;
    }

    static async findUserByEmail(email) {
        const result = await pool.query(
            `SELECT u.user_id, 
                    u.name, 
                    u.email,
                    u.password,
                    u.role_id,
                    r.name as role_name,
                    u.is_active, 
                    u.created_at
             FROM "user" u
             INNER JOIN role r ON u.role_id = r.role_id
             WHERE u.email = $1 
               AND u.deleted_at IS NULL`,
            [email]
        );
        return result.rows[0] || null;
    }

    static async validateCredentials(email, password) {
        const result = await pool.query(
            `SELECT u.user_id, 
                    u.name, 
                    u.email,
                    u.password,
                    u.role_id,
                    r.name as role_name,
                    u.is_active
             FROM "user" u
             INNER JOIN role r ON u.role_id = r.role_id
             WHERE u.email = $1 
               AND u.is_active = TRUE 
               AND u.deleted_at IS NULL`,
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return null;
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async createUser(data) {
        const { name, email, password, role_id = 2 } = data;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO "user" (name, email, password, role_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING user_id, name, email, role_id, created_at`,
            [name, email, hashedPassword, role_id]
        );

        return result.rows[0];
    }

    // Actualizar usuario
    static async updateUser(user_id, data) {
        const { name, email } = data;

        const result = await pool.query(
            `UPDATE "user" 
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email)
             WHERE user_id = $3 
               AND deleted_at IS NULL
             RETURNING user_id, name, email, role_id, updated_at`,
            [name, email, user_id]
        );

        return result.rows[0];
    }

    static async deleteUser(user_id) {
        const existingUser = await this.findById(user_id);

        if (!existingUser) {
            throw new Error('Usuario no encontrado');
        }

        const result = await pool.query(
            `UPDATE "user" 
         SET is_active = FALSE   
         WHERE user_id = $1 
         RETURNING user_id, name, email, is_active, updated_at`,
            [user_id]
        );

        return result.rows[0];
    }
}

export default User;
