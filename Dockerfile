# ========== Base común ==========
FROM node:22-alpine AS base
WORKDIR /app

# Dependencias básicas para algunas libs nativas
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

# ========== Etapa de dependencias ==========
FROM base AS deps

# Copiamos solo archivos de dependencias para aprovechar cache
COPY package.json package-lock.json ./

# Instala todas las dependencias necesarias para el build
RUN npm ci

# ========== Etapa de build ==========
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

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