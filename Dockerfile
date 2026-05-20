# ============================================================
# Dockerfile — api-smartur
# Node.js 22 Alpine (ligero y seguro)
# ============================================================

# ── Etapa 1: Dependencias ──────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copiar solo manifiestos para aprovechar cache de capas
COPY package.json package-lock.json* ./

# Instalar solo dependencias de producción.
# Nota: `npm ci` requiere que `package.json` y `package-lock.json` estén perfectamente sincronizados,
# y este proyecto parece manejar `pnpm-lock.yaml`. Usamos `npm install` para evitar fallos de build.
RUN npm install --omit=dev

# ── Etapa 2: Imagen Final ──────────────────────────────────
FROM node:22-alpine AS runner

# Instalar curl para healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 apiuser

# Copiar módulos desde etapa deps
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=apiuser:nodejs . .

# Cambiar al usuario sin privilegios
USER apiuser

# Puerto expuesto (debe coincidir con PORT en .env)
EXPOSE 3000

# Healthcheck: verifica que la API responde
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "index.js"]
