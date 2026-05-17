# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace config files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package.json for each workspace package
COPY apps/api/package.json apps/api/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json

# Copy shared packages source (needed before install so pnpm can link them)
COPY packages ./packages

# Install all dependencies (frozen lockfile for reproducibility)
# This creates proper workspace symlinks
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build the application
# ============================================
FROM deps AS builder

# Copy root config files
COPY tsconfig.json turbo.json ./

# Copy API source code
COPY apps/api ./apps/api

# Generate Prisma client and build the API
WORKDIR /app/apps/api
RUN npx prisma generate
RUN pnpm build

# ============================================
# Stage 3: Create production package
# ============================================
FROM builder AS deployer

WORKDIR /app

RUN pnpm --filter @yeu-pet/api deploy --prod /prod/api

# ============================================
# Stage 4: Production runner
# ============================================
FROM node:22-alpine AS runner

RUN apk add --no-cache wget

WORKDIR /app

# Copy isolated production package with app-local pnpm node_modules
COPY --from=deployer /prod/api ./

# Copy compiled output after deploy because dist is not part of the source package
COPY --from=builder /app/apps/api/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
