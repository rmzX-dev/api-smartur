import User from '../models/userModel.js'
import { UserService } from '../services/userService.js'
import { sendEmail } from '../utils/mailer.js'
import {
    validateEmail,
    validatePassword,
    validateRequiredFields,
} from '../validators/userValidators.js'

class UserController {
    static async findAllController(req, res) {
        try {
            const users = await User.findAll()
            res.json(users)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static async findByIdController(req, res) {
        try {
            const user = await User.findById(req.params.id)
            if (!user) {
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

            const existingUser = await User.findByEmail(email)
            if (existingUser) {
                return res.status(400).json({ message: 'Correo ya registrado' })
            }

            validateEmail(email)
            validatePassword(password)

            const user = await User.createAdmin({
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

    static async createUserController(req, res) {
        try {
            const { name, email, password, role_id } = req.body

            validateRequiredFields({ name, email, password })

            const existingUser = await User.findByEmail(email)
            if (existingUser) {
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
            res.status(500).json({ error: error.message })
        }
    }

    static async forgotPasswordController(req, res) {
        try {
            const { email } = req.body
            const result = await UserService.generateResetToken(email)

            if (result) {
                await sendEmail(email, result.token)
            }
            res.json({ message: `Se ha enviado un codigo al correo: ${email}` })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static async verifyResetCodeController(req, res) {
        try {
            const { email, token } = req.body
            const valid = await UserService.verifyResetCode(email, token)

            if (!valid) {
                return res
                    .status(400)
                    .json({ message: 'Código inválido o expirado' })
            }

            res.json({ message: 'Código verificado correctamente' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static async resetPasswordController(req, res) {
        try {
            const { email, token, newPassword } = req.body

            validatePassword(newPassword)
            await UserService.resetPassword(email, token, newPassword)
            return res
                .status(200)
                .json({ message: 'Contraseña actualizada correctamente' })
        } catch (error) {
            if (
                error.message === 'Usuario no encontrado' ||
                error.message === 'Código inválido o expirado'
            ) {
                return res.status(400).json({ message: error.message })
            }

            return res
                .status(500)
                .json({ message: 'Error interno del servidor' })
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
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }

    static async loginController(req, res) {
        try {
            const { email, password } = req.body
            validateRequiredFields({ email, password })
            const result = await UserService.login({ email, password })
            return res.status(200).json(result)
        } catch (error) {
            if (
                error.message === 'Usuario no encontrado' ||
                error.message === 'Contraseña incorrecta' ||
                error.message.includes('es requerido') // <- aquí
            ) {
                return res.status(400).json({ message: error.message })
            }

            // Otros errores inesperados
            console.error('Error en loginController:', error)
            return res.status(500).json({ message: 'Error del servidor' })
        }
    }
}

export default UserController
