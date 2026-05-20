/**
 * Middleware factory: requireRole
 * Verifica que el usuario autenticado (req.user) tenga uno de los roles permitidos.
 * Debe usarse DESPUÉS de verifyToken.
 *
 * Uso: router.get('/endpoint', verifyToken, requireRole([1]), handler)
 *   role_id 1 = admin
 *   role_id 2 = user
 *
 * OWASP A01 — Control de acceso roto (Broken Access Control)
 * Implementa RBAC (Role-Based Access Control)
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado." });
    }

    if (!allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({
        message:
          "Acceso prohibido. No tienes permisos para realizar esta acción.",
      });
    }

    next();
  };
}
