# Master Refactoring Checklist for Yeu-Pet Backend

> **Project:** Yeu-Pet Backend (`apps/api`)
> **Goal:** Refactor into a production-grade NestJS codebase following audited modular monolith and DDD conventions
> **Reference Plan:** `backend-refactor-plan.md`
> **Status:** Phase Gate Reviewed — Phase 2 Ready With Conditions

---

## Progress Tracking

- [x] **Phase 1: Foundation Infrastructure (Weeks 1-2)** — *Gate Reviewed*
- [ ] **Phase 2: Test Rigging & Common Infrastructures (Weeks 3-4)** — *Ready With Conditions*
- [ ] **Phase 3: Domain Consolidation & Refactoring (Weeks 5-7)** — *Pending*
- [ ] **Phase 4: Concurrency & Webhook Integration (Weeks 8-9)** — *Pending*
- [ ] **Phase 5: Verification & CI Pipeline (Weeks 10-12)** — *Pending*

---

## How to use this checklist

1. Work through phases **in order** — each phase depends on prior architectural foundations.
2. Mark each item `[x]` when completed.
3. Verify every task block with:
   - `pnpm --filter @yeu-pet/api lint`
   - `pnpm --filter @yeu-pet/api build`
4. After DB schema modifications, run `pnpm --filter @yeu-pet/api db:generate` to refresh the Prisma client.

---

## Phase 1: Foundation Infrastructure & Reconciliation (Weeks 1-2)

### 1.1 Sentry Integration & Filter Shadowing Fix
- [x] Add `@sentry/nestjs` and `@sentry/profiling-node` to `apps/api/package.json`
- [x] Create `apps/api/src/instrument.ts` with Sentry.init()
- [x] Update `apps/api/src/main.ts` to import `./instrument` as first import
- [x] Add `SentryModule.forRoot()` to `apps/api/src/app.module.ts`
- [x] **[AUDIT CORRECTION]** Remove manual exception filters from `main.ts`'s `app.useGlobalFilters(new AllExceptionsFilter(), new PrismaExceptionFilter())`.
- [x] **[AUDIT CORRECTION]** Register `SentryGlobalFilter`, `AllExceptionsFilter`, and `PrismaExceptionFilter` globally via `app.module.ts` providers utilizing `APP_FILTER` to resolve NestJS DI shadowing.
- [x] **[AUDIT CORRECTION]** Wrap exception capturing inside `AllExceptionsFilter` and `PrismaExceptionFilter` in a status code check: only capture in Sentry if `statusCode >= 500`.

### 1.2 RolesGuard Decoupling
- [x] Create `apps/api/src/decorators/roles.decorator.ts` with `@Roles()` and `@AdminOnly()`
- [x] Create `apps/api/src/guards/roles.guard.ts` comparing against `request.user.role`
- [x] Register `RolesGuard` as `APP_GUARD` in `app.module.ts`
- [x] Remove admin role check from `jwt-auth.guard.ts` (JWT guard now only parses tokens)
- [x] **[PHASE GATE P0]** Remove or replace legacy `admin.decorator.ts`; all admin routes must import `AdminOnly` from `roles.decorator.ts` so `RolesGuard` can enforce the metadata.
- [x] **[PHASE GATE P0]** Add a focused guard/controller test proving `@AdminOnly()` rejects non-admin authenticated users.

### 1.3 PostHog Analytics Integration & Telemetry Noise reduction
- [x] Add `posthog-node` to `apps/api/package.json`
- [x] Create `posthog.config.ts`, `posthog.module.ts`, and `TrackService` under `shared/track/`
- [x] Add TrackModule to global `SharedModule`
- [x] **[AUDIT CORRECTION]** Modify `ErrorLoggingInterceptor` to check exception status codes. Do NOT capture stack traces or dispatch PostHog/Sentry exceptions for client-side errors (`statusCode < 500`). Log validation warnings as warnings, not errors.

### 1.4 Cache Decorators & Opt-in HttpCacheInterceptor
- [x] Create `cache.constants.ts` and `@IgnoreCache()` / `@CacheTTL()` decorators
- [x] Create `HttpCacheInterceptor` under `src/interceptors/`
- [x] **[AUDIT CORRECTION]** Refactor `HttpCacheInterceptor` to be **opt-in**. Remove global `APP_INTERCEPTOR` registration from `app.module.ts`. Caching must only trigger on routes explicitly decorated with a new `@Cacheable()` decorator.
- [x] **[AUDIT CORRECTION]** Add Redis key eviction hooks triggered by write routes (`POST/PUT/DELETE`) to clean up dynamic dashboard states.

### 1.5 Cargo-Culted Dependency Purging
- [x] **[AUDIT CORRECTION]** Remove redundant `forwardRef` wraps from modules with unidirectional relationships:
  - `RemindersModule` imports of `NotificationsModule` and `UserSettingsModule` (unidirectional).
  - `NotificationsModule` imports of `UserDevicesModule` (unidirectional).
  - `PhotoCommentsModule` imports of `PhotosModule` (unidirectional).
  - `SitterBookingsModule` imports of `PetSittersModule` and `PetsModule` (unidirectional).
  - `BudgetsModule` imports of `BudgetTransactionsModule` and `BudgetCategoriesModule` (unidirectional).

---

## Phase 2: Test Rigging & Common Infrastructures (Weeks 3-4)

### 2.0 Phase Gate Corrections
- [x] Fix the Phase 1 RBAC metadata regression before adding new Phase 2 infrastructure.
- [x] Fix authenticated budget category list scoping so users cannot read other users' categories.
- [x] Establish a green baseline for the existing Jest suite or quarantine known-empty generated specs behind the new unit config.
- [x] Add architecture smoke tests for global guards, filters, interceptors, and decorator metadata.

### 2.1 Automated Test Setup
- [x] Create `apps/api/test/jest-unit.json` and `test/jest-e2e.json`
- [x] Define test scripts in `package.json` mapping unit and E2E targets
- [x] Create test bootstrap app factories (`test-app.factory.ts`) and mock providers
- [x] Create mock database factories for: User, Pet, Sitter, SitterBooking, Budget, Photo, Reminder

### 2.2 Database Concurrency Row-Locking Helper
- [x] Define helper methods in `PrismaService` that execute native PostgreSQL `SELECT ... FOR UPDATE` raw queries inside transaction boundaries, safely handling row-level lock lifecycles.

### 2.3 Event Bus Decoupling
- [x] Create `src/interfaces/email-jobs.interface.ts`
- [x] Refactor `QueueService` under `shared/queue/` to expose typed dispatch actions
- [x] Register listeners on NestJS `event-bus` to capture domain events (e.g. `BookingCreatedEvent`) and dispatch queues asynchronously, preventing cross-module code coupling.

### 2.4 Resend Email Integration
- [ ] Add `email_logs` and `email_suppressions` tables to the database schema
- [ ] Run migrations and regenerate the Prisma client (`pnpm db:generate`)
- [ ] Create `Resend` service providers under `shared/email/` and connect to logging tables.

---

## Phase 3: Domain Bounded Context Consolidation & Refactoring (Weeks 5-7)

### 3.1 Grouped Bounded Context Consolidation (Execute First)
- [ ] **Budget Module:** Move `budget-categories/`, `budget-transactions/`, and `budgets/` into a single consolidated `budget/` directory. Merge into a unified `BudgetModule`.
- [ ] **Photos Module:** Merge `photo-comments/` into `photos/` under a consolidated `PhotosModule`.
- [ ] **Sitter Booking Module:** Merge `pet-sitters/`, `sitter-bookings/`, and `sitter-reviews/` into a consolidated `sitter-booking/` module directory.

### 3.2 Decouple Pets and Medical Records
- [ ] Remove `forwardRef` module imports.
- [ ] Relocate the sub-resource endpoint `GET /pets/:id/medical-records` out of `PetsController` and declare it directly within `MedicalRecordsController` as `@Get('pets/:id/medical-records')`.
- [ ] Configure `MedicalRecordsModule` to have a simple unidirectional import of `PetsModule` to access `PetsRepository`.

### 3.3 Standardize Repositories & DTOs (Refactor Once)
- [ ] Implement strict repository interfaces for Consolidated Modules:
  - Users, Pets, MedicalRecords, Reminders, Budget, Photos, SitterBooking.
- [ ] Replace CASL simple ownership rules with explicit `userId === ownerId` checks in the services. Keep CASL solely for admin-level ABAC checks.
- [ ] Add Swagger decorators and composed Response DTOs.
- [ ] Verify: Write companion `.spec.ts` unit tests for every refactored service before completing this step.

---

## Phase 4: Concurrency & Webhook Integration (Weeks 8-9)

### 4.1 RevenueCat Integration
- [ ] Create `/api/v1/subscription/webhook` endpoint with secret signature verification
- [ ] **[AUDIT CORRECTION]** Implement webhook timestamp/expiration guards. Only write to user subscription tables if the webhook event date is newer than the database's `subscription_expires_at` value.

### 4.2 Sitter Booking Transactional Row-Locking Concurrency
- [ ] Add `idempotency_key` (unique), `expires_at`, `confirmed_at`, and `cancelled_at` fields to `sitter_bookings` Prisma model. Run database migration and regenerate client.
- [ ] In `SitterBookingService.createBooking()`:
  - Add validation checks for `idempotency_key`.
  - Open a transaction and execute `SELECT * FROM pet_sitters WHERE id = $1 FOR UPDATE` to lock the sitter row.
  - Dynamically check the sitter's active booking count overlap for the requested start/end time. Throw a ConflictException if counts exceed `max_concurrent_bookings`.
  - Write sitter booking with `expiresAt = now + 15min` (pending status) and commit transaction to release row lock.
  - Dispatch domain events to the Event Bus.

### 4.3 Scheduled Cleanups
- [ ] Add `@Cron(CronExpression.EVERY_MINUTE)` task in `SitterBookingModule` to search and flag all pending `sitter_bookings` where `expiresAt < now`. Mark status as cancelled and release slots.

---

## Phase 5: Verification & CI Pipeline (Weeks 10-12)

### 5.1 Verification Checks
- [ ] Verify that `package.json` contains standard run scripts:
  - `pnpm --filter @yeu-pet/api lint`
  - `pnpm --filter @yeu-pet/api build`
  - `pnpm --filter @yeu-pet/api test` (for unit tests)
  - `pnpm --filter @yeu-pet/api test:e2e` (for E2E tests)

### 5.2 Test Execution
- [ ] Run all unit test suites in the codebase.
- [ ] Execute E2E integration tests, including:
  - Simulating concurrent E2E booking requests on a single sitter to verify row-locking integrity.
  - Simulating out-of-order RevenueCat webhook deliveries.
  - Verifying the opt-in cache invalidation triggers.
