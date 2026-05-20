import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import { toPublicUser } from "../utils/userPublic.js";
import {
  validateEmail,
  validatePassword,
  validateRequiredFields,
  emailExists,
  validateRole,
  validateOptionalPhotoUrl,
  validateOptionalAvatarIconKey,
} from "../validators/userValidators.js";

import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function safeGooglePicture(url) {
  if (!url || typeof url !== "string") return null;
  try {
    validateOptionalPhotoUrl(url.trim());
    return url.trim();
  } catch {
    return null;
  }
}

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
        users: result.users.map((u) => toPublicUser(u)),
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
        user: toPublicUser(user),
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
        user: toPublicUser(user),
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

      const roleIdParsed = role_id !== undefined ? Number(role_id) : undefined;
      validateRequiredFields({ name, email, password, role_id: roleIdParsed });
      validateEmail(email);
      validatePassword(password);
      validateRole(roleIdParsed);
      await emailExists(email);

      const user = await User.create({ ...req.body, role_id: roleIdParsed });

      if (req.file) {
        const folder = `smartur/avatars/${user.user_id}`;
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image", overwrite: true },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            },
          );
          stream.end(req.file.buffer);
        });
        const secureUrl = uploadResult.secure_url;
        await User.patch(String(user.user_id), { photo_url: secureUrl, avatar_icon_key: null });
        user.photo_url = secureUrl;
        user.avatar_icon_key = null;
      }

      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: toPublicUser(user),
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
      const role_id = 2;

      validateRequiredFields({ name, email, password, role_id });
      validateEmail(email);
      validatePassword(password);
      await emailExists(email);

      const user = await User.create({ name, email, password, role_id });

      if (req.file) {
        const folder = `smartur/avatars/${user.user_id}`;
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image", overwrite: true },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            },
          );
          stream.end(req.file.buffer);
        });
        const secureUrl = uploadResult.secure_url;
        await User.patch(String(user.user_id), { photo_url: secureUrl, avatar_icon_key: null });
        user.photo_url = secureUrl;
        user.avatar_icon_key = null;
      }

      res.status(201).json({
        message: "Registro exitoso",
        user: toPublicUser(user),
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
      const targetId = parseInt(req.params.id, 10);
      const isAdmin = req.user && req.user.role_id === 1;

      const updates = {};

      if (req.body.name !== undefined) {
        if (typeof req.body.name !== "string" || !req.body.name.trim()) {
          return res.status(400).json({ message: "Nombre inválido" });
        }
        updates.name = req.body.name.trim();
      }

      if (req.body.password !== undefined) {
        validatePassword(req.body.password);
        updates.password = req.body.password;
      }

      if (Object.prototype.hasOwnProperty.call(req.body, "photo_url")) {
        validateOptionalPhotoUrl(req.body.photo_url);
        updates.photo_url = req.body.photo_url;
      }

      if (Object.prototype.hasOwnProperty.call(req.body, "avatar_icon_key")) {
        validateOptionalAvatarIconKey(req.body.avatar_icon_key);
        updates.avatar_icon_key = req.body.avatar_icon_key;
      }

      if (isAdmin) {
        if (req.body.role_id !== undefined) {
          const roleId = Number(req.body.role_id);
          validateRole(roleId);
          updates.role_id = roleId;
        }
        if (req.body.is_active !== undefined) {
          updates.is_active = String(req.body.is_active) === 'true';
        }
      } else if (
        req.body.is_active === false &&
        targetId === req.user.id
      ) {
        // Autodesactivación con reset (Fresh Start)
        const user = await User.deactivateAndReset(targetId);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        return res.json({
          message: "Cuenta desactivada y datos reseteados exitosamente",
          user: toPublicUser(user),
        });
      }

      if (req.file) {
        const folder = `smartur/avatars/${targetId}`;
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image", overwrite: true },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            },
          );
          stream.end(req.file.buffer);
        });
        updates.photo_url = uploadResult.secure_url;
        updates.avatar_icon_key = null;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No hay campos válidos para actualizar" });
      }

      // Si un admin está desactivando a un usuario, también debería hacer reset
      let user;
      if (isAdmin && updates.is_active === false) {
        user = await User.deactivateAndReset(targetId);
      } else {
        user = await User.patch(String(targetId), updates);
      }

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({
        message: "Usuario actualizado exitosamente",
        user: toPublicUser(user),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      const isClient =
        error.message &&
        (error.message.includes("photo_url") ||
          error.message.includes("avatar_icon_key") ||
          error.message.includes("contraseña") ||
          error.message.includes("rol"));
      res.status(isClient ? 400 : 500).json({
        message: isClient ? error.message : "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async uploadAvatar(req, res) {
    try {
      const targetId = parseInt(req.params.id, 10);
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "Archivo avatar requerido (campo: avatar)" });
      }
      const allowed = /^image\/(jpeg|png|gif|webp|heic|heif)$/i;
      if (!allowed.test(req.file.mimetype)) {
        return res.status(400).json({
          message: "Solo imágenes JPEG, PNG, GIF, WebP, HEIC o HEIF",
        });
      }
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "Imagen demasiado grande (máx. 5 MB)" });
      }

      const folder = `smartur/avatars/${targetId}`;
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: "image", overwrite: true },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        );
        stream.end(req.file.buffer);
      });

      const secureUrl = uploadResult.secure_url;
      const user = await User.patch(String(targetId), {
        photo_url: secureUrl,
        avatar_icon_key: null,
      });

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({
        message: "Avatar actualizado",
        user: toPublicUser(user),
      });
    } catch (error) {
      console.error("uploadAvatar:", error);
      res.status(500).json({
        message: "Error al subir avatar",
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
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, name } = payload;
      const picture = safeGooglePicture(payload.picture);

      let user = await User.findByEmail(email);

      if (!user) {
        user = await User.create({
          name: name || email.split("@")[0],
          email: email,
          role_id: 2,
          password: Math.random().toString(36).slice(-12) + "Aa1",
          photo_url: picture,
          avatar_icon_key: null,
        });
        console.log(`Nuevo usuario turista registrado vía Google: ${email}`);
      } else {
        // Reactivación automática si estaba inactivo
        const updates = {};
        if (user.is_active === false) {
          updates.is_active = true;
          console.log(`Reactivando usuario vía Google Login: ${email}`);
        }

        // No sobrescribir foto/avatar ya elegidos por el usuario (p. ej. subida vía API).
        if (
          picture &&
          !user.photo_url &&
          (user.avatar_icon_key == null || user.avatar_icon_key === '')
        ) {
          updates.photo_url = picture;
        }

        if (Object.keys(updates).length > 0) {
          await User.patch(String(user.user_id), updates);
          user = await User.findById(user.user_id);
        }
      }

      const token = jwt.sign(
        {
          id: user.user_id,
          email: user.email,
          role_id: user.role_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      return res.status(200).json({
        status: "success",
        message: "Autenticación exitosa",
        token: token,
        user: toPublicUser(user),
      });
    } catch (error) {
      console.error("Error en validación de Google:", error);
      return res.status(401).json({
        status: "error",
        message: "Token de Google no válido o expirado",
      });
    }
  }
}

export default UserController;
