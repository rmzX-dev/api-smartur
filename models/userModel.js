import pool from '../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { resolve } from 'path'

const SALT_ROUNDS = 10

class User {
    static async findAll() {
        const result = await pool.query(`Select * from "user"`)
        return result.rows
    }

    static async findById(user_id) {
        const result = await pool.query(
            `SELECT * FROM "user" WHERE user_id = $1`,
            [user_id]
        )
        return result.rows[0]
    }

    static async findByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM "user" WHERE email = $1',
            [email]
        )
        return result.rows[0] || null
    }

    static async createAdmin(data){
        const { name, email, password, role_id = 1 } = data
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        const result = await pool.query(
            `INSERT INTO "user" (name, email, password, role_id) 
            VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role_id, registered_at`,
            [name, email, hashedPassword, role_id || 1]
        )
        return result.rows[0]
    }
    
    static async createUser(data) {
        const { name, email, password, role_id = 2 } = data
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        const result = await pool.query(
            `INSERT INTO "user" (name, email, password, role_id) 
            VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role_id, registered_at`,
            [name, email, hashedPassword, role_id || 2]
        )
        return result.rows[0]
    }

    static async deleteUser(user_id) {
        const existingUser = await this.findById(user_id)
        if (!existingUser) {
            throw new Error('Usuario no encontrado')
        }

        const result = await pool.query(
            `DELETE FROM "user" WHERE user_id = $1 RETURNING user_id, name, email`,
            [user_id]
        )

        return result.rows[0]
    }

    static async login() {}
}

export default User
