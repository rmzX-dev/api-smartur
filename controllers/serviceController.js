import { UserService } from '../services/userService.js';
import { sendEmail, sendEmailVerification } from '../utils/mailer.js';
import { validatePassword, validateRequiredFields } from '../validators/userValidators.js';


class ServicesController {
    static async forgotPasswordController(req, res) {
        try {
            const { email } = req.body;

            const token = await UserService.generateResetToken(email);
            await sendEmail(email, token);

            res.json({ message: 'Código enviado correctamente' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async resetPasswordController(req, res) {
        try {
            const { email, token, newPassword } = req.body;

            validatePassword(newPassword);

            await UserService.resetPassword(email, token, newPassword);

            res.json({ message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async loginController(req, res) {
        try {
            const { email, password } = req.body;

            validateRequiredFields({ email, password });

            const result = await UserService.login(email, password);

            if (result.status === 200) {
                await sendEmailVerification(email, result.data.verificationCode);
                return res.status(200).json({
                    message: 'Código de verificación enviado',
                    requiresVerification: true,
                    userId: result.data.userId,
                    email: result.data.email,
                });
            }

            return res.status(result.status).json({ message: result.message, error: result.error });
        } catch (error) {
            console.error('Error en loginController:', error);
            return res.status(500).json({ message: 'Error del servidor', error: error.message });
        }
    }

    static async verifyTwoStepVerificationCodeController(req, res) {
        try {
            const { email, token } = req.body;

            const result = await UserService.verifyTwoStepVerificationCode(email, token);

            if (result.status !== 200) {
                return res.status(result.status).json({ message: result.message });
            }

            res.json({
                message: 'Login exitoso',
                token: result.data.token,
                user: result.data.user,
            });
        } catch (error) {
            console.error('Error en verifyTwoStepVerificationCodeController:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default ServicesController;
