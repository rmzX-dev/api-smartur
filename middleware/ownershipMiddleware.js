/**
 * Middleware: verifyOwnership
 * Valida que el usuario autenticado (req.user.id) sea el dueño del recurso
 * solicitado (req.params.id), OR que sea admin (role_id === 1).
 *
 * Protege rutas personales: GET /users/:id, PATCH /users/:id, etc.
 * Debe usarse DESPUÉS de verifyToken.
 *
 * OWASP A01 — Control de acceso roto (Broken Access Control)
 * Previene IDOR (Insecure Direct Object Reference)
 */
export function verifyOwnership(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado." });
  }

  const resourceId = parseInt(req.params.id, 10);
  const requesterId = req.user.id;
  const isAdmin = req.user.role_id === 1;

  if (isAdmin || requesterId === resourceId) {
    return next();
  }

  return res.status(403).json({
    message:
      "Acceso prohibido. No puedes acceder a los recursos de otro usuario.",
  });
}
