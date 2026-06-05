# Mobile Refactor Audit

This audit follows `mobile-refactor-docs/AGENT_MASTER_PROMPT.md` and the canonical Phase 1 contract in `docs/12-mobile-api-contract.md`.

## Summary

- The app still uses the current root-level structure (`app`, `screens`, `components`, `features`, `services`, `interfaces`, `stores`, `theme`) rather than the proposed `src/` structure.
- Most Expo Router route files are thin shims into `features/*` or transitional `screens/*`. The Service tab still contains screen logic directly.
- The active API layer uses `services/api-helper.ts`, `constants/api-routes.ts`, and domain service files. This matches current `apps/mobile/CODE_CONVENTIONS.md`, so the first refactor slice should keep `services/` instead of introducing `src/api` immediately.
- Several canonical endpoint updates are already present: `/me`, `PATCH /settings`, `/photos/social`, `/photos/me`, `/sitters/me`, `/sitter-bookings/me`, reminder status action routes, devices, notifications, and backend AI conversation routes.
- Phase 2/deferred files are still present in routing and services, but the Store tab is hidden from bottom tabs. These should remain frozen unless needed for compile stability.

## Current Folder Structure Issues

- `screens/` still contains transitional Phase 1 screen composers plus frozen Phase 2 screens:
  - Phase 1 examples: `Home`, `Reminder`, `Budget`, `BudgetCategories`, `BudgetTransactions`, `MedicalRecord`, `MedicalRecordDetail`, `Sitter`, `DoctorAI`, `Notifications`.
  - Frozen examples: `Cart`, `Checkout`, `ShippingAddress`, `ListClinic`, `ListSpa`, `ProductDetail`, `Store`, `Training`, `TrainingLevel`.
- `components/` now mostly holds shared primitives, controllers, feedback, media, navigation, and frozen commerce/clinic/training components. Avoid adding new feature-owned components here.
- `features/` now owns migrated components/screens/hooks for auth, settings, pets, reminders, medical records, budget, photos, AI, subscriptions, and sitter. Continue moving remaining active screen composers incrementally.
- `services/` mixes Phase 1 API files with frozen services (`carts`, `products`, `payments`, `shipping-address`, `clinic`, `spa`).
- `interfaces/` is still global. Many domain response types remain in `interfaces/*`; feature-local `types.ts` files do not yet exist.
- `app/(tabs)/(service)/index.tsx` is not a thin route shim.

## Phase 1 Screens

- Auth/account/profile/onboarding:
  - `app/(auth)/*`
  - `app/(onboarding)/*`
  - `app/verify-otp.tsx`
  - `features/auth/components/ForgotPasswordForm`
  - `features/auth/components/ResetPasswordForm`
  - `features/auth/components/SignInForm`
  - `features/auth/components/SignUpForm`
  - `screens/ForgotPassword`
  - `screens/ResetPassword`
  - `screens/VerifyOtp`
- Home:
  - `app/(tabs)/(home)/index.tsx`
  - `screens/Home`
- Settings:
  - `app/(tabs)/settings.tsx`
  - `features/settings/screens/SettingsScreen.tsx`
  - `features/settings/components/ThemeToggle.tsx`
- Subscriptions and entitlement gating:
  - `features/subscriptions/useEntitlements.ts`
  - `components/PaywallNotice`
  - Settings subscription summary
- Pets:
  - `features/pets/components/PetCardCarousel`
  - `features/pets/components/PetInfoForm`
  - `features/pets/usePetCardSection.ts`
- Reminders:
  - `app/(tabs)/(reminder)/index.tsx`
  - `screens/Reminder`
  - `features/reminders/components/ReminderCalendar`
  - `features/reminders/components/ReminderForm`
  - `features/reminders/components/ReminderIcons`
- Medical Records:
  - `app/medical-record/*`
  - `screens/MedicalRecord`
  - `screens/MedicalRecordDetail`
  - `features/medical-records/hooks.ts`
  - `features/medical-records/components/MedicalRecordContainer`
  - `features/medical-records/components/MedicalRecordForm`
  - `features/medical-records/components/MedicalRecordListItem`
  - `features/medical-records/components/MedicalRecordType`
  - `features/medical-records/components/PetTimeline`
  - `components/DocumentsInputController`
  - `components/ImageGallery`
- Budget:
  - `app/budget/*`
  - `features/budget/screens/Budget`
  - `features/budget/screens/BudgetCategories`
  - `features/budget/screens/BudgetTransactions`
  - `features/budget/components/BudgetCategoryForm`
  - `features/budget/components/BudgetCategoryStatistic`
  - `features/budget/components/BudgetTransaction`
  - `features/budget/components/BudgetTransactionForm`
  - `features/budget/components/chart`
- Photos Social:
  - `app/photos.tsx`
  - `features/photos/screens/PhotosScreen.tsx`
  - `features/photos/components/CaptionInput`
  - `features/photos/components/EmptyPhotos`
  - `features/photos/components/LikeButton`
  - `features/photos/components/PhotoCommentsSheet`
  - `features/photos/components/PhotoItem`
  - `features/photos/components/PhotoView`
  - `features/photos/components/SocialPhotos`
  - `features/photos/components/SubmitButton`
  - `features/photos/components/TakePhotoSheet`
  - `features/photos/components/UserPhotos`
  - `features/photos/utils.ts`
  - `components/ImageGallery`
- Sitter Booking:
  - `app/(tabs)/sitter.tsx`
  - `screens/Sitter`
- Pet Care AI:
  - `app/doctor-ai.tsx`
  - `screens/DoctorAI`
  - `features/ai/components/ChatMessage`
  - `features/ai/components/Markdown`
  - `features/ai/components/TypingMessage`
  - `features/ai/components/LoadingMessage`
- Notifications/devices:
  - `app/notifications.tsx`
  - `screens/Notifications`
  - `components/UserSync`

## Out Of Scope / Frozen

Do not move, deeply refactor, or implement new behavior in these unless needed for compile stability.

- Routes:
  - `app/cart.tsx`
  - `app/checkout.tsx`
  - `app/shipping-address.tsx`
  - `app/list-clinic.tsx`
  - `app/list-spa.tsx`
  - `app/products/[productId].tsx`
  - `app/training/*`
  - `app/(tabs)/store.tsx` (hidden from bottom tab via `href: null`)
- Screens:
  - `screens/Cart`
  - `screens/Checkout`
  - `screens/ShippingAddress`
  - `screens/ListClinic`
  - `screens/ListSpa`
  - `screens/ProductDetail`
  - `screens/Store`
  - `screens/Training`
  - `screens/TrainingLevel`
- Components:
  - `CartButton`
  - `ClinicCard`
  - `SpaCard`
  - `PetClinicList`
  - `QuantityInput`
  - `Headers/ProductDetailHeader`
  - Store/product components
  - Training-related components
- Services/modules:
  - `services/carts.ts`
  - `services/products.ts`
  - `services/order.ts`
  - `services/payments.ts`
  - `services/shipping-address.ts`
  - `services/clinic.ts`
  - `services/spa.ts`
  - `stores/shop-store.ts`

## Component Classification

### UI Primitives

Keep generic and feature-free:

- `components/ui/Avatar`
- `components/ui/BottomSheet`
- `components/ui/Button`
- `components/ui/Checkbox`
- `components/ui/Image`
- `components/ui/InputField`
- `components/ui/Options`
- `components/ui/ProgressBar`
- `components/ui/RadioCheckbox`
- `components/ui/ScreenContainer`
- `components/ui/Spinner`
- `components/ui/StateView`
- `components/ui/Text`
- `components/ui/Typography`

Audit note: `components/ui/ThemeToggle` still exists while the active behavior component lives at `features/settings/components/ThemeToggle.tsx`. Keep only compatibility exports if needed.

### Shared App Components

Candidates for shared layout, feedback, form, media, navigation, or common folders:

- `AppLoader`, `ListLoader`, `Skeleton`, `Toast`, `Modal`, `Popup`
- `BottomActionWrapper`, `RefreshControl`, `SearchInput`, `SwipeableWrapper`
- `Headers/BackHeader`, `Headers/HomeHeader`, `Headers/ReminderHeader`
- `Tabs`
- Generic controllers: `InputController`, `CheckboxController`, `DatetimePickerController`, `OptionInputController`, `PhoneInputController`, `UnitInputController`
- Potentially generic but usage-dependent: `AvatarInputController`, `PetPickerController`, `DocumentsInputController`, `ImageGallery`

### Feature Components

- Auth: `features/auth/components/ForgotPasswordForm`, `features/auth/components/ResetPasswordForm`, `features/auth/components/SignInForm`, `features/auth/components/SignUpForm`
- Pets: `features/pets/components/PetCardCarousel`, `features/pets/components/PetInfoForm`
- Reminders: `features/reminders/components/ReminderCalendar`, `features/reminders/components/ReminderForm`, `features/reminders/components/ReminderIcons`
- Medical Records: `features/medical-records/hooks.ts`, `features/medical-records/components/MedicalRecordContainer`, `features/medical-records/components/MedicalRecordForm`, `features/medical-records/components/MedicalRecordListItem`, `features/medical-records/components/MedicalRecordType`, `features/medical-records/components/PetTimeline`
- Budget: `features/budget/screens/Budget`, `features/budget/screens/BudgetCategories`, `features/budget/screens/BudgetTransactions`, `features/budget/components/BudgetCategoryForm`, `features/budget/components/BudgetCategoryStatistic`, `features/budget/components/BudgetTransaction`, `features/budget/components/BudgetTransactionForm`, `features/budget/components/chart`
- Photos: `features/photos/screens/PhotosScreen.tsx`, `features/photos/components/CaptionInput`, `features/photos/components/EmptyPhotos`, `features/photos/components/LikeButton`, `features/photos/components/PhotoCommentsSheet`, `features/photos/components/PhotoItem`, `features/photos/components/PhotoView`, `features/photos/components/SocialPhotos`, `features/photos/components/SubmitButton`, `features/photos/components/TakePhotoSheet`, `features/photos/components/UserPhotos`, `features/photos/utils.ts`
- AI: `features/ai/components/ChatMessage`, `features/ai/components/Markdown`, `features/ai/components/TypingMessage`, `features/ai/components/LoadingMessage`
- Settings: `features/settings/components/ThemeToggle.tsx`

## Legacy Endpoint Audit

| Area | Current usage | Canonical replacement | Status |
| --- | --- | --- | --- |
| Profile | `API_ROUTES.ME = "/me"` in `constants/api-routes.ts`; `services/user.ts` uses it | `/me` | Aligned |
| Settings | `services/settings.ts` uses `APIs.patch(API_ROUTES.SETTINGS)` | `PATCH /settings` | Aligned |
| Photos social | `API_ROUTES.PHOTOS = "/photos/social"`; `services/photos.ts` uses it | `GET /photos/social` | Aligned |
| My photos | `API_ROUTES.USER_PHOTOS = "/photos/me"` | `GET /photos/me` | Aligned |
| Likes | `toggleLikePhotoMutation` function name posts to `POST /photos/:id/like`; `unlikePhotoMutation` deletes same route | Explicit like/unlike endpoints | Endpoint aligned; rename function later for clarity |
| Sitter profile | `CREATE_MY_SITTER_PROFILE` and `MY_SITTER_PROFILE` use `/sitters/me` | `/sitters/me` | Aligned |
| Sitter bookings | `MY_SITTER_BOOKINGS = "/sitter-bookings/me"` and role params | `GET /sitter-bookings/me?role=` | Aligned |
| Sitter actions | Services use POST accept/reject/complete/cancel routes | POST action routes | Aligned |
| Budget | Services use `/budgets`, `/budgets/statistics/*`, `/budgets/categories`, and `/budgets/transactions`; transaction forms support optional `petId` | Canonical budget routes with optional pet filters | Aligned |
| Pets | Services use `/pets` and `/pets/:id`; create/update submit `weightValue` and `weightUnit` where a weight can be parsed | Canonical pet routes and weight fields | Aligned |
| Medical record create | `createMedicalRecordMutation` posts to `API_ROUTES.MEDICAL_RECORDS_FOR_PET(data.petId)` | `POST /pets/:id/medical-records` | Aligned |
| AI | `services/ai.ts` calls `/ai/conversations` and `/messages/stream` through backend | Backend AI only | Aligned |
| Devices | `services/user.ts` uses `POST /devices` and `DELETE /devices/:id` | `/devices` | Aligned |
| Frozen commerce/payment | Store/cart/payment routes remain under compatibility/deferred service files | Out of scope | Frozen |

Search notes:

- No direct mobile `@google/genai` import was found in active source.
- No screen-level raw `axios` calls were found; `axios` is centralized in `services/api-helper.ts`.
- `accountId` appears in response/interface types and ownership checks. `features/photos/components/PhotoCommentsSheet/index.tsx` constructs local optimistic comment data with `accountId`; verify it is not sent to backend before refactoring comments.

## Duplicated State And API Logic

- Server state generally uses React Query, but query/mutation orchestration is still spread across screens and components.
- Budget queries and mutations are still mostly screen-local in `features/budget/screens/Budget` and `features/budget/screens/BudgetTransactions`; continue extracting shared orchestration into `features/budget`.
- Reminder calendar queries/mutations and ReminderHeader create flow now live in `features/reminders/hooks.ts`. Home reminder summary still contains its own reminder orchestration and can be consolidated later.
- Pet creation/edit/delete logic is now owned by `features/pets/components/PetCardCarousel/AddCard.tsx` and `features/pets/usePetCardSection.ts`; continue consolidating shared pet hooks in `features/pets`.
- Main medical record list/create/delete, per-pet list/delete, detail update/delete, and collapsible preview query orchestration now lives in `features/medical-records/hooks.ts`. Shared attachment/media components can be consolidated later.
- Notifications mutations live directly in `screens/Notifications`; move to `features/notifications`.
- AI chat state should be checked against `stores/chat.ts`; server conversations/messages belong in React Query, while local draft UI state can stay local or in client-only store.
- `stores/shop-store.ts` is frozen with commerce.
- `stores/user-info.ts` owns auth/session tokens and is appropriate durable app state.

## Theme And Hardcoded Color Issues

- Theme tokens exist in `theme/colors.ts`, `theme/shadows.ts`, spacing, fonts, and radius files.
- Active and shared components still contain raw colors that should be replaced when touched:
  - `features/budget/components/BudgetCategoryForm/index.tsx`
  - `components/BottomActionWrapper/index.tsx`
  - `features/budget/components/chart/ActiveIndicator.tsx`
  - `components/ImageGallery/index.tsx`
  - `components/Toast/*`
  - `components/Skeleton/index.tsx`
  - `features/ai/components/Markdown/index.tsx`
  - `features/photos/components/LikeButton/index.tsx`
  - `components/ui/BottomSheet/index.tsx`
  - `app/(tabs)/_layout.tsx`
  - Photo comments/photo viewer files
- Some raw colors are native API or media-overlay cases and may remain if documented, but feature screens should prefer semantic theme tokens.

## Risky Imports And Dependency Boundaries

- The `@/*` alias maps to `apps/mobile/*`, not `apps/mobile/src/*`.
- Introducing a `src/` tree now would require alias and import strategy decisions. Safer first slice: keep current root-level folders and improve domain structure incrementally.
- `components/ui` must remain free of feature imports. Verify before moving `ThemeToggle` compatibility code.
- Moving global components could break frozen Phase 2 screens. Prefer compatibility re-exports during moves.
- Avoid broad barrel exports from feature modules; use narrow exports to prevent circular dependencies.

## Initial Verification Targets

- `pnpm --filter @yeu-pet/mobile lint`
- `pnpm --filter @yeu-pet/mobile exec tsc --noEmit` because package scripts do not define `typecheck`
- Expo smoke test only after behavior/UI changes or when requested
