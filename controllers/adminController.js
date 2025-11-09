import Admin from '../models/adminModel.js'
import {
    validateEmail,
    validatePassword,
    validateRequiredFields,
} from '../validators/userValidators.js'

class AdminController {
    static async findAllAdminController(req, res) {
        try {
            const admins = await Admin.findAllAdmin()
            res.json({
                message: 'Administradores obtenidos exitosamente',
                count: admins.length,
                admins: admins.map(admin => ({
                    id: admin.user_id,
                    name: admin.name,
                    email: admin.email,
                    role_id: admin.role_id,
                    registered_at: admin.registered_at
                }))
            })
        } catch (error) {
            console.error('Error fetching admins:', error)
            res.status(500).json({ 
                message: 'Error interno del servidor',
                error: error.message 
            })
        }
    }

    static async findByIdAdminController(req, res) {
        try {
            const admin = await Admin.findByIdAdmin(req.params.id)
            if (!admin || admin.role_id !== 1) {
                return res.status(404).json({ message: 'Administrador no encontrado' })
            }
            res.json({
                message: 'Administrador obtenido exitosamente',
                admin: {
                    id: admin.user_id,
                    name: admin.name,
                    email: admin.email,
                    role_id: admin.role_id,
                    registered_at: admin.registered_at
                }
            })
        } catch (error) {
            console.error('Error fetching admin:', error)
            res.status(500).json({ 
                message: 'Error interno del servidor',
                error: error.message 
            })
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

            const admin = await Admin.createAdmin({
                name,
                email,
                password,
                role_id,
            })
            res.status(201).json({
                message: 'Administrador creado exitosamente',
                admin: {
                    id: admin.user_id,
                    name: admin.name,
                    email: admin.email,
                    role_id: admin.role_id,
                    registered_at: admin.registered_at,
                },
            })
        } catch (error) {
            console.error('Error creating admin:', error)
            res.status(500).json({ 
                message: 'Error interno del servidor',
                error: error.message 
            })
        }
    }

    static async deleteAdminController(req, res) {
        try {
            const admin = await Admin.deleteAdmin(req.params.id)
            res.json({
                message: 'Administrador eliminado exitosamente',
                admin: {
                    id: admin.user_id,
                    name: admin.name,
                    email: admin.email,
                },
            })
        } catch (error) {
            if (error.message === 'Administrador no encontrado') {
                return res.status(404).json({ message: error.message })
            }
            console.error('Error deleting admin:', error)
            res.status(500).json({ 
                message: 'Error interno del servidor',
                error: error.message 
            })
        }
    }
}

export default AdminController