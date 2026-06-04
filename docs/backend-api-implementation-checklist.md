# Backend API Implementation Checklist

This checklist tracks the Phase 1 backend refactor against `docs/04-backend-api-plan.md`.

## Discovery

- [x] Read required project docs.
- [x] Inspect `apps/api/src` module structure.
- [x] Inspect Prisma schema and migration state.
- [x] Inspect auth guards, decorators, filters, interceptors, and pipes.
- [x] Inspect upload/storage integration.
- [x] Inspect notification implementation.
- [x] Inspect current test setup.

## Current Architecture Notes

- Global JWT, roles, and throttling guards are registered in `AppModule`.
- `@Public()` is used for auth and webhook endpoints.
- Global validation pipe uses whitelist and transform.
- Domain modules already use controller/service/repository layering.
- Most list responses use `paginate(...)`, but response shapes are not globally wrapped.
- File upload work is queued through `FileUploadService`.
- Reminder push delivery uses Firebase Admin through `NotificationsService`.
- Existing subscription module updates legacy `accounts.subscription`; it does not yet use the new subscription tables or entitlement response shape.

## First Implementation Slice

- [x] Add centralized subscription limits.
- [x] Refactor subscription repository/service around `subscription_plans`, `user_subscriptions`, and `usage_counters`.
- [ ] Add subscription endpoints:
  - [x] `GET /subscriptions/me`
  - [x] `GET /subscriptions/entitlements`
  - [x] `POST /subscriptions/mock-upgrade`
  - [x] `POST /subscriptions/mock-downgrade`
  - [x] `POST /subscriptions/webhooks/revenuecat`
- [x] Preserve or document old webhook route behavior.
- [x] Export entitlement service for feature modules.
- [x] Enforce Free pet limit in `PetsService.create`.
- [x] Update settings DTO/service for new settings fields.
- [x] Add tests for entitlement response and pet limit enforcement.

## Second Implementation Slice

- [x] Add reminder entitlement checks for active and recurring reminders.
- [x] Make reminder `petId` optional with ownership validation when provided.
- [x] Persist reminder timezone and recurrence fields.
- [x] Add reminder filters for `from`, `to`, `petId`, `type`, and `status`.
- [x] Add `GET /reminders/upcoming`.
- [x] Add reminder status actions:
  - [x] `POST /reminders/:id/complete`
  - [x] `POST /reminders/:id/skip`
  - [x] `POST /reminders/:id/cancel`
- [x] Add budget transaction `petId` support.
- [x] Validate budget category ownership before transaction create/update/filter.
- [x] Validate pet ownership before transaction create/update/filter.
- [x] Enforce monthly budget transaction limit.
- [x] Soft-delete budget categories and transactions.
- [x] Add tests for reminder and budget transaction service behavior.

## Phase 1 API Work

- [ ] Account/profile endpoints aligned with `/me` plan.
- [x] Settings supports notification toggles, language, and theme.
- [ ] Pets support numeric weight fields and entitlement limit.
- [x] Reminders support optional pet, date range filters, timezone, recurrence, complete/skip/cancel actions, and active reminder limits.
- [ ] Medical records enforce pet ownership, record limits, image limits, attachment sort order, and soft delete.
- [ ] Budget supports `petId`, category ownership, monthly transaction limits, summaries/charts, and account-scoped category uniqueness.
- [ ] Photos support `/photos/social`, `/photos/me`, visibility filters, `petId`, report endpoint, like/unlike routes, and soft delete.
- [ ] Photo comments support create, replies, soft delete, and owner/photo-owner permissions.
- [ ] Sitter profile supports `/sitters/me`, location filters, new profile fields, and one profile per account.
- [ ] Sitter booking supports `/sitter-bookings/me`, accept/reject/cancel/complete/review routes, participant-only detail, and external payment copy in response where relevant.
- [ ] Sitter booking messages support participant-only list/create.
- [ ] Pet Care AI supports conversations, messages, streaming, quota, safety guard, and backend-only provider adapter.
- [ ] Reports/blocking prepared for social and sitter trust flows.

## Verification

- [x] `pnpm --filter @yeu-pet/api lint:check`
- [x] `pnpm --filter @yeu-pet/api test`
- [x] `pnpm --filter @yeu-pet/api build`
- [x] `pnpm --filter @yeu-pet/api exec prisma validate`
- [x] `pnpm --filter @yeu-pet/api exec prisma migrate status`
