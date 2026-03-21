# API SMARTUR

## Seguridad

Este proyecto implementa mitigaciones para las vulnerabilidades **OWASP Top 10** más críticas:

| # | Vulnerabilidad | Control |
|---|---|---|
| A01 | Control de Acceso Roto | RBAC + validación de propiedad (JWT middleware) |
| A02 | Fallas Criptográficas | MFA con OTP por correo + bcrypt |
| A03 | Inyección SQL | Consultas parametrizadas con `pg` ($1, $2) |
| A04 | Diseño Inseguro / Hardening | `helmet` + `express-rate-limit` + `npm audit` |
| A09 | Registro y Monitoreo | `security_events` en PostgreSQL + Grafana |

 **[Ver documentación completa de seguridad → SECURITY.md](./SECURITY.md)**

---

## ⚡ Instalación y Configuración


1. **Clona el repositorio**
```zsh
git clone https://github.com/rmzX-dev/api-smartur
```

2. **Accede al proyecto**
```zsh
cd api-smartur
```

3. **Instala dependencias:**
```zsh
npm install
```

4. **Configura el entorno:** Crea un archivo `.env` en la raíz con:
```
PORT=3000
DB_HOST=localhost
DB_USER={tu usuario de postgres}
DB_PASSWORD={tu contraseña de postgres}
DB_NAME={base de datos}
DB_PORT=5432
JWT_SECRET={contraseña secreta}
FRONTEND_URL=http://localhost:5173,http://localhost:3000

EMAIL_USER=smarturutcv@gmail.com
EMAIL_PASS=lihichglnpzlhddg
```

> **Nota:** No modificar EMAIL_USER & EMAIL_PASS

5. **Configura la base de datos:**
   - Asegúrate de tener PostgreSQL instalado y corriendo
   - Crea una base de datos con el nombre que especificaste en el archivo `.env`
   - Ejecuta el archivo `bd.sql` ubicado en la raíz del proyecto:

**Opción 1 - Desde psql (recomendado):**
```zsh
psql -U {tu_usuario} -d {nombre_base_datos} -f bd.sql
```

**Opción 2 - Desde pgAdmin:**
   - Abre pgAdmin y conéctate a tu servidor
   - Haz clic derecho sobre la base de datos creada y selecciona "Query Tool"
   - Abre y ejecuta el archivo `bd.sql`
   - Para monitoreo de seguridad, ejecuta también: `database/setup_logs.sql` en la misma base de datos.

6. **Opcional - Grafana (monitoreo de eventos de seguridad):**
   - Levanta Grafana: `docker compose up -d grafana`
   - Accede a http://localhost:3001 (usuario/contraseña por defecto: admin/admin)
   - Añade PostgreSQL como Data Source con las credenciales de tu `.env` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT)
   - Crea un panel Time Series con la query: `SELECT event_time AS "time", count(*) AS "Intentos Fallidos" FROM security_events WHERE event_type = 'LOGIN_FAIL' GROUP BY 1 ORDER BY 1`

7. **Inicia el servidor:**
```zsh
node index.js
```

#### 🔄 Flujo de Desarrollo

Para contribuir al proyecto, sigue estos pasos:

1. **Crea una rama nueva:**
```zsh
git checkout -b feature/nombre-de-tu-feature
```
o
```zsh
git checkout -b fix/descripcion-del-fix
```

2. **Realiza tus cambios y haz commit:**
```zsh
git add .
git commit -m "Descripción clara de los cambios"
```

3. **Sube tu rama al repositorio:**
```zsh
git push origin feature/nombre-de-tu-feature
```

4. **Crea un Pull Request:**
   - Ve al repositorio en GitHub
   - Haz clic en "Compare & pull request"
   - Describe los cambios realizados
   - Espera la revisión del código

> **Nota:** No hagas commits directamente a la rama `main`. Siempre crea una rama nueva para tus features o fixes.