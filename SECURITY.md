# 🛡️ Seguridad API SMARTUR — Mitigaciones OWASP

Este documento describe las 5 vulnerabilidades OWASP Top 10 identificadas y mitigadas en la API, con referencias exactas a cada archivo y línea, la librería utilizada, los pasos de integración y cómo evidenciar que cada control funciona.

---

## A01 — Control de Acceso Roto (Broken Access Control)

### Descripción del problema

Sin controles de acceso, cualquier usuario puede acceder a recursos de otros usuarios (IDOR) o ejecutar operaciones administrativas sin tener el rol correcto. Todas las rutas de la API eran accesibles sin autenticación.

### Solución implementada: RBAC + Validación de Propiedad (Ownership)

#### Librería (Control de Acceso)

`jsonwebtoken` (ya instalada) — verifica el token JWT y extrae el payload con `id`, `email` y `role_id`.

#### Archivos creados

| Archivo | Función | Línea clave |
| --- | --- | --- |
| `middleware/authMiddleware.js` | `verifyToken` — verifica el JWT del header `Authorization: Bearer <token>` | Línea 17: `jwt.verify(token, process.env.JWT_SECRET)` |
| `middleware/rbacMiddleware.js` | `requireRole([roles])` — verifica que `req.user.role_id` esté en los roles permitidos | Línea 18: `!allowedRoles.includes(req.user.role_id)` |
| `middleware/ownershipMiddleware.js` | `verifyOwnership` — verifica que `req.params.id === req.user.id` (o admin) | Línea 23: `requesterId === resourceId` |

#### Fragmentos clave (Control de Acceso)

**`middleware/authMiddleware.js`**

```js
// Línea 17-22
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // { id, email, role_id }
```

**`middleware/rbacMiddleware.js`**

```js
// Línea 18-21
if (!allowedRoles.includes(req.user.role_id)) {
    return res.status(403).json({ message: 'Acceso prohibido...' });
}
```

**`middleware/ownershipMiddleware.js`**

```js
// Línea 23-26
if (isAdmin || requesterId === resourceId) {
    return next();
}
```

#### Aplicación en rutas

Todos los archivos en `routes/` fueron actualizados. Ejemplo en `routes/userRoutes.js`:

```js
// Línea 10: admin puede listar todos los usuarios
router.get('/users', verifyToken, requireRole([1]), UserController.getAll);
// Línea 13: solo el propio usuario o admin puede ver su perfil
router.get('/users/:id', verifyToken, verifyOwnership, UserController.getById);
```

La misma aplicación se replica en los 15 archivos de rutas restantes.

#### Pasos de integración (Control de Acceso)

1. Crear `middleware/authMiddleware.js` — importar `jwt`, leer header `Authorization`, llamar `jwt.verify`.
2. Crear `middleware/rbacMiddleware.js` — factory function que recibe `allowedRoles[]` y devuelve un middleware.
3. Crear `middleware/ownershipMiddleware.js` — comparar `req.user.id` con `parseInt(req.params.id)`.
4. En cada archivo de rutas: `import { verifyToken } from '../middleware/authMiddleware.js'`.
5. Colocar el middleware antes del controlador: `router.get('/ruta', verifyToken, requireRole([1]), controller)`.

#### Cómo evidenciar que funciona (Control de Acceso)

```bash
# 1. Sin token → 401
curl -X GET http://localhost:3000/api/v2/users

# 2. Con token de usuario normal intentando acceder a lista de usuarios → 403
curl -X GET http://localhost:3000/api/v2/users \
  -H "Authorization: Bearer <TOKEN_USUARIO_ROLE_2>"

# 3. Con token de admin → 200
curl -X GET http://localhost:3000/api/v2/users \
  -H "Authorization: Bearer <TOKEN_ADMIN_ROLE_1>"

# 4. Usuario intentando ver perfil de otro → 403
curl -X GET http://localhost:3000/api/v2/users/99 \
  -H "Authorization: Bearer <TOKEN_USUARIO_ID_5>"
```

---

## A02 — Fallas Criptográficas (Cryptographic Failures) → Autenticación Multifactor (MFA)

### Descripción del problema (Fallas Criptográficas)

Un sistema que solo valida usuario/contraseña es vulnerable si las credenciales son comprometidas. Adicionalmente, las contraseñas deben almacenarse con hashing robusto.

### Solución implementada: MFA con OTP por correo + bcrypt

#### Librerías (MFA)

- `bcrypt` — hashing de contraseñas con salt rounds
- `jsonwebtoken` — emisión de tokens firmados
- `nodemailer` — envío del código OTP al correo del usuario

#### Flujo de dos pasos (MFA)

**Paso 1 — Login con contraseña** (`POST /api/v2/login` → `serviceController.loginController`)

| Archivo | Línea | Fragmento |
| --- | --- | --- |
| `services/userService.js` | 62 | `const isMatch = await bcrypt.compare(password, user.password);` |
| `services/userService.js` | 67–72 | Generación del OTP: `String(Math.floor(100000 + Math.random() * 900000))` |
| `services/userService.js` | 74–78 | INSERT en `login_tokens` con `$1, $2, $3, $4` |
| `controllers/serviceController.js` | 56 | `await sendEmailVerification(email, result.data.verificationCode);` |

**Paso 2 — Validación del OTP** (`POST /api/v2/two-factor` → `serviceController.verifyTwoStepVerificationCodeController`)

| Archivo | Línea | Fragmento |
| --- | --- | --- |
| `services/userService.js` | 104–107 | SELECT del token con `WHERE user_id = $1 AND token = $2` |
| `services/userService.js` | 117 | `if (tokenRecord.used)` — previene reutilización |
| `services/userService.js` | 121 | `if (now > expiresAt)` — valida expiración (5 min) |
| `services/userService.js` | 130–137 | `jwt.sign({ id, email, role_id }, JWT_SECRET, { expiresIn: '24h' })` |

**Hashing de contraseñas (bcrypt)** (`models/userModel.js`)

```js
// Línea 75: hash al crear usuario
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); // SALT_ROUNDS = 10
// Línea 111: hash al actualizar contraseña
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```

#### Fragmentos clave (Ctrl+F)

```js
// services/userService.js — envío del OTP (en el controlador, línea 56)
await sendEmailVerification(email, result.data.verificationCode);

// services/userService.js — emisión del JWT
jwt.sign({ id, email, role_id }, process.env.JWT_SECRET, { expiresIn: '24h' })
```

#### Pasos de integración (MFA)

1. `userService.login()` genera OTP de 6 dígitos y lo inserta en `login_tokens` (expira en 5 min).
2. `serviceController.loginController` llama a `sendEmailVerification` con el OTP.
3. `utils/mailer.js` usa nodemailer con `EMAIL_USER`/`EMAIL_PASS` del `.env` para enviar el código.
4. El cliente llama a `POST /two-factor` con `{ email, token }`.
5. `userService.verifyTwoStepVerificationCode` valida token en DB, verifica `used = FALSE` y `expires_at > NOW()`.
6. Si válido: emite JWT firmado con `JWT_SECRET`.

#### Variables de entorno requeridas (MFA)

```env
JWT_SECRET=tu_secreto_muy_largo
EMAIL_USER=tu@gmail.com
EMAIL_PASS=tu_app_password_gmail
```

#### Cómo evidenciar que funciona (MFA)

```bash
# 1. Login — verifica contraseña y envía OTP al correo
curl -X POST http://localhost:3000/api/v2/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Password1"}'
# Respuesta: { "requiresVerification": true }
# → Revisar el correo del usuario, debe llegar el código de 6 dígitos

# 2. Verificar OTP
curl -X POST http://localhost:3000/api/v2/two-factor \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","token":"123456"}'
# Respuesta: { "token": "eyJ..." }

# 3. Verificar que el token sea reusable → 400 "Código ya fue usado"
# (Repetir el mismo request anterior)

# En la DB: SELECT * FROM login_tokens ORDER BY rowid DESC LIMIT 5;
# El campo used debe ser TRUE después de la verificación exitosa.
```

---

## A03 — Inyección (Injection)

### Descripción del problema (Inyección)

Las consultas SQL construidas con concatenación de strings permiten a un atacante inyectar comandos SQL arbitrarios (SQL Injection).

### Solución implementada: Consultas Parametrizadas con driver `pg`

#### Librería (Inyección SQL)

`pg` (node-postgres) — todas las consultas usan placeholders `$1`, `$2`, etc. El driver escapa automáticamente los valores, neutralizando cualquier intento de inyección.

#### Evidencia en modelos (Inyección)

| Archivo | Línea | Fragmento |
| --- | --- | --- |
| `models/userModel.js` | 57–59 | `WHERE user_id = $1`, `[user_id]` |
| `models/userModel.js` | 66 | `WHERE email = $1`, `[email]` |
| `models/userModel.js` | 77–82 | `VALUES ($1, $2, $3, $4)`, `[name, email, hashedPassword, role_id]` |
| `models/userModel.js` | 15–16 | ILIKE con `$1` (búsqueda dinámica segura) |
| `validators/userValidators.js` | 5 | `WHERE email = $1`, `[email]` |
| `services/userService.js` | 104–107 | `WHERE user_id = $1 AND token = $2` |

#### Fragmentos clave (Inyección)

```js
// models/userModel.js — búsqueda por ID (línea 56-60)
const result = await pool.query(
    `SELECT * FROM "user" WHERE user_id = $1`,
    [user_id]
);

// models/userModel.js — INSERT con parámetros (línea 77-82)
const result = await pool.query(
    `INSERT INTO "user" (name, email, password, role_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, hashedPassword, role_id]
);
```

#### Pasos de integración (Inyección)

1. Instalar `pg`: `npm install pg` (ya estaba instalado).
2. Crear el pool en `config/db.js` con `new Pool({ host, user, password, database, port })`.
3. En cada modelo, nunca concatenar input del usuario al SQL. Siempre usar `pool.query(sql, [params])`.
4. Para queries dinámicas con filtros opcionales (ej. `userModel.findAll`): construir `conditions[]` con `$${index}` y acumular valores en `values[]`.

#### Cómo evidenciar que funciona (Inyección)

```bash
# Intento de SQL Injection en el buscador de usuarios
curl -X GET "http://localhost:3000/api/v2/users?search='; DROP TABLE user--" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
# Resultado esperado: respuesta normal con lista de usuarios (vacía o con resultados)
# La tabla NO se elimina porque el input se pasa como parámetro, no concatenado.

# En PostgreSQL, activar logs y verificar la query ejecutada:
# SELECT query FROM pg_stat_activity WHERE query LIKE '%user%';
# Se verá: WHERE (name ILIKE $1 OR email ILIKE $1) con `$1 = '%''; DROP TABLE user--%'`
```

---

## A04 — Diseño Inseguro / Hardening (Security Misconfiguration)

### Descripción del problema (Hardening)

Sin cabeceras HTTP de seguridad, el API es vulnerable a clickjacking (X-Frame-Options), MIME sniffing, y expone la tecnología del servidor (`X-Powered-By: Express`). Sin rate limiting, las rutas de auth son vulnerables a fuerza bruta.

### Solución implementada: Helmet + Rate Limiting + npm audit

#### Librerías

- `helmet` — configura múltiples cabeceras HTTP de seguridad en una línea
- `express-rate-limit` — limita peticiones por IP en rutas sensibles

#### Helmet

| Archivo | Línea | Fragmento |
| --- | --- | --- |
| `index.js` | 32 | `app.use(helmet());` |
| `index.js` | 33 | `app.disable('x-powered-by');` |

**Cabeceras que activa `helmet()`:**

| Cabecera | Protección |
| --- | --- |
| `X-Frame-Options: SAMEORIGIN` | Previene clickjacking (Frameguard) |
| `X-Content-Type-Options: nosniff` | Previene MIME sniffing |
| `Strict-Transport-Security` | Fuerza HTTPS |
| `X-XSS-Protection: 0` | Desactiva XSS filter del navegador (reemplazado por CSP) |
| `Referrer-Policy: no-referrer` | Oculta referrer |
| `X-DNS-Prefetch-Control: off` | Limita prefetching |

#### Rate Limiting

| Archivo | Línea | Fragmento |
| --- | --- | --- |
| `index.js` | 50–58 | `rateLimit({ windowMs: 1 * 60 * 1000, max: 5 })` |
| `index.js` | 59 | `app.use('/api/v2/login', authLimiter)` |
| `index.js` | 60 | `app.use('/api/v2/two-factor', authLimiter)` |

```js
// index.js — Rate limiter (línea 50)

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 5,                    // máximo 5 intentos por IP
    message: { message: 'Demasiados intentos. Intenta de nuevo en 1 minuto.' }
});
```

#### npm audit (Vulnerabilidades)

Script disponible en `package.json`:

```json
"audit": "npm audit",
"audit:fix": "npm audit fix"
```

#### Pasos de integración (Hardening)

1. `npm install helmet express-rate-limit` (ambas ya instaladas).
2. En `index.js`, importar y aplicar `app.use(helmet())` antes de cualquier ruta.
3. Deshabilitar header de fingerprinting: `app.disable('x-powered-by')`.
4. Crear `rateLimit({ windowMs, max })` y aplicarlo con `app.use('/api/v2/login', authLimiter)`.
5. Ejecutar `npm audit` periódicamente; usar `npm audit fix` para parchear vulnerabilidades automáticamente.

#### Cómo evidenciar que funciona (Hardening)

```bash
# 1. Verificar cabeceras de seguridad
curl -I http://localhost:3000/api/v2/login
# Debe aparecer:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=15552000; includeSubDomains
# X-Powered-By: (ausente)

# 2. Verificar Rate Limiting — enviar 6 requests consecutivos
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/v2/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}';
done
# Primeros 5: 400 (credenciales inválidas)
# Sexto: 429 Too Many Requests

# 3. Revisar vulnerabilidades de dependencias
npm audit
```

---

## A09 — Registro de Seguridad y Fallas de Alerta (Security Logging and Monitoring Failures)

### Descripción del problema (Security Logging)

Sin registro de eventos de seguridad, los ataques pasan desapercibidos. No hay forma de detectar patrones de ataque ni generar alertas.

### Solución implementada: Registro persistente en PostgreSQL con monitoringService

#### Librería (Security Logging)

`pg` (driver de PostgreSQL) — los eventos se persisten en la tabla `security_events` de la base de datos, haciendo el registro durable y consultable.

#### Tabla de eventos (`security_events`)

```sql
-- bd.sql, línea 253
CREATE TABLE security_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,  -- LOGIN_ATTEMPT, LOGIN_FAILED, MFA_FAILED, etc.
  user_email VARCHAR(100),
  ip_address VARCHAR(50),
  severity VARCHAR(20) DEFAULT 'INFO', -- INFO, WARNING, ERROR
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Servicio de monitoreo

| Archivo | Línea | Descripción |
| --- | --- | --- |
| `services/monitoringService.js` | 3–13 | Función `logSecurityEvent(type, email, ip, severity)` |
| `services/monitoringService.js` | 6–8 | INSERT con `$1, $2, $3, $4` |

```js
// services/monitoringService.js — línea 3

export async function logSecurityEvent(type, email, ip, severity) {
    const query = `
        INSERT INTO security_events (event_type, user_email, ip_address, severity)
        VALUES ($1, $2, $3, $4)
    `;
    await pool.query(query, [type, email ?? null, ip ?? null, severity]);
}
```

#### Puntos de registro (`controllers/serviceController.js`)

| Línea | Evento | Severidad |
| --- | --- | --- |
| 21 | `PASSWORD_RESET_REQUEST` | INFO |
| 24 | `UNAUTHORIZED` (reset fallido) | WARN |
| 37 | `PASSWORD_RESET_SUCCESS` | INFO |
| 55 | `LOGIN_STEP1` (login exitoso paso 1) | INFO |
| 65 | `LOGIN_FAIL` | WARN |
| 82 | `MFA_DENIED` | WARN |
| 86 | `LOGIN_SUCCESS` | INFO |

#### Extracción de IP (Logging)

```js
// controllers/serviceController.js — línea 6
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.socket?.remoteAddress ?? req.ip ?? null;
}
```

#### Pasos de integración (Logging)

1. Crear tabla `security_events` en PostgreSQL ejecutando el DDL de `bd.sql` (línea 253–268).
2. `services/monitoringService.js` ya está implementado con `logSecurityEvent`.
3. En `controllers/serviceController.js`, importar: `import { logSecurityEvent } from '../services/monitoringService.js'`.
4. Llamar a `logSecurityEvent` en cada punto crítico del flujo de auth (login, MFA, reset).
5. Opcional: conectar Grafana a PostgreSQL y crear un dashboard con la query:

   ```sql
   SELECT date_trunc('hour', created_at) as tiempo, event_type, COUNT(*) 
   FROM security_events GROUP BY 1, 2 ORDER BY 1 DESC;
   ```

#### Cómo evidenciar que funciona (Logging)

```bash
# 1. Provocar un login fallido
curl -X POST http://localhost:3000/api/v2/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hacker@test.com","password":"wrong"}'

# 2. Consultar la tabla en PostgreSQL
psql -U <DB_USER> -d <DB_NAME> -c \
  "SELECT event_type, user_email, ip_address, severity, created_at 
   FROM security_events ORDER BY created_at DESC LIMIT 10;"

# Debe mostrar una fila con:
# event_type: LOGIN_FAIL | severity: WARN | user_email: hacker@test.com

# 3. Con Grafana:
#    - Fuente de datos: PostgreSQL (host, usuario, contraseña, DB)
#    - Panel: Time series con la query anterior
#    - Configurar alerta: si COUNT de LOGIN_FAIL > 10 en 5 min → alerta Slack/email
```

---

## Resumen de Archivos Modificados o Creados

| Archivo | Acción | Vulnerabilidad |
| --- | --- | --- |
| `middleware/authMiddleware.js` | **NUEVO** | A01, A07 |
| `middleware/rbacMiddleware.js` | **NUEVO** | A01 |
| `middleware/ownershipMiddleware.js` | **NUEVO** | A01 |
| `routes/userRoutes.js` | Modificado | A01 |
| `routes/serviceCertificationRoutes.js` | Modificado | A01 |
| `routes/evaluationDetailRoutes.js` | Modificado | A01 |
| `routes/evaluationTemplatesRoutes.js` | Modificado | A01 |
| `routes/criterionRoutes.js` | Modificado | A01 |
| `routes/serviceEvaluationRoutes.js` | Modificado | A01 |
| `routes/companyRoutes.js` | Modificado | A01 |
| `routes/locationRoutes.js` | Modificado | A01 |
| `routes/pointOfInterestRoutes.js` | Modificado | A01 |
| `routes/touristActivitiesRoutes.js` | Modificado | A01 |
| `routes/touristServicesRoutes.js` | Modificado | A01 |
| `routes/tourismEmploymentRoutes.js` | Modificado | A01 |
| `routes/tourismExpenditureRoutes.js` | Modificado | A01 |
| `routes/tourismInputsRoutes.js` | Modificado | A01 |
| `routes/travelerProfileRoutes.js` | Modificado | A01 |
| `services/userService.js` | Verificado/limpio | A02, A03 |
| `models/userModel.js` | Verificado (ya seguro) | A03 |
| `index.js` | Modificado (rate limit) | A04 |
| `bd.sql` | Modificado (security_events DDL) | A09 |
| `services/monitoringService.js` | Verificado (ya implementado) | A09 |
| `controllers/serviceController.js` | Verificado (ya implementado) | A02, A09 |
| `utils/mailer.js` | Verificado (ya implementado) | A02 |

## Variables de Entorno (Total)

```env
# Base de datos
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=smartur
DB_PORT=5432

# JWT
JWT_SECRET=cadena_secreta_larga_y_aleatoria

# Email (para MFA)
EMAIL_USER=tu@gmail.com
EMAIL_PASS=tu_google_app_password

# Redis (sesiones/caché)
REDIS_URL=redis://localhost:6379

# CORS
FRONTEND_URL=http://localhost:5173
```

## Dependencias de Seguridad (npm)

```bash
npm install           # instala todo desde package.json
npm audit             # revisa vulnerabilidades
npm audit fix         # parcela automáticamente vulnerabilidades corregibles
```

| Paquete | Versión | Uso de seguridad |
| --- | --- | --- |
| `helmet` | ^8.1.0 | Cabeceras HTTP |
| `express-rate-limit` | ^7.x | Rate limiting en auth |
| `bcrypt` | ^6.0.0 | Hashing de contraseñas |
| `jsonwebtoken` | ^9.0.2 | Firma y verificación JWT |
| `nodemailer` | ^7.0.9 | Envío OTP por correo |
| `pg` | ^8.16.3 | Queries parametrizadas |
