import Admin from '../models/adminModel.js';
import {
    validateEmail,
    validatePassword,
    validateRequiredFields,
    emailExists,
} from '../validators/userValidators.js';

class AdminController {
    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);

            const result = await Admin.findAll(page, limit);

            res.json({
                message: 'Administradores obtenidos exitosamente',
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                admins: result.admins.map((admin) => ({
                    id: admin.user_id,
                    name: admin.name,
                    email: admin.email,
                    role_id: admin.role_id,
                    is_active: admin.is_active,
                    created_at: admin.created_at,
                    updated_at: admin.updated_at,
                })),
            });
        } catch (error) {
            console.error('Error fetching admins:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async getById(req, res) {
        try {
            const admin = await Admin.findById(req.params.id);

            if (!admin) {
                return res.status(404).json({ message: 'Administrador no encontrado' });
            }

            res.json({
                message: 'Administrador obtenido exitosamente',
                admin: {
                    id: admin.user_id,
                    name: admin.name,
                    email: admin.email,
                    role_id: admin.role_id,
                    is_active: admin.is_active,
                    created_at: admin.created_at,
                    updated_at: admin.updated_at,
                },
            });
        } catch (error) {
            console.error('Error fetching admin:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async create(req, res) {
        try {
            const { name, email, password } = req.body;

            validateRequiredFields({ name, email, password });
            validateEmail(email);
            validatePassword(password);
            await emailExists(email);

            const admin = await Admin.create(req.body);

            res.status(201).json({
                message: 'Administrador creado exitosamente',
                admin: {
                    id: admin.user_id,
                    name: admin.name,
                    email: admin.email,
                    role_id: admin.role_id,
                    is_active: admin.is_active,
                    created_at: admin.created_at,
                },
            });
        } catch (error) {
            console.error('Error creating admin:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async update(req, res) {
        try {
            const admin = await Admin.update(req.params.id, req.body);

            if (!admin) {
                return res.status(404).json({ message: 'Administrador no encontrado' });
            }

            res.json({
                message: 'Administrador actualizado exitosamente',
                admin: {
                    id: admin.user_id,
                    name: admin.name,
                    email: admin.email,
                    role_id: admin.role_id,
                    is_active: admin.is_active,
                    updated_at: admin.updated_at,
                },
            });
        } catch (error) {
            console.error('Error updating admin:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async delete(req, res) {
        try {
            const admin = await Admin.delete(req.params.id);

            if (!admin) {
                return res.status(404).json({ message: 'Administrador no encontrado' });
            }

            res.json({
                message: 'Administrador eliminado exitosamente',
                admin: {
                    id: admin.user_id,
                    name: admin.name,
                    email: admin.email,
                    deleted_at: admin.deleted_at,
                },
            });
        } catch (error) {
            console.error('Error deleting admin:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    static async toggleActive(req, res) {
        try {
            const admin = await Admin.toggleActive(req.params.id);

            if (!admin) {
                return res.status(404).json({ message: 'Administrador no encontrado' });
            }

            res.json({
                message: `Administrador ${user.is_active ? 'activado' : 'desactivado'} exitosamente`,
                admin: {
                    id: admin.admin_id,
                    name: admin.name,
                    email: admin.email,
                    is_active: admin.is_active,
                    updated_at: admin.updated_at,
                },
            });
        } catch (error) {
            console.error('Error toggling admin status:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }
}

export default AdminController;
