/**
 * Respuesta pública de usuario (sin password).
 */
export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    role_id: row.role_id,
    is_active: row.is_active,
    photo_url: row.photo_url ?? null,
    avatar_icon_key: row.avatar_icon_key ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
