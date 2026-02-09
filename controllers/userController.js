import User from '../models/userModel.js';
import {
    validateEmail,
    validatePassword,
    validateRequiredFields,
} from '../validators/userValidators.js';
import Admin from '../models/adminModel.js';

class UserController {
    static async findAllUserController(req, res) {
        try {
            // Obtener parámetros de query (con valores por defecto)
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || ''; // ✅ NUEVO
            const order = req.query.order || 'desc'; // ✅ NUEVO

            // Validar límites
            if (limit > 100) {
                return res.status(400).json({
                    message: 'El límite máximo es 100 registros por página',
                });
            }

            if (page < 1 || limit < 1) {
                return res.status(400).json({
                    message: 'Page y limit deben ser mayores a 0',
                });
            }

            // Validar orden
            if (order !== 'asc' && order !== 'desc') {
                return res.status(400).json({
                    message: 'El parámetro order debe ser "asc" o "desc"',
                });
            }

            const result = await User.findAllUser(page, limit, search, order); // ✅ PASAR NUEVOS PARÁMETROS

            res.json({
                message: 'Usuarios obtenidos exitosamente',
                pagination: {
                    currentPage: result.page,
                    totalPages: result.totalPages,
                    limit: result.limit,
                    totalUsers: result.total,
                },
                users: result.users.map((user) => ({
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    role_name: user.role_name,
                    is_active: user.is_active,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                    deleted_at: user.deleted_at,
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

    // Obtener usuario por ID
    static async findUserByIdController(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user || user.role_id !== 2) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json({
                message: 'Usuario obtenido exitosamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    role_name: user.role_name,
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

    // Crear nuevo usuario
    static async createUserController(req, res) {
        try {
            const { name, email, password, role_id } = req.body;

            validateRequiredFields({ name, email, password });

            const existingUser = await User.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Correo ya registrado' });
            }

            const existingAdmin = await Admin.findAdminByEmail(email);
            if (existingAdmin) {
                return res.status(400).json({ message: 'Correo ya registrado' });
            }

            validateEmail(email);
            validatePassword(password);

            const user = await User.createUser({
                name,
                email,
                password,
                role_id,
            });
            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
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

    // Actualizar usuario
    static async updateUserController(req, res) {
        try {
            const user = await User.updateUser(req.params.id, req.body);
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

    // Borrado lógico (soft delete)
    static async deleteUserController(req, res) {
        try {
            const user = await User.deleteUser(req.params.id);
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
            if (error.message === 'Usuario no encontrado') {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error deleting user:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }
}

export default UserController;
