import User from '../models/userModel.js';
import {
    validateEmail,
    validatePassword,
    validateRequiredFields,
    emailExists,
    validateRole
} from '../validators/userValidators.js';

class UserController {
    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);

            const search = req.query.search || '';
            const role = req.query.role ? parseInt(req.query.role) : null;

            const result = await User.findAll(page, limit, search, role);

            res.json({
                message: 'Usuarios obtenidos exitosamente',
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                users: result.users.map((user) => ({
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    is_active: user.is_active,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                })),
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async getById(req, res) {
        try {
            const user = await User.findById(req.params.id);

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Usuario obtenido exitosamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    is_active: user.is_active,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                },
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async create(req, res) {
        try {
            const { name, email, password, role_id } = req.body;

            validateRequiredFields({ name, email, password, role_id });
            validateEmail(email);
            validatePassword(password);
            validateRole(role_id);
            await emailExists(email);

            const user = await User.create(req.body);

            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    is_active: user.is_active,
                    created_at: user.created_at,
                },
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async patch(req, res) {
        try {
            const { name, password, role_id, is_active } = req.body;

            if (password !== undefined) {
                validatePassword(password);
            }

            if (role_id !== undefined) {
                validateRole(role_id);
            }

            const user = await User.patch(req.params.id, req.body);

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Usuario actualizado exitosamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    is_active: user.is_active,
                    updated_at: user.updated_at,
                },
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async delete(req, res) {
        try {
            const user = await User.delete(req.params.id);

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Usuario eliminado exitosamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    deleted_at: user.deleted_at,
                },
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }
}

export default UserController;
