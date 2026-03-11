import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import {
  validateEmail,
  validatePassword,
  validateRequiredFields,
  emailExists,
  validateRole,
} from "../validators/userValidators.js";

import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class UserController {
  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);

      const search = req.query.search || "";
      const role = req.query.role ? parseInt(req.query.role) : null;

      const result = await User.findAll(page, limit, search, role);

      res.json({
        message: "Usuarios obtenidos exitosamente",
        totalRecords: result.totalRecords,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        users: result.users.map((user) => ({
          id: user.user_id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
        })),
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getById(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({
        message: "Usuario obtenido exitosamente",
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async findByEmail(req, res) {
    try {
      const user = await User.findByEmail(req.params.email);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({
        message: "Usuario obtenido exitosamente",
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async create(req, res) {
    try {
      const { name, email, password, role_id } = req.body;

      validateRequiredFields({ name, email, password, role_id });
      validateEmail(email);
      validatePassword(password);
      validateRole(role_id);
      await emailExists(email);

      const user = await User.create(req.body);

      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          is_active: user.is_active,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      const isValidationError =
        error.message.includes("requerid") ||
        error.message.includes("válido") ||
        error.message.includes("existe") ||
        error.message.includes("contraseña");
      res.status(isValidationError ? 400 : 500).json({
        message: isValidationError
          ? error.message
          : "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      const role_id = 2; // Rol de usuario regular

      validateRequiredFields({ name, email, password, role_id });
      validateEmail(email);
      validatePassword(password);
      await emailExists(email);

      const user = await User.create({ name, email, password, role_id });

      res.status(201).json({
        message: "Registro exitoso",
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          is_active: user.is_active,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error("Error registering user:", error);
      const isValidationError =
        error.message.includes("requerid") ||
        error.message.includes("válido") ||
        error.message.includes("existe") ||
        error.message.includes("contraseña");
      res.status(isValidationError ? 400 : 500).json({
        message: isValidationError
          ? error.message
          : "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async patch(req, res) {
    try {
      const { name, password, role_id, is_active } = req.body;

      if (password !== undefined) {
        validatePassword(password);
      }

      if (role_id !== undefined) {
        validateRole(role_id);
      }

      const user = await User.patch(req.params.id, req.body);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({
        message: "Usuario actualizado exitosamente",
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          is_active: user.is_active,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      const user = await User.delete(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({
        message: "Usuario eliminado exitosamente",
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          deleted_at: user.deleted_at,
        },
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }


  static async googleLogin(req, res) {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ status: "error", message: "Token de Google requerido" });
        }

        try {
            // 1. Validar el token con Google
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            
            const payload = ticket.getPayload();
            const { email, name } = payload;

            // 2. Buscar si el usuario ya existe en tu DB (Postgres)
            let user = await User.findByEmail(email);

            if (!user) {
                // 3. Registro automático si es la primera vez
                user = await User.create({
                    name: name,
                    email: email,
                    role_id: 2,
                    password: Math.random().toString(36).slice(-10)
                });
                console.log(`Nuevo usuario turista registrado vía Google: ${email}`);
            }

            // 4. Generar TU JWT de SMARTUR
            const token = jwt.sign(
                {
                    id: user.user_id,
                    email: user.email,
                    role_id: user.role_id,
                },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            ); 

            return res.status(200).json({
                status: "success",
                message: "Autenticación exitosa",
                token: token,
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {
            console.error("Error en validación de Google:", error);
            return res.status(401).json({ 
                status: "error", 
                message: "Token de Google no válido o expirado" 
            });
        }
  }
}

export default UserController;
