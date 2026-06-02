# Yeu Pet API Database

## Source of Truth

Database changes are managed in code:

- `prisma/schema.prisma` defines Prisma-supported tables, columns, enums, relations, defaults, and indexes.
- `prisma/migrations/*/migration.sql` contains the ordered migration history.
- Raw PostgreSQL belongs in migrations only when Prisma cannot model the feature, such as trigger functions, triggers, partial indexes, `NOT VALID` constraints, and other advanced PostgreSQL behavior.

Do not apply ad-hoc SQL directly in Supabase without also adding a migration.

## Business Model

The backend is a modular NestJS API for a pet-care mobile product. The core data model is:

- `accounts`: authenticated users, roles, onboarding, verification, and subscription tier/expiry.
- `pets`: pets owned by accounts.
- `medical_records` and `medical_attachments`: pet health history and uploaded files.
- `reminders`: scheduled care reminders, optionally linked to pets.
- `account_devices`, `account_settings`, `notifications`, and `notification_deliveries`: push notification preferences and delivery tracking.
- `budget_categories`, `budget_transactions`, and `budgets`: user-owned budget tracking.
- `photos`, `photo_likes`, `photo_views`, and `photo_comments`: social photo feed with derived counters.
- `pet_sitters`, `sitter_bookings`, and `sitter_reviews`: sitter profiles, booking workflow, and reviews.
- `email_logs` and `email_suppressions`: email delivery audit and suppression state.

The API, not Supabase RLS, is currently responsible for authorization. Controllers/services enforce owner/admin access and sitter/booking permissions.

## Database-Owned Behavior

The database owns invariants and derived values that are prone to race conditions:

- Foreign keys and unique constraints.
- Sitter booking time validity (`end_time > start_time`).
- Sitter review rating validity (`rating BETWEEN 1 AND 5`).
- Self-booking prevention as a defense-in-depth trigger.
- Photo like, top-level comment, and reply counters.
- Sitter rating, total review count, active booking count, and completed booking count.

NestJS owns workflow decisions:

- Authentication and authorization.
- Idempotent booking creation.
- Sitter booking row locks and capacity checks.
- Booking state transitions.
- RevenueCat webhook freshness checks.
- Queue/event dispatch and notification/email side effects.

## Supabase SQL Reconciliation

`database-sql.md` is retained as a legacy audit snapshot only. Its reusable behavior was moved into:

- `prisma/migrations/20260602000000_reconcile_supabase_sql/migration.sql`

That migration adds:

- Missing partial indexes from the manual SQL snapshot.
- Missing `photo_likes.photo_id -> photos.id` and `photo_views.photo_id -> photos.id` relations.
- Optional `sitter_bookings.cancelled_by -> accounts.id` relation.
- Booking and review check constraints.
- Photo counter triggers.
- Sitter aggregate triggers.
- Backfills for derived counters and sitter aggregates.

Historical destructive SQL and malformed trigger SQL from `database-sql.md` must not be replayed.

## Production Safety

The reconciliation migration uses `NOT VALID` constraints where old production rows could be inconsistent. This protects future writes immediately without deleting data or blocking deployment on historical drift.

After deploying, run a data audit for unvalidated constraints:

```sql
SELECT l.*
FROM photo_likes l
LEFT JOIN photos p ON p.id = l.photo_id
WHERE p.id IS NULL;

SELECT v.*
FROM photo_views v
LEFT JOIN photos p ON p.id = v.photo_id
WHERE p.id IS NULL;

SELECT b.*
FROM sitter_bookings b
LEFT JOIN accounts a ON a.id = b.cancelled_by
WHERE b.cancelled_by IS NOT NULL
  AND a.id IS NULL;

SELECT *
FROM sitter_bookings
WHERE end_time <= start_time;

SELECT *
FROM sitter_reviews
WHERE rating < 1 OR rating > 5;
```

When these queries return no rows, create a follow-up migration that validates the constraints:

```sql
ALTER TABLE photo_likes VALIDATE CONSTRAINT fk_photo_likes_photo_id;
ALTER TABLE photo_views VALIDATE CONSTRAINT fk_photo_views_photo_id;
ALTER TABLE sitter_bookings VALIDATE CONSTRAINT fk_sitter_bookings_cancelled_by;
ALTER TABLE sitter_bookings VALIDATE CONSTRAINT bookings_time_check;
ALTER TABLE sitter_reviews VALIDATE CONSTRAINT sitter_reviews_rating_check;
```

## Future Change Process

1. Update `prisma/schema.prisma` for Prisma-supported shape changes.
2. Generate a migration with Prisma when possible.
3. Add raw SQL inside the migration only for PostgreSQL features Prisma cannot express.
4. Keep migrations non-destructive by default; use staged/backfilled/validated changes for production data.
5. Run validation and checks:

```bash
pnpm --filter @yeu-pet/api db:generate
pnpm --filter @yeu-pet/api build
pnpm --filter @yeu-pet/api test
pnpm --filter @yeu-pet/api lint:check
```
