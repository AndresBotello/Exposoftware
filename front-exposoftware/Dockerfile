# syntax=docker/dockerfile:1.7

# ============================================================
# Stage 1: Build de la app con Node
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias usando solo manifests para aprovechar cache
COPY package.json package-lock.json ./
RUN rm -f package-lock.json && npm install --no-audit --no-fund

# Copiar el resto del código y construir
COPY . .

# La URL de la API se inyecta en tiempo de build (Vite la "congela" en el bundle).
# Default vacio = mismo origen (URLs relativas tipo /api/...). Esto resuelve cookies en
# Safari iOS y otros moviles que bloquean cookies cross-site.
# Para forzar otro dominio, override con --build-arg VITE_API_BASE_URL=https://...
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ============================================================
# Stage 2: Imagen final con Nginx solo sirviendo estáticos
# ============================================================
FROM nginx:1.27-alpine AS runtime

# Reemplazar la config por defecto por la nuestra (SPA + headers + cache)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copiar el build de Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Healthcheck simple: que Nginx responda en /
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
