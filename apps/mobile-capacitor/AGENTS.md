# AI Agent Guide — `apps/mobile-capacitor`

## Read first

1. **[CHECKLIST.md](./CHECKLIST.md)** — **primary tracker**: done / not done per task (update as you ship).
2. **[MIGRATION_PLAN.md](./MIGRATION_PLAN.md)** — scope, routes, API map, phases.
3. **[src/features/README.md](./src/features/README.md)** — feature folders in scope vs deferred.
4. **Legacy reference:** [`apps/mobile/`](../mobile/) — port behavior from here where applicable.
5. **Sitter API (no Expo UI):** [`apps/api/src/modules/sitter-bookings/`](../api/src/modules/sitter-bookings/), [`pet-sitters/`](../api/src/modules/pet-sitters/).

## Stack

React 19 · Vite · Capacitor 7 · TanStack Router · TanStack Query · Zustand · Tailwind · daisyUI · Axios

## Paths

| Purpose | Location |
|---------|----------|
| Routes | `src/routes/` (file-based; `routeTree.gen.ts` is generated) |
| Features | `src/features/<domain>/` |
| API client | `src/shared/api/apiClient.ts` |
| API routes | `src/shared/api/apiRoutes.ts` (sync with `apps/mobile/constants/api-routes.ts`) |
| Auth store | `src/shared/stores/userStore.ts` |
| Env | `src/shared/env.ts`, `.env.example` |

## Commands

```bash
pnpm --filter @yeu-pet/mobile-capacitor dev
pnpm --filter @yeu-pet/mobile-capacitor build
```

## Rules

- Do **not** delete or refactor `apps/mobile` as part of Capacitor work.
- Mark completed items in **CHECKLIST.md** (⬜ → ✅).
- Do **not** build store, clinics, spas, training, doctor AI, or VNPay unless asked.
- Match API/auth behavior from `apps/mobile/services/api-helper.ts`.
- Use daisyUI components; keep mobile-safe areas (`env(safe-area-inset-*)` in `index.css`).
