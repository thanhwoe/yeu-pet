# 11 — Database Implementation Checklist

This checklist tracks the phase 1 database redesign work against `docs/03-database-redesign-plan.md`.

## Current Pass

- [x] Audit existing `apps/api/prisma/schema.prisma`.
- [x] Audit existing Prisma migration history.
- [x] Add additive phase 1 foundation schema changes.
- [x] Generate or add Prisma migration for foundation changes.
- [x] Validate Prisma schema.
- [x] Generate Prisma client.
- [ ] Update backend services/DTOs for new fields and entitlement tables.
- [ ] Run backend tests after service updates.

## Schema Items

- [x] Remove global unique category name; use `[account_id, name]`.
- [x] Add `pet_id` to budget transactions.
- [x] Add `pet_id` to photos.
- [x] Add recurrence, timezone, completion, skip, and cancellation fields to reminders.
- [x] Add theme and granular notification settings.
- [x] Add numeric pet weight fields and pet soft delete field.
- [x] Add medical attachment sort order.
- [x] Add subscription plan and user subscription tables.
- [x] Add usage counters.
- [x] Add AI conversation, message, and usage log tables.
- [x] Add sitter booking messages.
- [x] Add sitter profile location/search fields.
- [x] Add booking notes/care instruction fields.
- [x] Add moderation-ready report/block tables.
- [x] Add indexes for phase 1 list views.
- [x] Ensure new relations use cascade or set-null behavior intentionally.

## Notes

- Keep existing lowercase plural Prisma model naming for this pass to reduce code churn.
- Keep `account_settings.language` as a string for now because current service code expects it; validate allowed values at the DTO/service layer in a later backend pass.
- Keep legacy `pets.weight` while adding numeric `weight_value` and `weight_unit`.
- `pnpm --filter @yeu-pet/api exec prisma migrate status` reports two unapplied remote migrations as of this pass: `20260602000000_reconcile_supabase_sql` and `20260603000000_phase1_database_foundation`.
