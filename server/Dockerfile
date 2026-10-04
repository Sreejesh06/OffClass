# --- Build Stage ---
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.8.0 --activate
WORKDIR /app

# Copy workspace config and package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install ALL dependencies (needed for compilation)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY shared ./shared
COPY server ./server

WORKDIR /app/server
# Generate Prisma client and compile TypeScript to JavaScript
RUN npx prisma generate
RUN pnpm run build


# --- Production Stage ---
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.8.0 --activate
WORKDIR /app

# Copy only the necessary package configs
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install ONLY production dependencies
RUN pnpm install --filter server... --prod --frozen-lockfile

# Copy compiled code and prisma schema
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma

WORKDIR /app/server

# Generate production Prisma client securely without keeping the CLI in node_modules
RUN pnpm dlx prisma@6.19.3 generate

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
