# Yeu Pet Mobile Frontend Refactor Plan

> Project: `apps/mobile`
> Date: 2026-06-02
> Status: Planning gate complete, implementation pending

## Architecture Assessment

The active mobile client is an Expo SDK 53 app using Expo Router, React Query, Zustand, NativeWind, React Hook Form, Zod, Reanimated, and `@gorhom/bottom-sheet`. The current architecture has a good base: route guards live in `app/_layout.tsx`, reusable UI primitives live in `components/ui`, API transport is centralized in `services/api-helper.ts`, and several larger features have started moving into `screens/*`.

The main maintainability issue is inconsistent feature ownership. Some routes are thin shims into `screens`, while others keep business logic and UI in route files or shared components. Several active features duplicate mutation/query/bottom-sheet patterns in screens. Some deferred commerce/clinic/spa/payment routes and services remain mounted even though `README.md` and `AGENTS.md` mark those domains as out of active scope.

## Current Findings

- Navigation is Expo Router based with root auth/onboarding guards and tab groups. The `store` tab is currently labeled "Sitter", which suggests a route/product-scope mismatch.
- `Providers` wraps the app with `SafeAreaProvider`, React Query, initialization, `GestureHandlerRootView`, and `BottomSheetModalProvider`. This is close, but gesture handling should be promoted as the root visual wrapper before app content initializes.
- The Reanimated Babel plugin is present and last in the plugin list.
- Bottom sheet usage is centralized through `components/ui/BottomSheet`, but the primitive wraps `BottomSheetModal` with `cssInterop`, forces `snapPoints={undefined}`, recreates inline modal components, and conflates controlled visibility with modal dismissal.
- API access is centralized, but `APIHelper.checkExpiredToken` assumes `error.response` exists and refreshes without replaying the failed request.
- React Query is used broadly, but query keys mix `meta` and `metadata` expectations across services/screens.
- Large/high-risk areas include `screens/Budget/index.tsx`, `screens/MedicalRecordDetail/index.tsx`, `screens/VerifyOtp/index.tsx`, `screens/MedicalRecord/*`, `components/PetCardCarousel/DetailCard.tsx`, `components/SwipeableWrapper`, `components/Markdown`, `Toast`, `Modal`, and form components.
- Loading and empty states exist in some screens, but patterns are inconsistent and error states are often only toast-based.
- NativeWind tokens exist in `theme/`, and UI should keep using the project-specific `mobile-app-ui-design` guidance: 8-point spacing, clear hierarchy, thumb-zone actions, meaningful empty states, consistent imagery/icons, and accessible tap targets.

## Refactor Goals

- Keep the refactor incremental and reviewable.
- Preserve working user flows while improving component ownership.
- Standardize bottom sheet behavior through one reusable primitive.
- Move screen-specific query/mutation orchestration into feature hooks where it reduces screen size and re-render risk.
- Keep Zustand for durable app/session state and React Query for server state.
- Align active UI with backend-supported active product scope.
- Document deferred domains instead of silently treating them as current product surface.

## Proposed Folder Direction

Keep the current Expo Router `app/` structure, but continue making route files thin:

```text
apps/mobile/
  app/                 # route declarations, layouts, route guards
  screens/             # screen composition by feature
  features/            # future feature hooks/components for larger domains
    budget/
    pets/
    reminders/
    photos/
    medical-records/
    sitter-booking/
    notifications/
    settings/
  components/ui/       # stable primitives
  components/          # shared product components
  services/            # API transport and domain request functions
  constants/           # API routes, query keys, validation, tokens
  stores/              # persisted client/app state only
```

Adopt `features/*` only where a domain needs multiple hooks/components and where moving code reduces real complexity. Do not bulk-move every file.

## Component Extraction Strategy

- Keep presentational components small and prop-driven.
- Extract budget screen mutation/query orchestration into hooks before splitting visual sections further.
- Split pet card flip/action controls from `DetailCard` only after bottom sheet reliability is fixed.
- Promote shared loading, empty, and error state components from existing patterns (`Skeleton`, `ListLoader`, `LoadingMessage`) into consistent UI primitives.
- Keep forms as controlled feature components, but isolate default-value mapping and mutation side effects in hooks.

## State And API Strategy

- Keep `useUserInfoStore` for user, tokens, OTP expiry, and device info.
- Keep `useChatStore` local to Doctor AI unless the feature is moved out of active scope.
- Remove server data from Zustand where it appears in future work; prefer React Query.
- Harden `APIHelper` error handling for missing `error.response`.
- Add API route/query-key entries for implemented backend domains that are missing frontend wiring: notifications, settings, photo comments, sitter booking, and subscription status if backend exposes it beyond webhook.
- Normalize API response typing so screens do not guess between `meta` and `metadata`.

## Form Validation Strategy

- Keep React Hook Form plus Zod validation in `constants/validation`.
- Move feature-specific schema/default-value helpers near the feature once a screen is refactored.
- Add missing validation for sitter booking, sitter registration, reviews, photo comments, notification/settings actions, and profile update UI.
- Ensure form submit buttons expose loading and disabled states.

## Navigation Strategy

- Keep root auth/onboarding verification guards in `app/_layout.tsx`.
- Rename or replace deferred tab routes so tab labels match actual routes.
- Add active backend-supported routes incrementally: notifications, settings profile/preferences, sitter list/profile/bookings/reviews.
- Keep modal/bottom sheet flows screen-local unless the interaction is shared across features.

## Bottom Sheet Fix Strategy

- Promote `GestureHandlerRootView` to the root visual provider boundary and keep `BottomSheetModalProvider` inside it.
- Replace the `cssInterop(BottomSheetModal)` wrapper with direct `BottomSheetModal` usage and explicit `backgroundStyle`.
- Remove forced `snapPoints={undefined}` and provide stable defaults for dynamic sizing and fixed snap point usage.
- Memoize backdrop, handle, content styles, and callbacks.
- Treat `visible` as controlled input, with `onDismiss` only notifying parent state changes.
- Provide safe-area bottom padding and keyboard behavior defaults.
- Document the expected usage pattern in the bottom sheet component or mobile README.

## Performance Strategy

- Avoid passing unstable inline components into heavy lists and tab screens where it causes repeated work.
- Use `FlashList`/`FlatList` with stable `keyExtractor`, `estimatedItemSize`, and memoized `renderItem` in photo, budget, cart, medical record, sitter, and notification lists.
- Remove unnecessary `extraData={data}` in lists where data identity already changes.
- Keep expensive derived data in `useMemo` only where inputs are stable and work is non-trivial.
- Optimize image usage through existing `expo-image` wrapper and stable dimensions.
- Avoid nested scroll views inside bottom sheets unless explicitly needed.

## Backend-Supported Feature Map

| Backend Feature/API | Current Frontend Status | Missing UI | Required Screens/Components | Priority |
| --- | --- | --- | --- | --- |
| Auth: register, login, logout, refresh | Implemented | Profile/password update not fully surfaced | Existing auth screens, settings profile form | P1 |
| User verification/onboarding/device | Mostly implemented | Device management UI not exposed | Verify OTP, onboarding, settings/device status | P2 |
| Pets CRUD | Implemented on home carousel | Detail route and richer empty/error states | Pet list/detail, pet form, delete confirmation | P1 |
| Reminders CRUD | Implemented calendar/form | Reminder detail state and error handling polish | Reminder calendar, reminder form, agenda items | P1 |
| Budget, categories, transactions, statistics | Implemented | Screen refactor, consistent empty/error states, category delete if backend allows | Budget dashboard, categories, transactions, forms | P1 |
| Medical records CRUD, by pet | Implemented | Better list filters/error states and attachment state polish | Medical record list/detail/form | P1 |
| Photos feed/upload/like/delete | Partially implemented | Photo comments, photo detail edit, stats display | Social feed, my photos, comments sheet, stats | P1 |
| Photo comments/replies | Not implemented | Full UI missing | Comment bottom sheet/list, reply composer, delete action | P1 |
| Notifications, badge, read, read-all, delete | Not implemented | Full UI missing | Notification inbox, badge indicator, empty state | P1 |
| User settings get/update | Not implemented | Full UI missing | Settings preferences screen, toggles | P1 |
| Sitter browsing/profile/bookings/reviews | Backend implemented, frontend route currently mismatched/deferred | Most UI missing | Sitter list, profile, booking form, bookings, sitter dashboard, reviews | P1 |
| Subscription webhook | Backend webhook only | User-facing plan/status needs confirmable API first | Subscription status/upgrade CTA only after GET API exists | P2 |
| Store/cart/order/shipping/payment | Frontend services/screens exist, mobile docs mark deferred | Product decision needed before expanding | Keep isolated or remove from active nav after confirmation | P3 |
| Clinics/spas/training/Doctor AI | Frontend exists, mobile docs mark deferred | Product decision needed | Keep isolated and out of active planning unless requested | P3 |

## UI Implementation Plan For Missing Active Backend APIs

### Notifications

- Target screen: notification inbox reachable from home/header/settings.
- Flow: user opens inbox, sees newest notifications, can mark one read, mark all read, delete one.
- API calls: `GET /notifications`, `GET /notifications/badge`, `PATCH /notifications/:id/read`, `POST /notifications/read-all`, `DELETE /notifications/:id`.
- States: skeleton list, empty inbox illustration/CTA, per-row optimistic read state, network error retry.
- Bottom sheet usage: optional notification detail sheet for long content.

### Photo Comments

- Target screen: photo detail or comments bottom sheet from feed item.
- Flow: open comments, paginate comments, compose comment/reply, delete own comment.
- API calls: `GET /photos/:id/comments`, `POST /photos/:id/comments`, `GET /photos/:id/comments/:cId/replies`, `DELETE /photos/:id/comments/:cId`.
- States: loading comments, empty conversation prompt, submit disabled while invalid, failed submit inline error.
- Bottom sheet usage: comments sheet with keyboard-aware composer.

### User Settings And Profile

- Target screen: settings.
- Flow: edit profile fields, update notification/preferences toggles, optionally update password/delete account.
- API calls: `GET /settings`, `PUT /settings`, `PATCH /users/me`, `POST /users/password/update`, `DELETE /users/me`.
- States: form loading, unsaved changes, destructive confirmation modal, success toast.
- Bottom sheet usage: edit profile or destructive confirmation can be modal/sheet depending on scope.

### Sitter Booking

- Target screens: sitter list, sitter profile, create booking, my bookings, sitter bookings, reviews.
- Flow: browse sitters, inspect profile/reviews, choose pet/date range, submit booking, manage/cancel booking, review completed booking.
- API calls: `GET /sitters`, `GET /sitters/:id`, `POST /sitter-bookings`, `GET /sitter-bookings`, `GET /sitter-bookings/:id`, `PATCH /sitter-bookings/:id/cancel`, `POST /sitter-reviews`, `GET /sitter-reviews/:sitterId`.
- States: list skeleton, no sitters available, capacity conflict error, pending/confirmed/active/completed/cancelled status badges.
- Bottom sheet usage: date/service picker and review composer.

## Testing Strategy

- Run mobile lint: `pnpm --filter @yeu-pet/mobile lint`.
- Run TypeScript directly if no script is added: `pnpm --filter @yeu-pet/mobile exec tsc --noEmit`.
- Run root lint when shared changes occur: `pnpm lint`.
- Start Expo for manual verification: `pnpm --filter @yeu-pet/mobile dev`.
- Use iOS/Android simulator verification for bottom sheet gestures and keyboard behavior when available.
- Add focused tests only if the repo already has compatible test setup; otherwise document manual verification.

## Risks

- Bottom sheet issues can be platform-specific and may require simulator/device confirmation.
- Some frontend service constants do not match current backend route names, especially photos upload/comments and deferred commerce domains.
- Existing deferred routes in active navigation could confuse scope decisions.
- API helper refresh-token behavior may hide 401 flow bugs until exercised against the backend.
- Large screen refactors can create visual regressions if done in one pass.

## Implementation Phases

1. Audit and planning artifacts.
2. Bottom sheet provider/primitive fix and documentation.
3. API/query-key normalization for active backend gaps.
4. Small feature hook extraction for budget/pets/reminders where it reduces screen complexity.
5. Missing UI planning and implementation for notifications, photo comments, settings, and sitter booking.
6. Performance pass on heavy lists/images/modals.
7. Verification, Expo run, and final risk review.
