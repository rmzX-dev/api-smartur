import pool from '../config/db.js'


export async function findByEmail(email) {
    try {
        const result = await pool.query(
            'SELECT * FROM "user" WHERE email = $1',
            [email]
        )
        return result.rows[0]
    } catch (error) {
        console.error('Error in findByEmail:', error)
        throw error
    }
}

export function validateEmail(email) {
    const regexEmail = /\S+@\S+\.\S+/
    if (!regexEmail.test(email)) {
        throw new Error('El email no es válido')
    }
}

export function validatePassword(password) {
    if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres')
    }
    const regexPassword = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/
    if (!regexPassword.test(password)) {
        throw new Error(
            'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número'
        )
    }
}

export function validateRequiredFields(fields) {
    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            throw new Error(`${key} es requerido`)
        }
    }
}
