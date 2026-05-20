-- Fecha de nacimiento del usuario (preferencias / edición de perfil)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS birth_date DATE NULL;
