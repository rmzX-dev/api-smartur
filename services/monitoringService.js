import pool from "../config/db.js";

export async function logSecurityEvent(type, email, ip, severity) {
  try {
    const query = `
            INSERT INTO security_events (event_type, user_email, ip_address, severity)
            VALUES ($1, $2, $3, $4)
        `;
    await pool.query(query, [type, email ?? null, ip ?? null, severity]);
  } catch (err) {
    console.error("monitoringService.logSecurityEvent:", err.message);
  }
}

// ── A09: Consulta de eventos para el Swagger de auditoría
export async function getSecurityEvents({ limit = 20, severity } = {}) {
  const conditions = [];
  const values = [];

  if (severity) {
    conditions.push(`severity = $${values.length + 1}`);
    values.push(severity);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  values.push(limit);

  const result = await pool.query(
    `SELECT id, event_type, user_email, ip_address, severity, created_at
         FROM security_events
         ${where}
         ORDER BY created_at DESC
         LIMIT $${values.length}`,
    values,
  );
  return result.rows;
}
