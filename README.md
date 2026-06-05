# Yeu Pet - Monorepo

A monorepo built with Turborepo and pnpm, containing:

- **API**: NestJS backend with Prisma, PostgreSQL, Redis, Firebase Admin
- **Mobile**: React Native Expo app

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Setup

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev:api    # Start API server
pnpm dev:mobile # Start Expo mobile app
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all apps in dev mode |
| `pnpm dev:api` | Run only API |
| `pnpm dev:mobile` | Run only mobile |
| `pnpm build` | Build all apps |
| `pnpm build:api` | Build only API |
| `pnpm build:mobile` | Build only mobile |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run tests |
| `pnpm clean` | Clean all builds and node_modules |

## Project Structure

```
yeu-pet/
├── apps/
│   ├── api/          # NestJS backend
│   └── mobile/       # React Native app
├── packages/
│   ├── tsconfig/     # Shared TypeScript configs
│   └── eslint-config/# Shared ESLint configs
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

## Development

### API

The API uses NestJS with Prisma for database access. Key features:

- PostgreSQL database
- Redis caching
- Firebase Admin SDK
- JWT authentication
- BullMQ for background jobs

### Mobile

The mobile app uses React Native with Expo. Key features:

- Expo Router for navigation
- React Query for data fetching
- Zustand for state management
- NativeWind for styling

## Documentation

Use [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) as the entry point for project docs, active implementation trackers, and mobile refactor references.

## Docker

```bash
# Start all services
pnpm docker:up

# Stop services
pnpm docker:down

# Build images
pnpm docker:build
```

## License

UNLICENSED
