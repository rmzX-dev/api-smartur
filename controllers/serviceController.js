import { UserService } from '../services/userService.js'
import { sendEmail, sendEmailVerification } from '../utils/mailer.js'
import {
    validateEmail,
    validatePassword,
    validateRequiredFields,
} from '../validators/userValidators.js'

class ServicesController {
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

    static async loginController(req, res) {
        try {
            const { email, password } = req.body

            validateRequiredFields({ email, password })

            // Este endpoint solo hace la primera verificación (email/password)
            // y genera el código de 2FA
            const result = await UserService.login(email, password)

            if (result.status === 200) {
                // Enviar el código por email
                await sendEmailVerification(email, result.data.verificationCode)

                return res.status(200).json({
                    message: 'Código de verificación enviado',
                    requiresVerification: true,
                    userId: result.data.userId,
                    email: result.data.email,
                })
            }

            return res.status(result.status).json({ message: result.message })
        } catch (error) {

            return res.status(500).json({ message: 'Error del servidor' })
        }
    }

    static async verifyTwoStepVerificationCodeController(req, res) {
        try {
            const { email, token } = req.body

            const result = await UserService.verifyTwoStepVerificationCode(
                email,
                token
            )

            if (result.status !== 200) {
                return res
                    .status(result.status)
                    .json({ message: result.message })
            }

            res.json({
                message: 'Login exitoso',
                token: result.data.token,
                user: result.data.user,
            })
        } catch (error) {
            console.error(
                'Error en verifyTwoStepVerificationCodeController:',
                error
            )
            res.status(500).json({ error: error.message })
        }
    }
}

export default ServicesController
