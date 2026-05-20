import pool from '../config/db.js';

export function normalizeEmail(email) {
    if (typeof email !== 'string') return email;
    return email.trim().toLowerCase();
}

export async function findByEmail(email) {
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

export function validateEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    const regexEmail = /\S+@\S+\.\S+/;
    if (!regexEmail.test(normalizedEmail)) {
        throw new Error('El email ingresado no es válido');
    }
}

export async function emailExists(email) {
    const result = await findByEmail(email);

    if (result) {
        throw new Error('El email ingresado ya existe');
    }
}

export function validateRole(role_id) {
    if (role_id !== 1 && role_id !== 2) {
        throw new Error('El rol ingresado no es válido');
    }
}

export function validatePassword(password) {
    if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    const regexPassword = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;
    if (!regexPassword.test(password)) {
        throw new Error(
            'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número'
        );
    }
}

export function validateRequiredFields(fields) {
    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            throw new Error(`${key} es requerido`);
        }
    }
}

/** Claves permitidas para avatar_icon_key (misma lista que la app móvil). */
export const ALLOWED_AVATAR_ICON_KEYS = new Set([
    'hiking',
    'museum',
    'beach',
    'restaurant',
    'hotel',
    'camera',
    'park',
    'flight',
    'map',
]);

const MAX_PHOTO_URL_LEN = 512;

/**
 * Valida photo_url opcional: null borra la foto; string debe ser https seguro.
 */
export function validateOptionalPhotoUrl(value) {
    if (value === undefined) return;
    if (value === null) return;
    if (typeof value !== 'string') {
        throw new Error('photo_url debe ser texto o null');
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        throw new Error('photo_url no puede estar vacío');
    }
    if (trimmed.length > MAX_PHOTO_URL_LEN) {
        throw new Error('photo_url demasiado largo');
    }
    const lower = trimmed.toLowerCase();
    if (!lower.startsWith('https://')) {
        throw new Error('photo_url debe usar https://');
    }
    try {
        const u = new URL(trimmed);
        if (u.protocol !== 'https:') {
            throw new Error();
        }
        if (!u.hostname || u.hostname.length < 3) {
            throw new Error();
        }
    } catch {
        throw new Error('photo_url no es una URL válida');
    }
}

export function validateOptionalAvatarIconKey(value) {
    if (value === undefined) return;
    if (value === null) return;
    if (typeof value !== 'string') {
        throw new Error('avatar_icon_key debe ser texto o null');
    }
    if (!ALLOWED_AVATAR_ICON_KEYS.has(value)) {
        throw new Error('avatar_icon_key no permitido');
    }
}

