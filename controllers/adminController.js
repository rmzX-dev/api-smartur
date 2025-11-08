import Admin from '../models/adminModel.js'

import {
    validateEmail,
    validatePassword,
    validateRequiredFields,
} from '../validators/userValidators.js'

class AdminController {

    static async findAllAdminController(req, res) {
        try {
            const users = await Admin.findAllAdmin()
            res.json(users)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static async findByIdAminController(req, res) {
        try {
            const user = await User.findByIdAdmin(req.params.id)
            if (!user || user.role_id !== 1) {
                return res
                    .status(404)
                    .json({ message: 'Usuario no encontrado' })
            }
            res.json(user)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static async createAdminController(req, res) {
        try {
            const { name, email, password, role_id } = req.body

            validateRequiredFields({ name, email, password })

            const existingUser = await Admin.findAdminByEmail(email)
            if (existingUser) {
                return res.status(400).json({ message: 'Correo ya registrado' })
            }

            validateEmail(email)
            validatePassword(password)

            const user = await Admin.createAdmin({
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
            res.status(500).json({ error: error.message })
        }
    }

    static async deleteUserController(req, res) {
        try {
            const user = await Admin.deleteAdmin(req.params.id)
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
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }
}

export default AdminController;