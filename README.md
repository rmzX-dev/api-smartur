# API — SMARTUR

Node.js/Express 5 REST API for the SMARTUR tourism platform. Runs on port 4000, serves all dashboard and mobile clients.

## Quick start (Docker)

```bash
# From repo root — starts API + all dependencies
docker compose up -d

# Rebuild only the API container
docker compose build api && docker compose up -d api

# Watch logs
docker logs -f smartur-api
```

## Local development (without Docker)

```bash
cd API
npm install
# Copy .env.example to .env and fill values
cp .env.example .env
node index.js
```

## Environment variables

```env
PORT=4000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=smartur
DB_PORT=5432
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173,http://localhost:4321
EMAIL_USER=smarturutcv@gmail.com
EMAIL_PASS=...
MODELO_URL=http://modelo:8000
```

## Database

Schema lives entirely in `bd.sql` — no separate migration files.

```bash
# Apply schema to local Docker container
Get-Content "bd.sql" | docker exec -i smartur-postgres psql -U postgres -d smartur

# Apply to production VPS
ssh root@2.24.112.25 "docker exec -i smartur-postgres psql -U postgres -d smartur" < bd.sql
```

**Any DB change must be applied to all three targets simultaneously**: local Docker, VPS, and `bd.sql`.

## API routes

All routes are mounted under `/api/v2/`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | public | Login, returns JWT |
| POST | `/auth/register` | public | Register new user |
| POST | `/auth/verify-otp` | public | 2FA OTP verification |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users` | admin | List all users |
| GET | `/users/:id` | token | Get user by ID |
| PATCH | `/users/:id` | token | Update user |
| DELETE | `/users/:id` | admin | Delete user |

### Companies

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/companies` | token | List companies |
| POST | `/companies` | token | Create company |
| PATCH | `/companies/:id` | token | Update company |
| DELETE | `/companies/:id` | token | Delete company |

### Tourist Services

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tourist-services` | token | List tourist services |
| POST | `/tourist-services` | token | Create service |
| PATCH | `/tourist-services/:id` | token | Update service |
| DELETE | `/tourist-services/:id` | token | Delete service |

### Points of Interest (POI)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/points-of-interest` | token | List POIs |
| POST | `/points-of-interest` | token | Create POI |
| PATCH | `/points-of-interest/:id` | token | Update POI |
| DELETE | `/points-of-interest/:id` | token | Delete POI |

### Contacts & Subscriptions

Contact submissions are stored in the DB only — no email notifications are sent. Managed from the PLATAFORMA dashboard.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/contact` | public | Submit contact form |
| GET | `/contact-subscriptions` | token | List contacts (paginated) |
| PATCH | `/contact-subscriptions/:id/status` | token | Update status (pending/in_progress/done/dismissed) |
| DELETE | `/contact-subscriptions/:id` | token | Delete contact |

### ML Data Collection

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/me/interactions` | token | Batch implicit events (dwell, detail_open, skip, filter_click) |
| POST | `/me/rating` | token | Upsert explicit star rating 1–5 |
| GET | `/recommendations/:userId` | token | Proxy to MODELO with session logging |
| GET | `/ml/health` | token | Model metrics + session stats + CTR for dashboard |

### Community

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/community-posts` | token | List community posts (paginated) |
| DELETE | `/community-posts/:id` | token | Delete post |

### Dashboard & Statistics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard/stats` | token | Platform-wide KPIs |
| GET | `/statistics/*` | token | Tourism statistics endpoints |

## Security

| OWASP | Control |
|-------|---------|
| A01 Broken Access Control | RBAC + JWT middleware (`verifyToken`) |
| A02 Cryptographic Failures | bcrypt password hashing, OTP via email for 2FA |
| A03 SQL Injection | Parameterized queries (`pg` library, `$1, $2, ...`) |
| A04 Insecure Design | `helmet`, `express-rate-limit`, nginx rate limiting |
| A09 Logging & Monitoring | `security_events` table in PostgreSQL, Grafana dashboard |

## Project structure

```
API/
├── bd.sql              # Complete DB schema (single source of truth)
├── index.js            # Express app entry point, route mounts
├── routes/             # Route handlers
├── middleware/         # authMiddleware.js, rateLimiter
├── controllers/        # Business logic
├── models/             # DB query helpers
├── services/           # External integrations (mailer, etc.)
├── utils/              # Shared utilities
├── validators/         # Input validation
├── config/
│   └── db.js           # PostgreSQL pool
├── docs/               # Swagger spec
│   └── swagger.js
├── Dockerfile
└── .env.example
```

## Swagger docs

Available at `http://localhost:4000/api-docs` when running locally.
