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
- [x] Avoid compatibility routes in new FE code:
  - [x] `/users/me`
  - [x] `PUT /settings`
  - [x] `GET /photos`
  - [x] `POST /photos/:id/toggle-like`
  - [x] `/sitters/register`
  - [x] `/sitter-bookings/sitter`
  - [x] PATCH booking action routes

## Feature Tasks

- [ ] Auth/account/profile/onboarding aligned with `/me` and canonical auth utilities.
  - [x] Auth sign-in, sign-up, forgot password, and reset password forms moved under `features/auth/components`; old component exports removed.
- [x] Settings supports notification toggles, language, and theme using `PATCH /settings`.
  - [x] Settings route is a thin Expo Router shim.
  - [x] Settings screen has loading/error/retry states for settings data.
  - [x] Settings shows subscription usage from entitlements.
  - [x] Support and legal rows added.
  - [ ] Profile edit and production subscription action remain.
- [x] Subscription/entitlement APIs and paywall gating are implemented for Phase 1 quota surfaces.
  - [x] Add subscription/entitlement service functions.
  - [x] Wire entitlement queries into pet creation, photo upload, medical record creation, AI chat, and settings subscription summary.
- [x] Pet Management service and screens use canonical `/pets` APIs.
  - [x] Pet carousel and pet info form source moved under `features/pets/components`; old component exports removed.
  - [x] Pet create/update sends canonical `weightValue` and `weightUnit` alongside temporary legacy `weight`.
  - [x] Pet detail card displays canonical weight fields when returned.
  - [x] Pet detail card avoids `Invalid Date` for missing or malformed birthdates.
- [x] Reminders expose filters, upcoming, and status actions.
  - [x] Reminder calendar, form, and icon source moved under `features/reminders/components`; old component exports removed.
  - [x] Reminder calendar query/mutation orchestration moved into `features/reminders/hooks.ts`.
  - [x] Reminder create sheet orchestration moved from `Headers/ReminderHeader` into `features/reminders/hooks.ts`.
  - [x] Reminder calendar supports status, type, and pet filters.
  - [x] Home uses canonical `GET /reminders/upcoming`.
  - [x] Pending reminder rows expose complete, skip, and cancel actions.
- [x] Medical Records use pet-scoped create and attachment add/remove routes.
  - [x] Medical record form and pet timeline source moved under `features/medical-records/components`; old component exports removed.
  - [x] Medical record container, list item, and type chip moved under `features/medical-records/components`.
  - [x] Main medical record list/create/delete orchestration moved into `features/medical-records/hooks.ts`.
  - [x] Per-pet medical record list/delete and detail edit/delete orchestration moved into `features/medical-records/hooks.ts`.
  - [x] Collapsible medical record preview query moved into `features/medical-records/hooks.ts`.
- [x] Budget screens use `/budgets`, `/budgets/statistics/*`, categories, and transactions.
  - [x] Budget forms, transaction list, category statistic, and chart components moved under `features/budget/components`; old component exports removed.
  - [x] Budget route screen composers moved under `features/budget/screens`; Expo routes are thin feature shims.
  - [x] Budget categories expose the canonical delete route with confirmation and cache invalidation.
  - [x] Budget services and transaction form support optional `petId` per the canonical contract.
- [x] Photos Social uses `/photos/social`, `/photos/me`, explicit like/unlike, comments/replies, and reports.
  - [x] Photos `LikeButton` moved under `features/photos/components`; old component export removed.
  - [x] Photos grid, viewer, comments sheet, upload sheet, composer controls, and utility constants moved under `features/photos`; old screen-local component files removed.
  - [x] Move the remaining Photos screen composer into `features/photos/screens/PhotosScreen.tsx`.
- [x] Sitter profile/search uses canonical sitter routes.
- [x] Sitter bookings use `/sitter-bookings/me` and POST status actions.
- [x] Sitter booking messages use HTTP list/create routes.
- [x] Pet Care AI uses backend conversation/message streaming APIs only.
  - [x] AI chat message, markdown, typing, and loading components moved under `features/ai/components`; old component exports removed.
- [x] Notifications/devices use `/devices` and `/notifications`.
- [x] Home aggregation uses existing pet/upcoming reminder/budget APIs.
  - [x] Home pet, upcoming reminder, and monthly budget sections expose loading, empty/error recovery, and pull-to-refresh behavior.

## UI / UX Tasks

- [ ] Apply `.codex/skills/pet-mobile-ui-ux-design/SKILL.md` before mobile UI design decisions.
- [ ] Apply `.codex/skills/react-native-expo-ui-implementation/SKILL.md` during React Native + Expo UI implementation.
- [ ] Apply `.codex/skills/mobile-ui-review-checklist/SKILL.md` before marking UI tasks complete.
- [ ] Loading states for major screens.
- [ ] Empty states for major screens.
- [ ] Error states and retry actions.
  - [x] Settings has loading/error/retry states.
- [ ] Pull-to-refresh where useful.
- [ ] Mutation pending states.
  - [x] Settings disables/pends setting updates and subscription mock actions.
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
