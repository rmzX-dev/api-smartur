import jwt from "jsonwebtoken";

/**
 * Middleware: verifyToken
 * Verifica que el request tenga un JWT válido en el header Authorization.
 * Si es válido, adjunta el payload decodificado a req.user.
 *
 * OWASP A07 — Fallas de autenticación
 * Librería: jsonwebtoken (npm)
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401) 
      .json({ message: "Acceso denegado. Token no proporcionado." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role_id }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expirado. Inicia sesión nuevamente." });
    }
    return res.status(401).json({ message: "Token inválido." });
  }
}
