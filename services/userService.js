import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findByEmail } from "../validators/userValidators.js";

const SALT_ROUNDS = 10;

export class UserService {
  static async generateResetToken(email) {
    const user = await findByEmail(email);
    if (!user) throw new Error("Usuario no encontrado");

    const token = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
      [user.user_id, token, expiresAt],
    );

    return token;
  }

  static async resetPassword(email, token, newPassword) {
    const user = await findByEmail(email);
    if (!user) throw new Error("Usuario no encontrado");

    const tokenResult = await pool.query(
      `SELECT id FROM password_reset_tokens
         WHERE user_id = $1 
         AND token = $2 
         AND used = FALSE 
         AND expires_at > NOW()`,
      [user.user_id, token],
    );

    if (tokenResult.rowCount === 0) {
      throw new Error("Código inválido o expirado");
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await pool.query("BEGIN");

    await pool.query(`UPDATE "user" SET password = $1 WHERE user_id = $2`, [
      hashedPassword,
      user.user_id,
    ]);

    await pool.query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`,
      [tokenResult.rows[0].id],
    );

    await pool.query("COMMIT");
  }

  /**
   * Login paso 1: valida credenciales, genera OTP y lo almacena en DB.
   * El controlador es responsable de enviar el OTP por correo y registrar el evento.
   *
   * OWASP A07 — Autenticación multifactor (MFA): el verificationCode devuelto
   * es enviado al correo en serviceController.loginController (línea 56).
   * Librería usada aquí: bcrypt (comparación), pg (INSERT login_tokens $1,$2,$3,$4)
   */
  static async login(email, password) {
    try {
      const user = await findByEmail(email);
      if (!user) {
        return { status: 400, message: "Usuario no encontrado" };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { status: 400, message: "Credenciales incorrectas" };
      }

      const verificationCode = String(
        Math.floor(100000 + Math.random() * 900000),
      );
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await pool.query(
        `INSERT INTO login_tokens (user_id, token, expires_at, used)
                 VALUES ($1, $2, $3, $4)`,
        [user.user_id, verificationCode, expiresAt, false],
      );

      return {
        status: 200,
        message: "Código de verificación generado",
        data: {
          userId: user.user_id,
          email: user.email,
          verificationCode: verificationCode,
          requiresVerification: true,
        },
      };
    } catch (error) {
      console.error("Error en login:", error);
      return {
        status: 500,
        message: "Error del servidor",
        error: error.message,
      };
    }
  }

  /**
   * Login paso 2: valida el OTP y emite el JWT.
   * OWASP A07 — MFA: verifica $1 (user_id) y $2 (token) con consulta parametrizada.
   * Librería: jsonwebtoken (jwt.sign), pg (consulta parametrizada)
   */
  static async verifyTwoStepVerificationCode(email, verificationCode) {
    try {
      const user = await findByEmail(email);
      if (!user) {
        return { status: 400, message: "Usuario no encontrado" };
      }

      const result = await pool.query(
        `SELECT * FROM login_tokens 
                 WHERE user_id = $1 AND token = $2`,
        [user.user_id, verificationCode],
      );

      if (result.rows.length === 0) {
        return { status: 400, message: "Código inválido" };
      }

      const tokenRecord = result.rows[0];
      const now = new Date();
      const expiresAt = new Date(tokenRecord.expires_at);

      if (tokenRecord.used) {
        return { status: 400, message: "Código ya fue usado" };
      }

      if (now > expiresAt) {
        return { status: 400, message: "Código expirado" };
      }

      await pool.query(
        `UPDATE login_tokens SET used = TRUE WHERE user_id = $1 AND token = $2 AND used = FALSE;`,
        [user.user_id, verificationCode],
      );

      // Reactivación automática si el usuario estaba inactivo (is_active = false)
      if (user.is_active === false) {
        console.log(`Reactivando usuario vía Login estándar: ${user.email}`);
        await pool.query(
          `UPDATE "user" SET is_active = TRUE WHERE user_id = $1`,
          [user.user_id]
        );
        user.is_active = true;
      }

      const jwtToken = jwt.sign(
        {
          id: user.user_id,
          email: user.email,
          role_id: user.role_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      return {
        status: 200,
        message: "Login exitoso",
        data: {
          token: jwtToken,
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            photo_url: user.photo_url ?? null,
            avatar_icon_key: user.avatar_icon_key ?? null,
          },
        },
      };
    } catch (error) {
      return { status: 500, message: "Error del servidor" };
    }
  }
}
