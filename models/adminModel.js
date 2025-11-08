import pool from '../config/db.js'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

class Admin {
    static async findAllAdmin() {
        const result = await pool.query(
            `SELECT user_id, name, email, role_id, registered_at
     FROM "user"
     WHERE role_id = 1`
        )
        return result.rows
    }

    static async findAdminById(user_id) {
        const result = await pool.query(
            `SELECT * FROM "user" WHERE user_id = $1`,
            [user_id]
        )
        return result.rows[0]
    }

    static async findAdminByName(name) {
        const result = await pool.query(
            `SELECT * FROM "user" WHERE name = $1 and role_id = 1`,
            [name]
        )
        return result.rows[0] || null
    }

    static async findAdminByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM "user" WHERE email = $1 and role_id = 1',
            [email]
        )
        return result.rows[0] || null
    }

    static async createAdmin(data) {
        const { name, email, password, role_id = 1 } = data
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        const result = await pool.query(
            `INSERT INTO "user" (name, email, password, role_id) 
            VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role_id, registered_at`,
            [name, email, hashedPassword, role_id || 1]
        )
        return result.rows[0]
    }

    static async deleteAdmin(user_id) {
        const existingUser = await this.findAdminById(user_id)
        
        if (!existingUser) {
            throw new Error('Usuario no encontrado')
        }
        const result = await pool.query(
            `DELETE FROM "user" WHERE user_id = $1 RETURNING user_id, name, email`,
            [user_id]
        )
        return result.rows[0]
    }
}

export default Admin
