# Mobile Refactor Plan

This plan is intentionally incremental. It keeps the existing root-level `apps/mobile` import alias and `services/` API convention for the first slices, then moves feature ownership one domain at a time.

## Guiding Rules

- Do not perform a big-bang folder move.
- Do not change backend APIs.
- Do not add WebSocket.
- Do not call AI providers directly from mobile.
- Do not send `accountId` in mobile mutation bodies.
- Keep raw Axios inside `services/api-helper.ts`.
- Keep server state in React Query and durable client/session state in Zustand.
- Use existing UI primitives and NativeWind theme tokens.
- Keep out-of-scope routes/screens/components frozen unless a moved import breaks compilation.
- Use the project-local mobile skills before, during, and after UI work.

## Target Structure For This Repo

Because `@/*` currently maps to the mobile root, use this root-level structure first:

```txt
apps/mobile/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── feedback/
│   ├── form/
│   ├── media/
│   ├── navigation/
│   └── common/
├── features/
│   ├── auth/
│   ├── me/
│   ├── settings/
│   ├── subscriptions/
│   ├── pets/
│   ├── reminders/
│   ├── medical-records/
│   ├── budget/
│   ├── photos/
│   ├── sitter/
│   ├── ai/
│   └── notifications/
├── services/
├── interfaces/
├── stores/
├── theme/
├── hooks/
├── constants/
├── utils/
└── docs/
```

Defer a `src/` migration until the app compiles cleanly with feature ownership established.

## Phase 0 - Discovery And Baseline

Status: completed for the initial baseline.

Tasks:

- Keep `apps/mobile/docs/mobile-refactor-audit.md` current.
- Keep this plan current after each refactor slice.
- Run baseline lint and TypeScript checks.
- Record existing failures before implementation changes.

Verification:

- `pnpm --filter @yeu-pet/mobile lint`
- `pnpm --filter @yeu-pet/mobile exec tsc --noEmit`

## Phase 1 - Scope Control

Files to leave untouched except import compatibility:

- `app/cart.tsx`
- `app/checkout.tsx`
- `app/shipping-address.tsx`
- `app/list-clinic.tsx`
- `app/list-spa.tsx`
- `app/products/[productId].tsx`
- `app/training/*`
- `screens/Cart`
- `screens/Checkout`
- `screens/ShippingAddress`
- `screens/ListClinic`
- `screens/ListSpa`
- `screens/ProductDetail`
- `screens/Store`
- `screens/Training`
- `screens/TrainingLevel`
- `components/CartButton`
- `components/ClinicCard`
- `components/SpaCard`
- `components/PetClinicList`
- `components/QuantityInput`
- `services/carts.ts`
- `services/products.ts`
- `services/order.ts`
- `services/payments.ts`
- `services/shipping-address.ts`
- `services/clinic.ts`
- `services/spa.ts`
- `stores/shop-store.ts`

Navigation actions:

- Keep `app/(tabs)/store.tsx` hidden with `href: null`.
- Treat Service tab Phase 2 cards as disabled/coming soon or remove navigation until product scope requests them.
- Decide whether Pet Care AI is active Phase 1 according to the new refactor pack and API contract. Current `apps/mobile/AGENTS.md` still says Doctor AI is deferred, so align that doc before deeper AI UI work.

## Phase 2 - Route And Feature Foundations

Create or refactor these feature folders:

- `features/settings`
- `features/me`
- `features/subscriptions`
- `features/pets`
- `features/reminders`
- `features/medical-records`
- `features/budget`
- `features/photos`
- `features/sitter`
- `features/ai`
- `features/notifications`

Route files to thin:

- Move `app/(tabs)/settings.tsx` screen body into `features/settings/screens/SettingsScreen.tsx`. Done.
- Move `app/(tabs)/(service)/index.tsx` screen body into `features/services` or `screens/Service` before broader service UX work.
- Keep existing route shim pattern for already-thin files.

Compatibility rule:

- If moving a component breaks frozen screens, add a short compatibility export at the old path instead of rewriting the frozen screen.

## Phase 3 - API And Query Foundation

Keep API transport in:

- `services/api-helper.ts`
- `constants/api-routes.ts`
- `constants/query-keys.ts`

Refactor goals:

- Add feature hooks around existing services before moving transport files.
- Normalize query keys by active feature and avoid broad invalidation.
- Rename confusing aligned APIs, such as `toggleLikePhotoMutation`, to explicit `likePhotoMutation` with compatibility export if needed.
- Verify medical record create uses `POST /pets/:id/medical-records`.
- Verify photo comments do not send `accountId` to backend bodies.
- Confirm budget supports optional `petId` where backend contract allows it.
- Confirm pet create/update sends `weightValue` and `weightUnit`; keep legacy `weight` compatibility only where existing UI still depends on it.

API modules to keep/refactor:

- `services/user.ts`
- `services/settings.ts`
- `services/subscriptions.ts`
- `services/pet.ts`
- `services/reminder.ts`
- `services/medical-record.ts`
- `services/budget.ts`
- `services/photos.ts`
- `services/photo-comments.ts`
- `services/reports.ts`
- `services/sitter.ts`
- `services/ai.ts`
- `services/notifications.ts`

Do not expand frozen API modules.

## Phase 4 - UI Foundation

Normalize shared folders gradually:

- `components/layout`
  - `ScreenContainer` compatibility or `AppScreen`
  - `BottomActionWrapper`
  - shared headers only if not feature-specific
- `components/feedback`
  - `StateView`
  - `AppLoader`
  - `ListLoader`
  - `Skeleton`
  - `Toast`
  - `Modal`
  - `Popup`
- `components/form`
  - reusable controllers used by multiple features
- `components/media`
  - `ImageGallery`
  - document/image uploaders only if reused
- `components/navigation`
  - `Tabs`
  - `Headers/BackHeader`
  - `Headers/HomeHeader`
  - `Headers/ReminderHeader`
- `components/common`
  - `SearchInput`
  - `RefreshControl`
  - `SwipeableWrapper`

Component quality tasks:

- Replace raw colors in touched active components with theme tokens where practical.
- Ensure icon-only buttons have accessibility labels.
- Ensure buttons and direct controls meet the 44 pt target.
- Keep card dimensions stable and avoid nested cards.
- Preserve dark mode readability.

## Phase 5 - Feature Order

### 5.1 Settings

Status: Phase 1 settings shell implemented. Profile edit, support/legal links, and final production subscription purchase flow remain.

Files/folders:

- Create `features/settings/screens/SettingsScreen.tsx`. Done.
- Keep `features/settings/components/ThemeToggle.tsx`.
- Add `features/settings/hooks.ts` if settings queries/mutations grow.
- Update `app/(tabs)/settings.tsx` to export the screen. Done.
- Add feature-local section, row, toggle, and segmented controls. Done.

Requirements:

- Profile/account entry. Partially done with signed-in account summary.
- Subscription summary. Done with entitlements usage and retry state.
- Notification toggles. Done with `/settings` updates.
- Theme and language persistence through `/settings`. Done.
- Logout clears tokens/cache. Existing hook retained.
- Loading/error states for settings and subscription summary. Done.
- Remaining: profile edit navigation, support/legal rows, production subscription action, and manual visual QA.

### 5.2 Home + Pets

Status: started. Home pull-to-refresh and pet carousel loading/error states already exist; pet weight contract compatibility is aligned; pet carousel/form source now lives under `features/pets/components`.

Files/folders:

- Move pet carousel ownership toward `features/pets/components/PetCardCarousel`. Done; old component export removed.
- Move pet form ownership toward `features/pets/components/PetInfoForm`. Done; old component export removed.
- Keep `screens/Home/homeQueries.ts` or move to `features/home` once stable.

Requirements:

- Real pet data from `/pets`.
- Upcoming reminders from `/reminders/upcoming`.
- Empty no-pets state with add action.
- Pet delete confirmation.
- `weightValue` and `weightUnit` support. Done for mobile create/update payloads and pet card display fallback.
- Free pet limit/paywall handling.

### 5.3 Reminders

Status: started. Reminder calendar, form, and icon source now live under `features/reminders/components`; old component exports were removed. Calendar query/mutation orchestration and create-reminder sheet orchestration now live in `features/reminders/hooks.ts`.

Files/folders:

- Move `ReminderCalendar`, `ReminderForm`, and `ReminderIcons` into `features/reminders/components`. Done; old component exports removed.
- Add `features/reminders/hooks.ts`, `types.ts`, `utils.ts`. `hooks.ts` started with `useReminderCalendar` and `useCreateReminderSheet`.

Requirements:

- Date range filters.
- Pet/type/status filters.
- Complete/skip/cancel actions.
- No `Invalid Date`.
- Create/edit bottom sheet states.

### 5.4 Medical Records

Status: started. Medical record form, pet timeline, record container, record row, and type chip source now live under `features/medical-records/components`; old component exports were removed. Main list/create/delete, per-pet list/delete, detail edit/delete, and collapsible preview orchestration now live in `features/medical-records/hooks.ts`. Shared `DocumentsInputController` and `ImageGallery` remain global for now.

Files/folders:

- Move `MedicalRecordForm` and `PetTimeline` into `features/medical-records/components`. Done; old component exports removed.
- Move `MedicalRecordContainer`, `MedicalRecordListItem`, and `MedicalRecordType` into `features/medical-records/components`. Done; old screen-local component files removed.
- Add `features/medical-records/hooks.ts` for list/create/delete screen orchestration. Started with `useMedicalRecordList`, `useMedicalRecordPetList`, `useMedicalRecordDetail`, and `useMedicalRecordPreview`.
- Keep `ImageGallery` and `DocumentsInputController` shared only if used by multiple features. Deferred; both remain global while shared-media ownership is decided.

Requirements:

- Pet-scoped create endpoint.
- Attachment upload/delete.
- Attachment processing/ready/failed states.
- Fullscreen image viewer.
- Delete confirmations.

### 5.5 Budget

Status: started. Budget forms, transaction list, category statistic, and chart components now live under `features/budget/components`; old component exports were removed. Query/mutation orchestration still remains mostly screen-local except `useBudgetCategories`.

Files/folders:

- Move budget screens toward `features/budget/screens`.
- Move budget components and charts under `features/budget/components`. Done; old component exports removed.
- Keep `features/budget/useBudgetCategories.ts` and add summary/transaction hooks.

Requirements:

- Month/year selector.
- Optional pet filter.
- Zero-budget state.
- Over-budget state.
- VND formatting.
- Chart text summaries.

### 5.6 Photos

Files/folders:

- Move photo screen pieces into `features/photos/components`.
- Keep or promote `ImageGallery` based on medical reuse.

Requirements:

- Social tab uses `/photos/social`.
- My Photos tab uses `/photos/me`.
- Explicit like/unlike mutations.
- Comment/reply/delete/report actions.
- Private photos excluded from social feed.
- Photo upload loading/error/entitlement states.

### 5.7 Sitter

Files/folders:

- Move sitter screens and components into `features/sitter`.
- Keep HTTP message thread, no WebSocket.

Requirements:

- Sitter discovery/profile.
- Booking request/actions.
- Booking messages through HTTP list/create.
- External payment copy.
- Review only after completed booking.

### 5.8 Pet Care AI

Files/folders:

- Move AI components into `features/ai/components` unless shared chat is truly needed.
- Move screens into `features/ai/screens`.

Requirements:

- Backend `/ai/conversations` only.
- Safety disclaimer.
- Quota/paywall state.
- Streaming fallback documented if needed.
- Markdown is readable in light/dark mode.

### 5.9 Notifications

Files/folders:

- Move notification screen logic into `features/notifications`.
- Keep device registration in app-level auth/session sync where appropriate.

Requirements:

- Notification list/badge.
- Mark read/read all/delete.
- Respect notification settings.
- Register/unregister device tokens when session changes.

## Phase 6 - Legacy Cleanup

Tasks:

- Search active code for compatibility routes and document any required exceptions.
- Remove or freeze direct imports from out-of-scope services in active screens.
- Rename legacy function names after callers are updated.
- Remove duplicate components only after route and frozen import compatibility is confirmed.

Search commands:

```sh
rg -n "/users/me|PUT /settings|toggle-like|/sitters/register|sitter-bookings/sitter|@google/genai|accountId" apps/mobile
rg -n "axios" apps/mobile/app apps/mobile/screens apps/mobile/components apps/mobile/features
rg -n "#[0-9A-Fa-f]{3,8}|rgba\\(|rgb\\(" apps/mobile/app apps/mobile/screens apps/mobile/components apps/mobile/features
```

## Phase 7 - Verification And Review

Run after each risky slice:

```sh
pnpm --filter @yeu-pet/mobile lint
pnpm --filter @yeu-pet/mobile exec tsc --noEmit
```

Run before marking UI work complete:

- Check the affected screens against `pet-mobile-ui-ux-design`.
- Check implementation against `react-native-expo-ui-implementation`.
- Apply `mobile-ui-review-checklist`.
- Manually inspect at least one narrow mobile viewport and one typical phone viewport when feasible.
- Check light and dark mode.
- Exercise loading, empty, error, and success states where reachable.

## Reporting Template

Every refactor slice should report:

- Changed files.
- Files intentionally skipped.
- Endpoint changes.
- Component moves or compatibility exports.
- Verification commands and results.
- Known issues and next task.
