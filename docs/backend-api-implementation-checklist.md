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
- Subscription service now resolves current plan, entitlement limits, and usage from the redesigned subscription tables while keeping legacy account fields in sync.

## First Implementation Slice

- [x] Add centralized subscription limits.
- [x] Refactor subscription repository/service around `subscription_plans`, `user_subscriptions`, and `usage_counters`.
- [x] Add subscription endpoints:
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

## Third Implementation Slice

- [x] Add `petId` filter support to budget monthly summary.
- [x] Add `petId` filter support to budget monthly statistics.
- [x] Add `petId` filter support to budget yearly statistics.
- [x] Validate pet ownership before pet-scoped budget aggregate queries.
- [x] Add medical record ownership checks on create.
- [x] Enforce medical record count entitlement.
- [x] Enforce medical image-per-record entitlement on create/update.
- [x] Soft-delete medical records.
- [x] Filter deleted medical records from lists and detail lookups.
- [x] Preserve attachment sort order for generated attachments.
- [x] Add tests for budget aggregate pet filters and medical record limits.

## Fourth Implementation Slice

- [x] Add `petId` support to photo create/update with ownership checks.
- [x] Enforce photo upload entitlement limit.
- [x] Add `/photos/social` public feed alias.
- [x] Add `visibility` filters to `/photos/me`.
- [x] Soft-delete photos and filter deleted photos from reads/lists.
- [x] Add idempotent like/unlike routes.
- [x] Preserve toggle-like compatibility route.
- [x] Add photo report endpoint backed by `reports`.
- [x] Add tests for photo pet ownership, entitlement, report, unlike, and private visibility guards.
- [x] Add explicit `POST /photos/:id/comments/:commentId/replies` route.
- [x] Preserve comment/reply soft delete and delete permission for comment owner, photo owner, and admin.
- [x] Add tests for photo comment replies, nested reply rejection, and photo-owner delete.

## Phase 1 API Work

- [ ] Account/profile endpoints aligned with `/me` plan.
- [x] Settings supports notification toggles, language, and theme.
- [ ] Pets support numeric weight fields and entitlement limit.
- [x] Reminders support optional pet, date range filters, timezone, recurrence, complete/skip/cancel actions, and active reminder limits.
- [x] Medical records enforce pet ownership, record limits, image limits, attachment sort order, and soft delete.
- [x] Budget supports `petId`, category ownership, monthly transaction limits, summaries/charts, and account-scoped category uniqueness.
- [x] Photos support `/photos/social`, `/photos/me`, visibility filters, `petId`, report endpoint, like/unlike routes, and soft delete.
- [x] Photo comments support create, replies, soft delete, and owner/photo-owner permissions.
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
