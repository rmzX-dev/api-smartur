import express from 'express'
import AdminController from '../controllers/adminController.js'

const router = express.Router()

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Obtener todos los administradores
 *     tags: [Administradores]
 *     responses:
 *       200:
 *         description: Lista de administradores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 admins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Admin'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/admin', AdminController.findAllAdminController)

/**
 * @swagger
 * /api/admin/{id}:
 *   get:
 *     summary: Obtener un administrador por ID
 *     tags: [Administradores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del administrador
 *     responses:
 *       200:
 *         description: Administrador obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Administrador no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/admin/:id', AdminController.findByIdAdminController)

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Registrar un nuevo administrador
 *     tags: [Administradores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Administrador creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Error de validación o correo ya registrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/admin/register', AdminController.createAdminController)

/**
 * @swagger
 * /api/admin/delete/{id}:
 *   delete:
 *     summary: Eliminar un administrador
 *     tags: [Administradores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del administrador a eliminar
 *     responses:
 *       200:
 *         description: Administrador eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       404:
 *         description: Administrador no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/admin/delete/:id', AdminController.deleteAdminController)

export default router