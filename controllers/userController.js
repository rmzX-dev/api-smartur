import User from '../models/userModel.js'
import {
    validateEmail,
    validatePassword,
    validateRequiredFields,
} from '../validators/userValidators.js'
import Admin from '../models/adminModel.js'

class UserController {
    static async findAllUserController(req, res) {
        try {
            const users = await User.findAllUser()
            res.json({
                message: 'Usuarios obtenidos exitosamente',
                count: users.length,
                users: users.map((user) => ({
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    registered_at: user.registered_at,
                })),
            })
        } catch (error) {
            console.error('Error fetching users:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async findUserByIdController(req, res) {
        try {
            const user = await User.findById(req.params.id)
            if (!user || user.role_id !== 2) {
                return res
                    .status(404)
                    .json({ message: 'Usuario no encontrado' })
            }
            res.json({
                message: 'Usuario obtenido exitosamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    registered_at: user.registered_at,
                },
            })
        } catch (error) {
            console.error('Error fetching user:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async createUserController(req, res) {
        try {
            const { name, email, password, role_id } = req.body

            validateRequiredFields({ name, email, password })

            const existingUser = await User.findUserByEmail(email)
            if (existingUser) {
                return res.status(400).json({ message: 'Correo ya registrado' })
            }

            const existingAdmin = await Admin.findAdminByEmail(email)
            if (existingAdmin) {
                return res.status(400).json({ message: 'Correo ya registrado' })
            }

            validateEmail(email)
            validatePassword(password)

            const user = await User.createUser({
                name,
                email,
                password,
                role_id,
            })
            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    registered_at: user.registered_at,
                },
            })
        } catch (error) {
            console.error('Error creating user:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async deleteUserController(req, res) {
        try {
            const user = await User.deleteUser(req.params.id)
            res.json({
                message: 'Usuario eliminado exitosamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                },
            })
        } catch (error) {
            if (error.message === 'Usuario no encontrado') {
                return res.status(404).json({ message: error.message })
            }
            console.error('Error deleting user:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async updateUserController(req, res) {
        try {
            const user = await User.updateUser(req.params.id, req.body)
            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'Usuario no encontrado' })
            }
            res.json({
                message: 'Usuario actualizado exitosamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    registered_at: user.registered_at,
                },
            })
        } catch (error) {
            console.error('Error updating user:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }
}

export default UserController
