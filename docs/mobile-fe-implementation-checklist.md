# Mobile FE Implementation Checklist

This checklist tracks the Phase 1 mobile refactor against `docs/12-mobile-api-contract.md`.

## Discovery

- [x] Read required project docs.
- [x] Inspect Expo Router route structure under `apps/mobile/app`.
- [x] Inspect current API route registry and Axios helper.
- [x] Inspect auth/token handling and Secure Store persistence.
- [x] Inspect React Query usage and query-key registry.
- [x] Inspect Zustand stores.
- [x] Inspect existing theme folder and color constants.
- [x] Inspect existing feature screens and service modules.

## Current Structure Notes

- Expo Router is rooted in `apps/mobile/app`.
- Existing API layer uses `apps/mobile/services/api-helper.ts` plus domain service files.
- Kept the existing `services/` API layer for this slice instead of moving files to `src/api/`, because mobile project conventions and imports are already built around `services/`.
- Tokens are persisted in Zustand using Expo Secure Store.
- Server state mostly uses TanStack Query; AI chat is currently local Zustand state.
- NativeWind/theme tokens exist in `theme/` and component class names.
- Long feeds already use some infinite query patterns; `@shopify/flash-list` is installed.

## API Mismatches Found

- [x] `@google/genai` is installed and `services/ai.ts` calls Gemini directly from mobile.
- [x] `constants/common.ts` exposes a Gemini API key fallback in mobile code.
- [x] Profile route constant uses `/users/me`; canonical route is `/me`.
- [x] Settings update uses `PUT /settings`; canonical route is `PATCH /settings`.
- [x] Social photos list uses `GET /photos`; canonical route is `GET /photos/social`.
- [x] Like service uses a toggle-style function name; canonical endpoints are explicit like/unlike.
- [x] Sitter registration uses `/sitters/register`; canonical route is `POST /sitters/me`.
- [x] Sitter booking owner/sitter lists use legacy split routes; canonical route is `GET /sitter-bookings/me?role=owner|sitter`.
- [x] Sitter booking actions use PATCH compatibility routes; canonical mobile routes are POST actions.
- [x] Medical record create uses `/medical-records`; canonical mobile route is `/pets/:id/medical-records`.
- [x] Medical attachment add/remove endpoints are not exposed in mobile services.
- [x] Reports/blocks/subscriptions APIs are missing from mobile services.

## Duplicate / Legacy API Usage To Remove

- [x] Remove direct Gemini client and dependency.
- [ ] Avoid compatibility routes in new FE code:
  - [x] `/users/me`
  - [x] `PUT /settings`
  - [x] `GET /photos`
  - [x] `POST /photos/:id/toggle-like`
  - [x] `/sitters/register`
  - [x] `/sitter-bookings/sitter`
  - [x] PATCH booking action routes

## Feature Tasks

- [ ] Auth/account/profile/onboarding aligned with `/me` and canonical auth utilities.
- [x] Settings supports notification toggles, language, and theme using `PATCH /settings`.
- [ ] Subscription/entitlement APIs and paywall gating are implemented.
  - [x] Add subscription/entitlement service functions.
  - [ ] Wire entitlement queries into screens/paywalls.
- [ ] Pet Management service and screens use canonical `/pets` APIs.
- [ ] Reminders expose filters, upcoming, and status actions.
- [x] Medical Records use pet-scoped create and attachment add/remove routes.
- [ ] Budget screens use `/budgets`, `/budgets/statistics/*`, categories, and transactions.
- [x] Photos Social uses `/photos/social`, `/photos/me`, explicit like/unlike, comments/replies, and reports.
- [x] Sitter profile/search uses canonical sitter routes.
- [x] Sitter bookings use `/sitter-bookings/me` and POST status actions.
- [x] Sitter booking messages use HTTP list/create routes.
- [x] Pet Care AI uses backend conversation/message streaming APIs only.
- [x] Notifications/devices use `/devices` and `/notifications`.
- [ ] Home aggregation uses existing pet/upcoming reminder/budget APIs.

## UI / UX Tasks

- [ ] Loading states for major screens.
- [ ] Empty states for major screens.
- [ ] Error states and retry actions.
- [ ] Pull-to-refresh where useful.
- [ ] Mutation pending states.
- [ ] Confirm delete dialogs.
- [ ] Toast/snackbar or inline mutation feedback.
- [ ] Safe area and keyboard handling.
- [ ] Dark mode compatibility.
- [ ] Accessible touch targets.

## Verification Commands

- [x] `pnpm --filter @yeu-pet/mobile lint`
- [x] `pnpm --filter @yeu-pet/mobile exec tsc --noEmit`
- [ ] Expo start smoke test when requested/needed.
- [ ] Manual QA using `docs/09-testing-release-checklist.md`.
