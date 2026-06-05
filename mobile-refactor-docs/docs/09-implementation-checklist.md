# 09 — Implementation Checklist

Use this checklist during the mobile refactor.

## Phase 0 — Discovery

- [ ] Read this documentation pack.
- [ ] Read backend mobile API contract.
- [ ] Inspect `apps/mobile/app` routes.
- [ ] Inspect `apps/mobile/screens`.
- [ ] Inspect `apps/mobile/components`.
- [ ] Inspect `apps/mobile/features`.
- [ ] Inspect API/services layer.
- [ ] Inspect theme system.
- [ ] Inspect stores.
- [ ] Inspect current React Query usage.
- [ ] Inspect auth/token handling.
- [ ] Inspect notification registration.
- [ ] Create `apps/mobile/docs/mobile-refactor-audit.md`.
- [ ] Create `apps/mobile/docs/mobile-refactor-plan.md`.

## Phase 1 — Scope control

- [ ] Identify Phase 1 screens.
- [ ] Identify out-of-scope screens.
- [ ] Mark ecommerce/store/cart/checkout as frozen.
- [ ] Mark clinic/spa/training as frozen.
- [ ] Confirm bottom tab scope.
- [ ] Confirm no WebSocket implementation.
- [ ] Confirm no direct AI provider call from mobile.

## Phase 2 — Folder foundation

- [ ] Confirm whether `src/` exists or should be created.
- [ ] Confirm TypeScript path alias.
- [ ] Create/refactor `src/api`.
- [ ] Create/refactor `src/components/ui`.
- [ ] Create/refactor `src/components/layout`.
- [ ] Create/refactor `src/components/feedback`.
- [ ] Create/refactor `src/components/form`.
- [ ] Create/refactor `src/components/media`.
- [ ] Create/refactor `src/components/navigation`.
- [ ] Create/refactor `src/features`.

## Phase 3 — API foundation

- [ ] Refactor Axios client.
- [ ] Add auth token interceptor.
- [ ] Add refresh/session expired behavior.
- [ ] Add normalized error handling.
- [ ] Add query keys.
- [ ] Create API modules.
- [ ] Remove raw Axios calls from screens.
- [ ] Audit legacy endpoints.
- [ ] Replace legacy endpoints with canonical endpoints.

## Phase 4 — UI foundation

- [ ] Normalize AppScreen.
- [ ] Normalize AppHeader.
- [ ] Normalize AppCard.
- [ ] Normalize AppButton.
- [ ] Normalize AppIconButton.
- [ ] Normalize AppText/Typography.
- [ ] Normalize AppInput/Textarea.
- [ ] Normalize BottomSheet.
- [ ] Normalize EmptyState.
- [ ] Normalize ErrorState.
- [ ] Normalize LoadingState/Skeleton.
- [ ] Normalize ConfirmDialog.
- [ ] Normalize StatusBadge.
- [ ] Normalize FilterChip.
- [ ] Normalize PetAvatar.
- [ ] Ensure light/dark support.
- [ ] Remove hardcoded screen colors where touched.

## Phase 5 — Feature refactor order

### Settings

- [ ] Move/refactor settings feature.
- [ ] Integrate `/settings` and `/me`.
- [ ] Theme setting works.
- [ ] Language setting works.
- [ ] Notification toggles work.
- [ ] Logout works.

### Home + Pets

- [ ] Refactor Home screen.
- [ ] Refactor PetCardCarousel.
- [ ] Refactor PetInfoForm.
- [ ] Integrate pet APIs.
- [ ] Support avatar upload.
- [ ] Support `weightValue` and `weightUnit`.
- [ ] Add pet limit/paywall handling.

### Reminders

- [ ] Refactor Reminder screen.
- [ ] Refactor ReminderCalendar.
- [ ] Refactor ReminderForm.
- [ ] Integrate reminder APIs.
- [ ] Complete/skip/cancel actions.
- [ ] No invalid date display.

### Medical Records

- [ ] Refactor medical screens.
- [ ] Refactor MedicalRecordForm.
- [ ] Refactor timeline/list.
- [ ] Integrate attachment uploads.
- [ ] Show image viewer.
- [ ] Handle attachment status.

### Budget

- [ ] Refactor budget screens.
- [ ] Refactor budget forms.
- [ ] Refactor charts.
- [ ] Integrate budget APIs.
- [ ] Handle zero/over-budget.
- [ ] Format VND.

### Photos

- [ ] Refactor Photos screen.
- [ ] Integrate social/my photos APIs.
- [ ] Upload photo.
- [ ] Like/unlike.
- [ ] Comments/replies/delete.
- [ ] Owner delete photo.
- [ ] Report action if UI supports.

### Sitter

- [ ] Refactor sitter screens.
- [ ] Register/update sitter profile.
- [ ] Search/list sitters.
- [ ] Booking request/actions.
- [ ] Review after completed.
- [ ] HTTP messages only.
- [ ] External payment copy.

### AI

- [ ] Remove direct mobile AI provider usage.
- [ ] Integrate backend AI APIs.
- [ ] Conversation list.
- [ ] Chat screen.
- [ ] Streaming or documented fallback.
- [ ] Safety disclaimer.
- [ ] Quota/paywall handling.

### Notifications

- [ ] Register device token.
- [ ] Notification list/badge.
- [ ] Mark read/read all/delete.
- [ ] Respect settings toggles.

## Phase 6 — Verification

- [ ] Run `pnpm --filter @yeu-pet/mobile lint`.
- [ ] Run TypeScript check if script exists.
- [ ] Run Expo start/smoke test.
- [ ] Test iOS if practical.
- [ ] Test Android if practical.
- [ ] Verify auth flow.
- [ ] Verify all Phase 1 screens.
- [ ] Verify dark mode.
- [ ] Verify no direct AI provider usage.
- [ ] Verify no WebSocket implementation.
- [ ] Verify out-of-scope files skipped.

## Phase 7 — Final report

- [ ] Folder changes documented.
- [ ] Component moves documented.
- [ ] API changes documented.
- [ ] Legacy endpoint cleanup documented.
- [ ] Skipped out-of-scope files documented.
- [ ] Known issues documented.
- [ ] Next task recommended.
