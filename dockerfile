# Base stage for installing pnpm and dependencies
FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and package.json to leverage Docker caching
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
COPY . .
RUN pnpm run build

# Producción: nginx sirve los estáticos (escucha en 80 dentro del contenedor)
FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]