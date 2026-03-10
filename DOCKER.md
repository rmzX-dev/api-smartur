# 🐳 Docker — api-smartur

Guía para levantar, desarrollar y mantener el proyecto con Docker.

---

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) `>= 24`
- `docker-compose` (versión standalone) **o** Docker Desktop con el plugin `compose`

---

## Servicios

| Servicio   | Imagen                   | Puerto host | Descripción             |
| ---------- | ------------------------ | ----------- | ----------------------- |
| `api`      | `api-smartur` (local)    | `3000`      | API Node.js (Express)   |
| `postgres` | `postgres:16-alpine`     | `5433`      | Base de datos principal |
| `redis`    | `redis:7-alpine`         | `6380`      | Caché y sesiones 2FA    |
| `grafana`  | `grafana/grafana:latest` | `3001`      | Monitoreo y dashboards  |

> Los puertos del host (`5433`, `6380`) están desplazados para evitar conflictos con instancias locales de PostgreSQL y Redis. Internamente la red Docker usa los puertos estándar (`5432`, `6379`).

---

## Primeros pasos

### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores reales (credenciales de DB, JWT secret, email, etc.).

### 2. Levantar todos los servicios

```bash
docker-compose up -d --build
```

La primera vez:

- Descarga las imágenes de Docker Hub
- Construye la imagen de la API
- Inicializa la base de datos ejecutando `bd.sql` automáticamente

### 3. Verificar que todo esté corriendo

```bash
docker-compose ps
```

Todos los servicios deben mostrar el estado `healthy` o `running`.

---

## Comandos del día a día

### Ver logs

```bash
# Logs en tiempo real de la API
docker-compose logs -f api

# Logs de PostgreSQL
docker-compose logs -f postgres

# Todos los servicios a la vez
docker-compose logs -f
```

### Aplicar cambios de código

```bash
# Después de modificar archivos JS/routes/controllers/etc.
docker-compose up -d --build api
```

### Reiniciar un servicio

```bash
docker-compose restart api
```

### Detener todo

```bash
# Detiene los contenedores (conserva datos)
docker-compose stop

# Detiene y elimina contenedores (conserva volúmenes/datos)
docker-compose down
```

---

## Casos frecuentes

### Cambié el `.env`

```bash
docker-compose restart api
```

### Cambié el `docker-compose.yml`

```bash
docker-compose up -d
```

### Cambié el schema (`bd.sql`)

> ⚠️ El SQL de inicialización solo se ejecuta cuando el volumen de postgres **no existe**. Para re-aplicarlo hay que volver a crearlo desde cero.

```bash
# ⚠️ Elimina todos los datos de la BD
docker-compose down -v
docker-compose up -d
```

---

## Desarrollo local (sin reconstruir imagen)

Si estás iterando mucho en el código, es más cómodo correr la API directamente en tu máquina y solo usar Docker para la BD y Redis:

```bash
# 1. Levantar solo los servicios de infraestructura
docker-compose up -d postgres redis

# 2. Correr la API localmente con hot-reload
npm run dev
```

> Recuerda que en este modo la API usa `DB_HOST=localhost` y `REDIS_URL=redis://localhost:6379` (tus valores del `.env` local).

---

## Accesos

| Servicio      | URL                                 |
| ------------- | ----------------------------------- |
| API           | http://localhost:3000               |
| Swagger Docs  | http://localhost:3000/api-docs      |
| Security Docs | http://localhost:3000/security-docs |
| Health Check  | http://localhost:3000/health        |
| Grafana       | http://localhost:3001               |

Credenciales de Grafana por defecto: `admin / admin`

---

## Health Checks

Todos los servicios tienen health checks configurados. Docker espera a que cada servicio esté sano antes de iniciar los servicios que dependen de él:

```
postgres (healthy) ─┐
                    ├──► api (healthy)
redis    (healthy) ─┘
```

---

## Limpieza completa

```bash
# Eliminar contenedores, volúmenes e imágenes del proyecto
docker-compose down -v
docker image rm api-smartur-api
```
