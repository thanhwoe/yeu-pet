# YeuPet Mobile — Capacitor Rebuild Migration Plan

> **Audience:** AI agents and developers continuing this work.  
> **Legacy app (unchanged):** [`apps/mobile`](../mobile/) (Expo SDK 53 + Expo Router)  
> **New app (this package):** [`apps/mobile-capacitor`](./) (React + Vite + Capacitor 7 + TanStack Router + Tailwind + daisyUI)  
> **Detailed checklist (done / not done):** [**CHECKLIST.md**](./CHECKLIST.md) ← **update this as you ship features**

---

## 1. Goals (revised scope)

1. Implement the **in-scope feature set** defined in [CHECKLIST.md § Product scope](./CHECKLIST.md#product-scope-current) — not full Expo parity.
2. **Keep** `apps/mobile` running until Capacitor app is ready.
3. **Mobile-only:** iOS + Android (no PWA).
4. **Sitter booking** replaces the **Store** tab for this phase (backend API already exists).
5. **Subscription** UI reads tier from user profile; payment/upgrade API to be added later if missing.

### In scope

Authentication · Onboarding · Home · Reminders · Services hub · Budget · Photos · Settings · Medical records · **Sitter booking** · **Subscription**

### Explicitly out of scope (for now)

Store (catalog/cart/checkout) · Clinics/spas · Training · Doctor AI · VNPay/payments

---

## 2. Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19, Tailwind CSS 3, daisyUI |
| Routing | TanStack Router (`src/routes/`) |
| Server state | TanStack Query |
| Client state | Zustand + persist |
| HTTP | Axios (`src/shared/api/apiClient.ts`) |
| Native | Capacitor 7 |
| Build | Vite → `dist/` → `cap sync` |

---

## 3. Repository layout

```
apps/mobile-capacitor/
├── CHECKLIST.md           ← task-level done/not done (primary tracker)
├── MIGRATION_PLAN.md      ← this file (strategy + routes)
├── AGENTS.md
├── src/
│   ├── routes/
│   ├── features/          ← auth, home, sitter-booking, subscription, …
│   └── shared/api/
```

---

## 4. Route map (planned)

### Auth & onboarding

| Route | Feature |
|-------|---------|
| `/auth/welcome` | Auth welcome |
| `/login` | Login (stub exists) |
| `/auth/register` | Register |
| `/auth/forgot-password` | Forgot password |
| `/auth/reset-password/$phone` | Reset password |
| `/verify-otp` | OTP verification |
| `/onboarding` | Onboarding carousel |

### Tabs (`/tabs/*`)

| Route | Feature | Notes |
|-------|---------|-------|
| `/tabs/home` | Home | Pets, reminders snippet, budget stats |
| `/tabs/reminders` | Reminders | Calendar |
| `/tabs/services` | Services hub | Links to budget, photos, medical, sitter, subscription |
| `/tabs/settings` | Settings | Profile, logout, subscription link |
| ~~`/tabs/store`~~ | — | **Removed** — use sitter booking instead |

### Feature stacks

| Route | Feature |
|-------|---------|
| `/budget`, `/budget/categories`, `/budget/transactions` | Budget |
| `/medical-records`, `/medical-records/$id`, `/medical-records/pet/$petId` | Medical records |
| `/photos` | Photos social |
| `/sitters`, `/sitters/$id`, `/sitters/register`, `/sitters/me` | Sitter discovery & profile |
| `/bookings`, `/bookings/sitter`, `/bookings/$id` | Sitter bookings |
| `/subscription` | Subscription tier & upgrade (UI) |

### Deferred (do not add routes yet)

`/products/*`, `/cart`, `/checkout`, `/shipping-address`, `/list-clinic`, `/list-spa`, `/training/*`, `/doctor-ai`, payment return handlers

---

## 5. API reference

### 5.1 Ported from Expo

- Routes: [`apps/mobile/constants/api-routes.ts`](../mobile/constants/api-routes.ts) → [`src/shared/api/apiRoutes.ts`](./src/shared/api/apiRoutes.ts)
- Client: [`apps/mobile/services/api-helper.ts`](../mobile/services/api-helper.ts) → [`src/shared/api/apiClient.ts`](./src/shared/api/apiClient.ts)

### 5.2 Sitter booking (backend only — add to mobile client)

| Method | Path | Controller |
|--------|------|------------|
| `GET` | `/sitters` | [`pet-sitters.controller.ts`](../api/src/modules/pet-sitters/pet-sitters.controller.ts) |
| `GET` | `/sitters/me` | same |
| `GET` | `/sitters/:id` | same |
| `POST` | `/sitters/register` | same |
| `PATCH` | `/sitters/:id` | same |
| `POST` | `/sitter-bookings` | [`sitter-bookings.controller.ts`](../api/src/modules/sitter-bookings/sitter-bookings.controller.ts) |
| `GET` | `/sitter-bookings` | same |
| `GET` | `/sitter-bookings/sitter` | same |
| `GET` | `/sitter-bookings/:id` | same |
| `PATCH` | `/sitter-bookings/:id/confirm` | same |
| `PATCH` | `/sitter-bookings/:id/reject` | same |
| `PATCH` | `/sitter-bookings/:id/complete` | same |
| `PATCH` | `/sitter-bookings/:id/cancel` | same |
| `POST` | `/sitter-reviews` | [`sitter-reviews.controller.ts`](../api/src/modules/sitter-reviews/sitter-reviews.controller.ts) |
| `GET` | `/sitter-reviews/:sitterId` | same |

### 5.3 Subscription

- **Fields on user:** `subscription` (`free` \| `premium`), `subscriptionExpiresAt` — see [`apps/mobile/interfaces/user.ts`](../mobile/interfaces/user.ts)
- **Source:** `GET /users/me`, login response — [`auth.service.ts`](../api/src/modules/auth/auth.service.ts)
- **TODO:** Confirm with backend if purchase/upgrade endpoints will be added; until then build **read-only** subscription screen + placeholder upgrade CTA.

---

## 6. Native capabilities (in-scope only)

| Need | Capacitor plugin | Used by |
|------|------------------|---------|
| Token persist (temp) | `@capacitor/preferences` | Auth |
| Camera / gallery | `@capacitor/camera` | Photos, medical attachments |
| Save files | `@capacitor/filesystem` | Medical record downloads |
| Push | `@capacitor/push-notifications` | Settings / device register |
| Haptics | `@capacitor/haptics` | Tab bar |
| Browser | `@capacitor/browser` | External links |

**Not needed in current scope:** VNPay deep links, location (was clinics/spas)

---

## 7. Implementation phases (revised)

### Phase 0 — Bootstrap ✅

- [x] Vite, Tailwind, daisyUI, TanStack Router/Query, Capacitor deps
- [x] `apiClient`, `userStore`, stub `/` and `/login`
- [x] `CHECKLIST.md` + this plan

### Phase 1 — Foundation

- [ ] Route guards (auth → OTP → onboarding)
- [ ] Auth + onboarding screens
- [ ] `queryKeys.ts`, shared UI, `getErrorMessage`

### Phase 2 — Core tabs

- [ ] Tab layout (**home, reminders, services, settings** — no store tab)
- [ ] Home, reminders, settings

### Phase 3 — Services + health

- [ ] Services hub (medical, budget, photos, sitter, subscription cards only)
- [ ] Budget, medical records, photos

### Phase 4 — Sitter booking

- [ ] Full sitter + booking flows (§K in CHECKLIST)

### Phase 5 — Subscription

- [ ] Tier display + `/subscription` screen
- [ ] Upgrade flow when payment API is available

### Phase 6 — Release

- [ ] Secure storage, push registration, native flavors, CI

---

## 8. Commands

```bash
pnpm --filter @yeu-pet/mobile-capacitor dev
pnpm --filter @yeu-pet/mobile-capacitor build
```

See [README.md](./README.md).

---

## 9. Conventions for AI agents

1. **Update [CHECKLIST.md](./CHECKLIST.md)** when completing tasks (change ⬜ → ✅).
2. Do **not** implement deferred features (§N in checklist) unless the user asks.
3. Do **not** modify `apps/mobile` except to sync shared API constants.
4. **Sitter booking** has no Expo UI — design mobile-first with daisyUI; follow API DTOs in `apps/api`.

---

*Strategy doc — task status lives in CHECKLIST.md.*
