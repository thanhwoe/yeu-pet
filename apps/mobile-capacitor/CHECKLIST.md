# YeuPet Capacitor — Implementation Checklist

> **For AI agents:** Update status as you complete work. Use: `✅` done · `🟡` in progress · `⬜` not started · `⏸️` deferred (out of current scope)  
> **Last updated:** 2026-05-27

---

## Product scope (current)

### In scope (build now)

| Feature | Replaces / notes |
|---------|------------------|
| Authentication | Port from Expo |
| Onboarding | Port from Expo |
| Home | Port from Expo |
| Reminders | Port from Expo |
| Services hub | Launcher only — **no** store / clinic / spa / training / AI cards |
| Budget | Port from Expo |
| Photos | Port from Expo |
| Settings | Port from Expo |
| Medical records | Port from Expo |
| **Sitter booking** | **New** — API exists on backend; **replaces Store tab** for now |
| **Subscription** | User tier from API (`free` / `premium`); UI + upgrade flow TBD |

### Deferred (do not implement until requested)

| Feature | Reason |
|---------|--------|
| Store (catalog, cart, checkout, shipping) | Explicitly postponed |
| Clinics / spas | Removed from current scope |
| Training | Removed from current scope |
| Doctor AI | Removed from current scope |
| VNPay / payments | Removed from current scope |

---

## A. Infrastructure & foundation

| ID | Task | Status | Notes / files |
|----|------|--------|----------------|
| A1 | Monorepo package `@yeu-pet/mobile-capacitor` | ✅ | `package.json` |
| A2 | Vite + React 19 + TypeScript | ✅ | `vite.config.ts` |
| A3 | Tailwind CSS + daisyUI theme | ✅ | `tailwind.config.ts`, `src/index.css` |
| A4 | TanStack Router (file routes) | ✅ | `src/routes/`, `src/routeTree.gen.ts` |
| A5 | TanStack Query provider | ✅ | `src/app/queryClient.ts`, `providers.tsx` |
| A6 | Axios `apiClient` (Bearer + camelCase + refresh) | ✅ | `src/shared/api/apiClient.ts` |
| A7 | `apiRoutes.ts` (Expo-aligned + sitter routes) | 🟡 | `src/shared/api/apiRoutes.ts` — sitter routes added; sync ongoing |
| A8 | `userStore` + Preferences persistence | ✅ | `src/shared/stores/userStore.ts` |
| A9 | Env config (`VITE_API_URL`, `VITE_APP_VARIANT`) | ✅ | `src/shared/env.ts`, `.env.example` |
| A10 | Capacitor config (variants → appId) | ✅ | `capacitor.config.ts` |
| A11 | Capacitor plugins in dependencies | ✅ | `package.json` — not all wired in UI yet |
| A12 | `queryKeys.ts` factory | ⬜ | Port from `apps/mobile/constants/query-keys.ts` |
| A13 | Route guards (auth → OTP → onboarding) | ⬜ | Mirror `apps/mobile/app/_layout.tsx` |
| A14 | Shared UI primitives (toast, modal, sheet, form) | ⬜ | daisyUI + small wrappers |
| A15 | `getErrorMessage()` helper | ⬜ | Normalize API errors for UI |
| A16 | Secure token storage (production) | ⬜ | Replace Preferences for tokens |
| A17 | Native projects (`cap add ios/android`) | ⬜ | Run locally after clone |
| A18 | CI workflow for Capacitor build | ⬜ | See `MIGRATION_PLAN.md` §8 |
| A19 | iOS schemes / Android flavors per variant | ⬜ | dev / preview / prod |

---

## B. Authentication

| ID | Screen / flow | Route | Status | Expo / API reference |
|----|---------------|-------|--------|----------------------|
| B1 | Auth welcome | `/auth/welcome` | ⬜ | `app/(auth)/welcome.tsx` |
| B2 | Login | `/login` | 🟡 | Stub only — `src/routes/login.tsx` |
| B3 | Register | `/auth/register` | ⬜ | `app/(auth)/register.tsx`, `services/auth.ts` |
| B4 | Forgot password | `/auth/forgot-password` | ⬜ | `screens/ForgotPassword` |
| B5 | Reset password | `/auth/reset-password/$phone` | ⬜ | `screens/ResetPassword` |
| B6 | Verify OTP | `/verify-otp` | ⬜ | `screens/VerifyOtp`, `API_ROUTES.VERIFY_OTP` |
| B7 | Auth API service | — | ⬜ | `src/features/auth/api.ts` |
| B8 | Logout | — | ⬜ | `API_ROUTES.LOGOUT` |
| B9 | Token refresh behavior verified | — | ⬜ | `apiClient.ts` |

---

## C. Onboarding

| ID | Screen / flow | Route | Status | Reference |
|----|---------------|-------|--------|-----------|
| C1 | Onboarding carousel + complete | `/onboarding` | ⬜ | `app/(onboarding)/welcome.tsx`, `COMPLETE_ONBOARDING` |
| C2 | Skip / next navigation | — | ⬜ | |
| C3 | Redirect if already onboarded | — | ⬜ | Guard in router |

---

## D. Main shell (tabs)

| ID | Task | Route | Status | Reference |
|----|------|-------|--------|-----------|
| D1 | Tab layout + bottom nav | `/tabs` | ⬜ | `app/(tabs)/_layout.tsx` |
| D2 | **No Store tab** — use Sitter tab or Services entry | `/tabs/sitter` or via services | ⬜ | Replaces `/(tabs)/store` |
| D3 | Safe area + haptics on tab press | — | ⬜ | `@capacitor/haptics` |

---

## E. Home

| ID | Screen / section | Route | Status | Reference |
|----|------------------|-------|--------|-----------|
| E1 | Home screen shell | `/tabs/home` | ⬜ | `screens/Home/index.tsx` |
| E2 | Pet cards section | — | ⬜ | `PetCardSection`, `API_ROUTES.PETS` |
| E3 | Reminders snippet | — | ⬜ | `ReminderSection` |
| E4 | Budget stats snippet | — | ⬜ | `BudgetStatisticSection` |
| E5 | Pull-to-refresh / loading states | — | ⬜ | |

---

## F. Reminders

| ID | Task | Route | Status | Reference |
|----|------|-------|--------|-----------|
| F1 | Reminder calendar UI | `/tabs/reminders` | ⬜ | `screens/Reminder/index.tsx` |
| F2 | List/create/edit/delete reminders | — | ⬜ | `services/reminder.ts`, `REMINDERS` |
| F3 | Link reminder to pet | — | ⬜ | |

---

## G. Services hub

| ID | Task | Route | Status | Reference |
|----|------|-------|--------|-----------|
| G1 | Service grid screen | `/tabs/services` | ⬜ | `app/(tabs)/(service)/index.tsx` |
| G2 | Card → Medical records | — | ⬜ | |
| G3 | Card → Budget | — | ⬜ | |
| G4 | Card → Photos | — | ⬜ | |
| G5 | Card → Sitter booking | — | ⬜ | **New** — not in Expo |
| G6 | Card → Subscription | — | ⬜ | **New** |
| G7 | Remove Doctor AI / Training / Clinic / Store cards | — | ⬜ | Do not port deferred features |

---

## H. Budget

| ID | Screen | Route | Status | Reference |
|----|--------|-------|--------|-----------|
| H1 | Budget dashboard | `/budget` | ⬜ | `screens/Budget/index.tsx` |
| H2 | Categories CRUD | `/budget/categories` | ⬜ | `screens/BudgetCategories` |
| H3 | Transactions CRUD + infinite list | `/budget/transactions` | ⬜ | `screens/BudgetTransactions` |
| H4 | Monthly/yearly statistics | — | ⬜ | `BUDGET_STATISTIC_*` |
| H5 | Budget API module | — | ⬜ | `services/budget.ts` |

---

## I. Photos

| ID | Task | Route | Status | Reference |
|----|------|-------|--------|-----------|
| I1 | Photos screen (social + my photos tabs) | `/photos` | ⬜ | `screens/Photos/index.tsx` |
| I2 | Image pick / camera | — | ⬜ | `@capacitor/camera`, Expo `useTakePhoto` |
| I3 | Upload photo | — | ⬜ | `UPLOAD_PHOTO`, `services/photos.ts` |
| I4 | Like / delete / stats | — | ⬜ | `TOGGLE_LIKE_PHOTO`, etc. |

---

## J. Medical records

| ID | Screen | Route | Status | Reference |
|----|--------|-------|--------|-----------|
| J1 | Records list (by pet) | `/medical-records` | ⬜ | `screens/MedicalRecord` |
| J2 | Record detail | `/medical-records/$id` | ⬜ | `screens/MedicalRecordDetail` |
| J3 | Records by pet | `/medical-records/pet/$petId` | ⬜ | `MEDICAL_RECORDS_BY_PET` |
| J4 | Create / edit / delete record | — | ⬜ | `services/medical-record.ts` |
| J5 | Attachments view / save to device | — | ⬜ | `@capacitor/filesystem` |

---

## K. Sitter booking (new — backend ready)

**API reference:** `apps/api/src/modules/sitter-bookings/`, `pet-sitters/`, `sitter-reviews/`

| ID | Screen / flow | Route | Status | API |
|----|---------------|-------|--------|-----|
| K1 | Browse sitters (list + address filter) | `/sitters` | ⬜ | `GET /sitters?address=` |
| K2 | Sitter profile detail | `/sitters/$id` | ⬜ | `GET /sitters/:id` |
| K3 | Register as sitter | `/sitters/register` | ⬜ | `POST /sitters/register` |
| K4 | My sitter profile | `/sitters/me` | ⬜ | `GET /sitters/me` |
| K5 | Edit sitter profile | `/sitters/me/edit` | ⬜ | `PATCH /sitters/:id` |
| K6 | Create booking | `/sitters/$id/book` | ⬜ | `POST /sitter-bookings` |
| K7 | My bookings (pet owner) | `/bookings` | ⬜ | `GET /sitter-bookings` |
| K8 | Bookings as sitter | `/bookings/sitter` | ⬜ | `GET /sitter-bookings/sitter` |
| K9 | Booking detail | `/bookings/$id` | ⬜ | `GET /sitter-bookings/:id` |
| K10 | Confirm / reject / complete / cancel | — | ⬜ | `PATCH /sitter-bookings/:id/*` |
| K11 | Reviews list on sitter | — | ⬜ | `GET /sitter-reviews/:sitterId` |
| K12 | Submit review | — | ⬜ | `POST /sitter-reviews` |
| K13 | `features/sitter-booking/api.ts` | — | ⬜ | |
| K14 | Services hub + tab entry to sitters | — | ⬜ | Replaces store discovery |

**Booking DTO fields:** `petId`, `sitterId`, `type` (enum), `startTime`, `endTime` — see `create-sitter-booking.dto.ts`.

---

## L. Subscription

**Data today:** `subscription` + `subscriptionExpiresAt` on user (`IUser` in Expo `interfaces/user.ts`); tiers: `free` \| `premium` (`subscription_tier` in Prisma). Returned on login / `GET /users/me`. **No dedicated subscribe/payment API found yet.**

| ID | Task | Route | Status | Notes |
|----|------|-------|--------|-------|
| L1 | Show current tier on settings | — | ⬜ | Read from `useUserStore` / `ME` |
| L2 | Subscription info screen | `/subscription` | ⬜ | Benefits, expiry date |
| L3 | Upgrade CTA (premium) | — | ⬜ | **Blocked** until payment API exists |
| L4 | Refresh user after upgrade | — | ⬜ | `GET /users/me` |
| L5 | Gate premium features (if any) | — | ⬜ | Product rules TBD |
| L6 | Services hub card → subscription | — | ⬜ | |

---

## M. Settings

| ID | Task | Route | Status | Reference |
|----|------|-------|--------|-----------|
| M1 | Settings screen | `/tabs/settings` | ⬜ | `app/(tabs)/settings.tsx` |
| M2 | Profile display / edit | — | ⬜ | `services/user.ts`, `ME` |
| M3 | Link to subscription | — | ⬜ | §L |
| M4 | Logout | — | ⬜ | §B8 |
| M5 | Push notification prefs (optional) | — | ⬜ | `@capacitor/push-notifications` |

---

## N. Deferred features (reference only — ⏸️)

| Feature | Expo reference | Status |
|---------|----------------|--------|
| Store tab + commerce | `screens/Store`, `Cart`, `Checkout` | ⏸️ |
| Clinics | `list-clinic.tsx` | ⏸️ |
| Spas | `list-spa.tsx` | ⏸️ |
| Training | `app/training/*` | ⏸️ |
| Doctor AI | `doctor-ai.tsx`, `stores/chat.ts` | ⏸️ |
| VNPay | `modules/vnpay`, `usePayment.ts` | ⏸️ |

---

## O. Suggested implementation order

1. **A13–A14** — Guards + shared UI  
2. **B + C** — Auth + onboarding  
3. **D + E + F + M** — Tab shell, home, reminders, settings  
4. **G** — Services hub (in-scope cards only)  
5. **H + I + J** — Budget, photos, medical records  
6. **K** — Sitter booking (full vertical slice)  
7. **L** — Subscription UI (read-only tier first; upgrade when API exists)  
8. **A16–A19** — Native hardening + CI  

---

## P. Progress summary

| Area | Done | Total | % |
|------|------|-------|---|
| Infrastructure | 10 | 19 | ~53% |
| In-scope features | 0 | ~55 tasks | 0% |
| Deferred | — | 6 areas | N/A |

*Update this table when closing tasks.*
