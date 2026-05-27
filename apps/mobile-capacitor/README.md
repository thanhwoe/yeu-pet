# YeuPet — Capacitor (React)

Rebuild of the YeuPet mobile app using **React + Capacitor + Tailwind + daisyUI**.

The original Expo app remains at [`../mobile`](../mobile).

## Documentation

- **[CHECKLIST.md](./CHECKLIST.md)** — detailed done / not done tasks (update as you build)
- **[MIGRATION_PLAN.md](./MIGRATION_PLAN.md)** — scope, routes, API map, phases
- **[AGENTS.md](./AGENTS.md)** — quick reference for AI agents

## Setup

```bash
# From monorepo root
pnpm install
cp apps/mobile-capacitor/.env.example apps/mobile-capacitor/.env
```

## Development

```bash
# Web dev server (port 5174)
pnpm --filter @yeu-pet/mobile-capacitor dev
```

## Native (first-time)

```bash
cd apps/mobile-capacitor
pnpm build
pnpm exec cap add ios      # macOS only
pnpm exec cap add android
pnpm cap sync
pnpm cap:open:ios
pnpm cap:open:android
```

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_APP_VARIANT` | `development` \| `preview` \| `production` |
