import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

/**
 * Swagger dedicado para la verificación de las 5 mitigaciones OWASP.
 * Cada tag corresponde a una vulnerabilidad y sus escenarios de prueba.
 */
const securityOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SMARTUR — Security Audit",
      version: "1.0.0",
      description: `
## Objetivo

Este documento describe los endpoints necesarios para verificar que las 5 mitigaciones OWASP están activas y funcionando correctamente en la API SMARTUR.

## Flujo de verificación

1. Obtén un JWT ejecutando **POST /login** seguido de **POST /two-factor**
2. Haz clic en **Authorize** (botón superior derecho) e ingresa el token
3. Ejecuta los casos de prueba de cada sección en el orden indicado

---

| Código | Vulnerabilidad | Control implementado |
|---|---|---|
| A01 | Broken Access Control | JWT + RBAC + Ownership |
| A02 | Cryptographic Failures | MFA (OTP por correo) + bcrypt |
| A03 | Injection | Consultas parametrizadas (pg) |
| A04 | Security Misconfiguration | Helmet + Rate Limiting |
| A09 | Security Logging Failures | Registro en PostgreSQL |
`,
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v2`,
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT obtenido desde POST /two-factor. Ingresa el valor del campo `token` de la respuesta.",
        },
      },
      schemas: {
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          example: { email: "admin@smartur.com", password: "Password1!" },
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },
        TwoFactorRequest: {
          type: "object",
          required: ["email", "token"],
          description:
            "El campo `token` es el código OTP de 6 dígitos recibido en el correo registrado.",
          example: { email: "admin@smartur.com", token: 123456 },
          properties: {
            email: { type: "string", format: "email" },
            token: { type: "integer", description: "Código OTP de 6 dígitos" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            requiresVerification: { type: "boolean", example: true },
            email: { type: "string", example: "admin@smartur.com" },
          },
        },
        JwtResponse: {
          type: "object",
          description:
            "Copia el valor de `token` y úsalo en el botón Authorize.",
          properties: {
            token: {
              type: "string",
              description: "JWT firmado con HS256, expira en 24h",
            },
          },
        },
        SecurityEvent: {
          type: "object",
          properties: {
            id: { type: "integer" },
            event_type: {
              type: "string",
              example: "LOGIN_FAIL",
              enum: [
                "LOGIN_STEP1",
                "LOGIN_FAIL",
                "LOGIN_SUCCESS",
                "MFA_DENIED",
                "PASSWORD_RESET_REQUEST",
                "PASSWORD_RESET_SUCCESS",
                "UNAUTHORIZED",
              ],
            },
            user_email: { type: "string", nullable: true },
            ip_address: { type: "string", nullable: true },
            severity: { type: "string", enum: ["INFO", "WARN", "ERROR"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        ErrorUnauthorized: {
          type: "object",
          example: { message: "Token no proporcionado" },
        },
        ErrorForbidden: {
          type: "object",
          example: { message: "Acceso prohibido: rol insuficiente" },
        },
        ErrorRateLimit: {
          type: "object",
          example: {
            message: "Demasiados intentos. Intenta de nuevo en 1 minuto.",
          },
        },
        ErrorBadRequest: {
          type: "object",
          example: { message: "Código inválido o expirado" },
        },
      },
    },
    tags: [
      {
        name: "A02 — Autenticación Multifactor",
        description: `**Primer paso para todos los tests.** Verifica que el acceso requiere dos factores de autenticación.\n\n**Flujo:**\n1. Ejecuta \`POST /login\` con email y contraseña válidos — Respuesta: \`requiresVerification: true\`\n2. Revisa tu correo y copia el código OTP de 6 dígitos\n3. Ejecuta \`POST /two-factor\` con el OTP — Respuesta: \`{ token: "eyJ..." }\`\n4. Haz clic en **Authorize** y pega el token`,
      },
      {
        name: "A01 — Control de Acceso",
        description: `Verifica que las rutas están protegidas por autenticación y autorización basada en roles.\n\n**Resultados esperados:**\n- Sin JWT en el header → **401 Unauthorized**\n- JWT válido pero con rol insuficiente (role_id = 2) → **403 Forbidden**\n- JWT válido con rol Admin (role_id = 1) → **200 OK**\n- Usuario intentando acceder al perfil de otro → **403 Forbidden** (Ownership)`,
      },
      {
        name: "A03 — Inyección SQL",
        description: `Verifica que el input malicioso no afecta la base de datos.\n\n**Técnica:** Todas las queries usan placeholders \`$1\`, \`$2\` del driver \`pg\`. El valor del usuario nunca se concatena.\n\n**Resultado esperado:** Respuesta normal (200 o 404), la tabla \`"user"\` permanece intacta.`,
      },
      {
        name: "A04 — Hardening y Rate Limiting",
        description: `Verifica que el servidor tiene cabeceras HTTP de seguridad y protección contra fuerza bruta.\n\n**Cabeceras esperadas (visibles en Response Headers):**\n- \`X-Frame-Options: SAMEORIGIN\`\n- \`X-Content-Type-Options: nosniff\`\n- \`Strict-Transport-Security\`\n- \`X-Powered-By\` → **ausente**\n\n**Rate Limiting:** Ejecuta el login 6 veces con credenciales incorrectas. El sexto intento debe retornar **429**.`,
      },
      {
        name: "A09 — Registro de Seguridad",
        description: `Verifica que los eventos de autenticación se registran de forma persistente en PostgreSQL.\n\nEste endpoint requiere rol Admin, por lo que también evidencia **A01**.\n\n**Ejecuta primero los tests de A01, A02 y A04** para generar eventos, luego consulta este endpoint para confirmar el registro.`,
      },
    ],
    paths: {
      // ─── A02: Autenticación Multifactor ─────────────────────────────
      "/login": {
        post: {
          tags: ["A02 — Autenticación Multifactor"],
          summary: "Paso 1 — Validar credenciales y generar OTP",
          description: `**Evidencia A02 — bcrypt + envío de OTP:**\n\nEl sistema verifica la contraseña usando \`bcrypt.compare()\`. Si es correcta, **no emite el JWT**; en cambio genera un código OTP de 6 dígitos, lo almacena en \`login_tokens\` (expira en 5 min) y lo envía al correo del usuario con \`nodemailer\`.\n\nEsto garantiza que conocer la contraseña no es suficiente para autenticarse.`,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
                examples: {
                  credencialesValidas: {
                    summary: "Credenciales válidas (Admin)",
                    value: {
                      email: "admin@smartur.com",
                      password: "Password1!",
                    },
                  },
                  contrasenaIncorrecta: {
                    summary: "Contraseña incorrecta",
                    value: {
                      email: "admin@smartur.com",
                      password: "wrongpassword",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description:
                "Credenciales válidas. Código OTP enviado al correo.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LoginResponse" },
                },
              },
            },
            400: {
              description: "Credenciales incorrectas",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorBadRequest" },
                },
              },
            },
            429: {
              description:
                "Rate Limit activo — demasiados intentos (evidencia A04)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorRateLimit" },
                },
              },
            },
          },
        },
      },
      "/two-factor": {
        post: {
          tags: ["A02 — Autenticación Multifactor"],
          summary: "Paso 2 — Verificar OTP y emitir JWT",
          description: `**Evidencia A02 completa — Validación del OTP y emisión del JWT:**\n\n- El OTP se valida contra la DB usando una consulta parametrizada (\`WHERE user_id = $1 AND token = $2\`)\n- Si el OTP fue previamente usado → **400** "Código ya fue usado" (previene reutilización)\n- Si expiró (más de 5 min) → **400** "Código expirado"\n- Si es válido → emite JWT firmado: \`jwt.sign({ id, email, role_id }, JWT_SECRET, { expiresIn: '24h' })\`\n\nCopia el valor de \`token\` del response y haz clic en **Authorize**.`,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TwoFactorRequest" },
                examples: {
                  otpValido: {
                    summary: "OTP válido (reemplaza 123456 con el código real)",
                    value: { email: "admin@smartur.com", token: 123456 },
                  },
                  otpReutilizado: {
                    summary: "OTP reutilizado — debe retornar 400",
                    value: { email: "admin@smartur.com", token: 123456 },
                  },
                  otpIncorrecto: {
                    summary: "OTP incorrecto — debe retornar 400",
                    value: { email: "admin@smartur.com", token: 0 },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "JWT emitido correctamente. Cópialo en Authorize.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/JwtResponse" },
                },
              },
            },
            400: {
              description: "OTP inválido, expirado o reutilizado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorBadRequest" },
                },
              },
            },
            429: {
              description:
                "Rate Limit activo — demasiados intentos (evidencia A04)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorRateLimit" },
                },
              },
            },
          },
        },
      },

      // ─── A01: Control de Acceso ─────────────────────────────────────
      "/users": {
        get: {
          tags: ["A01 — Control de Acceso"],
          summary: "Listar usuarios — requiere rol Admin (RBAC)",
          description: `**Evidencia A01 — Autenticación y RBAC:**\n\nRuta protegida con: \`verifyToken → requireRole([1])\`\n\n**Escenarios:**\n1. Sin header \`Authorization\` → **401**\n2. Token válido con \`role_id = 2\` (Usuario) → **403**\n3. Token válido con \`role_id = 1\` (Admin) → **200**`,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "page",
              schema: { type: "integer", default: 1 },
            },
            {
              in: "query",
              name: "limit",
              schema: { type: "integer", default: 10 },
            },
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              description: "Búsqueda por nombre o email",
            },
          ],
          responses: {
            200: {
              description: "Lista de usuarios — acceso concedido (Admin)",
            },
            401: {
              description: "Sin JWT — A01 verificado: autenticación requerida",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorUnauthorized" },
                },
              },
            },
            403: {
              description: "Rol insuficiente — A01 verificado: RBAC activo",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorForbidden" },
                },
              },
            },
          },
        },
      },
      "/users/{id}": {
        get: {
          tags: ["A01 — Control de Acceso"],
          summary:
            "Ver perfil de usuario — requiere ser propietario o Admin (Ownership)",
          description: `**Evidencia A01 — Ownership:**\n\nRuta protegida con: \`verifyToken → verifyOwnership\`\n\n**Escenarios:**\n1. Sin JWT → **401**\n2. Token de usuario con \`id = 5\` intentando acceder a \`/users/99\` → **403**\n3. Admin o el propio usuario → **200**\n\n**Prueba:** Ingresa un ID diferente al ID del usuario autenticado para obtener 403.`,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description:
                "ID del usuario. Usa un ID diferente al tuyo para probar Ownership.",
            },
          ],
          responses: {
            200: { description: "Perfil del usuario — acceso concedido" },
            401: {
              description: "Sin JWT — autenticación requerida",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorUnauthorized" },
                },
              },
            },
            403: {
              description:
                "Acceso al perfil de otro usuario denegado — A01 Ownership verificado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorForbidden" },
                },
              },
            },
          },
        },
      },

      // ─── A03: SQL Injection ─────────────────────────────────────────
      "/users/email/{email}": {
        get: {
          tags: ["A03 — Inyección SQL"],
          summary: "Buscar usuario por email — probar con payloads de SQLi",
          description: `**Evidencia A03 — Consultas parametrizadas:**\n\nLa query ejecutada es:\n\`\`\`sql\nSELECT * FROM "user" WHERE email = $1\n\`\`\`\nEl valor del parámetro se pasa como \`[email]\`, nunca se concatena al SQL.\n\n**Payloads a probar:**\n- \`'; DROP TABLE "user"--\` → La tabla no se elimina; respuesta 404\n- \`' OR '1'='1\` → No se devuelven todos los registros\n\nVerificación en DB: \`SELECT query FROM pg_stat_activity;\` — mostrará el \`$1\` con el valor escapado.`,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "email",
              required: true,
              schema: { type: "string" },
              examples: {
                normal: {
                  summary: "Email válido",
                  value: "admin@smartur.com",
                },
                sqliDropTable: {
                  summary: "Ataque SQLi — DROP TABLE",
                  value: '\'; DROP TABLE "user"--',
                },
                sqliOrBypass: {
                  summary: "Ataque SQLi — OR '1'='1 (bypass)",
                  value: "' OR '1'='1",
                },
              },
            },
          ],
          responses: {
            200: { description: "Usuario encontrado — SQLi no tuvo efecto" },
            401: {
              description: "Sin JWT",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorUnauthorized" },
                },
              },
            },
            404: {
              description:
                "Usuario no encontrado — la tabla permanece intacta (SQLi mitigado)",
            },
          },
        },
      },
      "/users#search": {
        get: {
          tags: ["A03 — Inyección SQL"],
          summary:
            "Buscar usuarios con parámetro `search` — probar con payloads de SQLi",
          description: `**Evidencia A03 — ILIKE con placeholders:**\n\nLa query ejecutada es:\n\`\`\`sql\nWHERE (name ILIKE $1 OR email ILIKE $1)\n\`\`\`\n\n**Payloads a probar en el campo \`search\`:**\n- \`'; DROP TABLE "user"--\` → Respuesta normal, ninguna tabla eliminada\n- \`' UNION SELECT * FROM role--\` → No se devuelven datos de otras tablas\n\nEl input se pasa como \`['%<input>%']\`, nunca como SQL directo.`,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              examples: {
                normal: { summary: "Búsqueda normal", value: "admin" },
                sqliDropTable: {
                  summary: "Ataque SQLi — DROP TABLE",
                  value: '\'; DROP TABLE "user"--',
                },
                sqliUnion: {
                  summary: "Ataque SQLi — UNION SELECT",
                  value: "' UNION SELECT * FROM role--",
                },
              },
            },
            {
              in: "query",
              name: "page",
              schema: { type: "integer", default: 1 },
            },
            {
              in: "query",
              name: "limit",
              schema: { type: "integer", default: 10 },
            },
          ],
          responses: {
            200: { description: "Respuesta normal — SQLi no tuvo efecto" },
            401: {
              description: "Sin JWT",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorUnauthorized" },
                },
              },
            },
          },
        },
      },

      // ─── A04: Rate Limiting & Helmet ─────────────────────────────────
      "/login#ratelimit": {
        post: {
          tags: ["A04 — Hardening y Rate Limiting"],
          summary:
            "Verificar Rate Limiting — ejecutar 6 veces para obtener 429",
          description: `**Evidencia A04 — express-rate-limit:**\n\nConfiguración activa:\n\`\`\`js\nwindowMs: 1 * 60 * 1000,  // ventana de 1 minuto\nmax: 5                     // máximo 5 solicitudes por IP\n\`\`\`\n\n**Procedimiento:**\n1. Ejecuta este endpoint 6 veces consecutivas con credenciales incorrectas\n2. Intentos 1-5 → **400** (credenciales inválidas)\n3. Intento 6 → **429 Too Many Requests** — confirma el rate limit activo\n4. Espera 1 minuto y el contador se resetea\n\n**Cabeceras de seguridad (Helmet):** Revisa la sección "Response Headers" de cualquier respuesta:\n- \`X-Frame-Options: SAMEORIGIN\`\n- \`X-Content-Type-Options: nosniff\`\n- \`Strict-Transport-Security\`\n- \`X-Powered-By\` → **ausente**`,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
                examples: {
                  credencialesInvalidas: {
                    summary: "Credenciales inválidas — ejecuta 6 veces",
                    value: {
                      email: "test@smartur.com",
                      password: "passwordincorrecto",
                    },
                  },
                },
              },
            },
          },
          responses: {
            400: { description: "Intentos 1-5: credenciales incorrectas" },
            429: {
              description:
                "Intento 6 o más: Rate Limiting activo — A04 verificado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorRateLimit" },
                },
              },
            },
          },
        },
      },

      // ─── A09: Security Logging ────────────────────────────────────────
      "/security/events": {
        get: {
          tags: ["A09 — Registro de Seguridad"],
          summary:
            "Consultar eventos de seguridad registrados en la base de datos",
          description: `**Evidencia A09 — Registro persistente en PostgreSQL:**\n\nRequiere rol **Admin** (también evidencia A01).\n\nEjecuta primero los tests de las secciones anteriores para generar eventos. Luego consulta este endpoint para confirmar que los eventos fueron registrados por \`monitoringService.logSecurityEvent()\`.\n\n**Eventos esperados:**\n\n| Tipo | Severidad | Cuándo se registra |\n|---|---|---|\n| \`LOGIN_STEP1\` | INFO | Login con contraseña exitoso |\n| \`LOGIN_FAIL\` | WARN | Contraseña incorrecta |\n| \`MFA_DENIED\` | WARN | OTP incorrecto o expirado |\n| \`LOGIN_SUCCESS\` | INFO | MFA exitoso, JWT emitido |\n| \`PASSWORD_RESET_REQUEST\` | INFO | Solicitud de recuperación de contraseña |\n\nSi se visualizan estos registros, el control A09 está completamente verificado.`,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "limit",
              schema: { type: "integer", default: 20 },
              description:
                "Número de eventos a retornar (más recientes primero)",
            },
            {
              in: "query",
              name: "severity",
              schema: { type: "string", enum: ["INFO", "WARN", "ERROR"] },
              description: "Filtrar por nivel de severidad",
            },
          ],
          responses: {
            200: {
              description: "Lista de eventos de seguridad — A09 verificado",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/SecurityEvent" },
                  },
                },
              },
            },
            401: {
              description: "Sin JWT — autenticación requerida",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorUnauthorized" },
                },
              },
            },
            403: {
              description: "Rol insuficiente — se requiere Admin",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorForbidden" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const securitySwaggerSpec = swaggerJsdoc(securityOptions);

export { securitySwaggerSpec, swaggerUi };
