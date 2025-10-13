import pool from '../config/db.js'
import bcrypt from 'bcrypt'
import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'

export class UserService {
    static async findByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM "user" WHERE email = $1',
            [email]
        )
        return result.rows[0] || null
    }
    static async generateResetToken(email) {
        const user = await User.findByEmail(email)
        if (!user) return null

        const token = String(Math.floor(100000 + Math.random() * 900000))
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

        await pool.query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
            [user.user_id, token, expiresAt]
        )

        return { user, token }
    }

    static async verifyResetCode(email, token) {
        const user = await User.findByEmail(email)
        if (!user) return false

        const result = await pool.query(
            `SELECT * FROM password_reset_tokens
             WHERE user_id = $1 AND token = $2 AND used = FALSE AND expires_at > NOW()`,
            [user.user_id, token]
        )
        return result.rowCount > 0
    }

    static async resetPassword(email, token, newPassword) {
        const user = await User.findByEmail(email)
        if (!user) throw new Error('Usuario no encontrado')

        const tokenResult = await pool.query(
            `SELECT * FROM password_reset_tokens
             WHERE user_id = $1 AND token = $2 AND used = FALSE AND expires_at > NOW()`,
            [user.user_id, token]
        )

        if (tokenResult.rowCount === 0)
            throw new Error('Código inválido o expirado')

        const hashed = await bcrypt.hash(newPassword, 10)
        await pool.query(`UPDATE "user" SET password = $1 WHERE user_id = $2`, [
            hashed,
            user.user_id,
        ])

        await pool.query(
            `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`,
            [tokenResult.rows[0].id]
        )

        return user
    }

    static async login({ email, password }) {
        const user = await this.findByEmail(email)
        if (!user) throw new Error('Usuario no encontrado')

        if (!password) throw new Error('Password es requerido')

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) throw new Error('Contraseña incorrecta')

        const token = jwt.sign(
            { id: user.user_id, email: user.email, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        return {
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role_name,
            },
        }
    }
}
