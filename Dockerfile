# ========== Base común ==========
FROM node:22-alpine AS base
WORKDIR /app

# Dependencias básicas para algunas libs nativas
RUN apk add --no-cache libc6-compat

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

# ========== Etapa de dependencias ==========
FROM base AS deps

# Copiamos solo archivos de dependencias para aprovechar cache
COPY package.json pnpm-lock.yaml ./

# Instala todas las dependencias necesarias para el build
RUN pnpm install --frozen-lockfile

# ========== Etapa de build ==========
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

# ========== Etapa de runtime (imagen final, ligera) ==========
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Usuario no root
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001

# Copiamos solo lo necesario para correr la app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

# server.js lo genera Next dentro de .next/standalone
CMD ["node", "server.js"]