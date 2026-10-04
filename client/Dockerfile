# --- Build Stage ---
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.8.0 --activate
WORKDIR /app

# Copy workspace configs
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json ./client/
COPY shared/package.json ./shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY shared ./shared
COPY client ./client

# Build the Vite app
WORKDIR /app/client
RUN pnpm run build

# --- Production Stage ---
FROM caddy:2-alpine

# Copy built static files from builder
COPY --from=builder /app/client/dist /var/www/html

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443
