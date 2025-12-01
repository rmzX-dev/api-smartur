import express from 'express'
import ServicesController from '../controllers/serviceController.js'

const router = express.Router()

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', ServicesController.loginController)

/**
 * @swagger
 * /api/verify-2fa:
 *   post:
 *     summary: Verificar código de autenticación de dos factores
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código verificado exitosamente
 *       400:
 *         description: Código inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/verify-2fa',ServicesController.verifyTwoStepVerificationCodeController)

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Código de recuperación enviado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/users/forgot-password',ServicesController.forgotPasswordController)

/**
 * @swagger
 * /api/users/verify-reset-code:
 *   post:
 *     summary: Verificar código de recuperación
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código verificado exitosamente
 *       400:
 *         description: Código inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/users/verify-reset-code',ServicesController.verifyResetCodeController)

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Código inválido o contraseña no válida
 *       500:
 *         description: Error interno del servidor
 */
router.post('/users/reset-password', ServicesController.resetPasswordController)

export default router