# Yeu-Pet Backend Refactoring Plan

> **Reference Project:** `smart-booking` (`/Users/thanh/projects/smart-booking`)
> **Target Project:** `yeu-pet` (`apps/api`)
> **Date:** 2026-05-30
> **Status:** Phase Gate Reviewed — Phase 2 Ready With Conditions

> **Phase Gate Review (2026-06-01):** Phase 1 is broadly implemented. The review found a stale `admin.decorator.ts` that emitted metadata `RolesGuard` did not read; this was corrected by making the legacy decorator a compatibility re-export and moving `AuthController` to the canonical `roles.decorator.ts` import. The review also found and corrected a budget-category list data-boundary leak by scoping list queries to the current user. Phase 2.0 established a green curated unit baseline through `test/jest-unit.json`; the old placeholder suite remains available as `test:legacy` until Phase 2 replaces those skeletal specs with real unit coverage.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Smart-Booking Architecture Analysis](#2-smart-booking-architecture-analysis)
3. [Yeu-Pet Current State Assessment](#3-yeu-pet-current-state-assessment)
4. [Comparative Gap Analysis](#4-comparative-gap-analysis)
5. [Recommended Target Architecture](#5-recommended-target-architecture)
6. [Detailed Implementation Plan](#6-detailed-implementation-plan)
7. [Database Refactor Plan](#7-database-refactor-plan)
8. [Migration Strategy](#8-migration-strategy)
9. [Testing Strategy](#9-testing-strategy)
10. [Performance & Security](#10-performance--security)
11. [Risks and Tradeoffs](#11-risks-and-tradeoffs)
12. [Incremental Migration Roadmap](#12-incremental-migration-roadmap)

---

## 1. Executive Summary

The Yeu-Pet backend (NestJS, PostgreSQL, Prisma, Redis) has a solid foundation but requires refactoring into a production-grade, highly maintainable codebase. Following a rigorous architectural audit of the initial plan, the following structural improvements have been integrated to prevent stale-data bugs, telemetric noise, and application crashes:

- **Selective (Opt-in) HTTP Response Caching:** Replaced the dangerous "global-by-default" caching interceptor with an **opt-in** cache decorator (`@Cacheable()`). This protects dynamic user states from stale-data issues and incorporates strict cache invalidation on mutations.
- **Unexpected-Only Telemetry:** Refactored Sentry and PostHog error logging to trigger only on true system-level failures (`statusCode >= 500`). Client-side validation errors (`400`, `401`, `403`, `404`) are safely filtered out of exception trackers.
- **NestJS DI Exception Filters:** Unified manual global filters with `SentryGlobalFilter` in `app.module.ts` via `APP_FILTER` to prevent shadowing and resolve startup injection warnings.
- **Database-Level Sitter Booking Concurrency:** Corrected the fatal assumption that Yeu-Pet uses a slot-based booking system. Replaced the high-overhead, Redis-dependent Redlock logic with **PostgreSQL pessimistic row locking (`SELECT ... FOR UPDATE` on `pet_sitters`)** to guarantee transaction integrity without distributed lock lease-time risks.
- **Roadmap Efficiency:** Reordered Phase 4 (Module Consolidation) to run before/simultaneously with Phase 3 (Module Refactoring). This prevents writing repository and DTO layers twice for unconsolidated features.
- **TDD-Lite Fast Feedback:** Moved testing infrastructure setup (test factories, app fixtures) from the end of the project to Phase 2 to allow unit testing of refactored repositories in stride.
- **Decoupled Modules & Bounded Contexts:** Preserved the `event-bus` (rather than deprecating it) for inter-module side-effects, and decoupled `PetsModule` from `MedicalRecordsModule` by moving sub-resource routing to `MedicalRecordsController`.

---

## 2. Smart-Booking Architecture Analysis

### 2.1 Folder Structure

```
src/
├── main.ts                          # Bootstrap with versioning, Swagger, filters, pipes
├── instrument.ts                    # Sentry initialization
├── app.module.ts                    # Root module with global guards/interceptors/filters
├── app.controller.ts                # Health check
├── app.service.ts                   # Health check service
├── constants/                       # App-wide constants
│   └── cache.constants.ts           # CACHE_KEY and CACHE_TTL definitions
├── database/
│   └── prisma/
│       ├── prisma.module.ts         # Global PrismaModule
│       └── prisma.service.ts        # Extends PrismaClient, query logging
├── decorators/                      # Custom decorators
│   ├── cache.decorator.ts           # @Cacheable(), @IgnoreCache()
│   ├── current-user.decorator.ts    # @CurrentUser()
│   ├── pagination.decorator.ts      # @PaginationQuery()
│   ├── public.decorator.ts          # @Public()
│   ├── roles.decorator.ts           # @Roles(), @AdminOnly()
│   └── swagger.decorator.ts         # @ApiOkResponse(), @ApiCreatedResponse()
├── filters/
│   ├── all-exceptions.filter.ts     # Catch-all with Sentry (status >= 500 only)
│   └── prisma-exceptions.filter.ts  # Prisma errors → HTTP mapping
├── guards/
│   ├── jwt-auth.guard.ts            # JWT guard with public bypass
│   ├── roles.guard.ts               # Role-based access (RBAC)
│   └── throttler.guard.ts           # Custom rate limiting (user/IP-based)
├── interceptors/
│   ├── error-logging.interceptor.ts # Log errors (unexpected -> PostHog + Logger)
│   ├── http-cache.interceptor.ts    # Opt-in GET caching with invalidation
│   └── track.interceptor.ts         # Track API calls to PostHog
├── interfaces/                      # TypeScript interfaces & DI tokens
│   ├── cache.interface.ts           # ICacheService interface + Symbol
│   └── email-jobs.interface.ts      # Typed job payloads
├── utils/
│   ├── format.ts                    # Date, currency, validation formatters
│   └── pagination.ts                # PaginationDto, PaginationResponseDto, paginate()
└── modules/                         # Feature modules (domain-driven)
    ├── auth/
    ├── bookings/
    ├── email-logs/
    └── shared/
        ├── cache/
        ├── email/
        ├── lock/                    # Optional distributed lock limits
        ├── queue/
        ├── redis/
        └── track/
```

### 2.2 Key Architectural Patterns

#### Pattern 1: Repository with Interface Contract

```typescript
interface IUsersRepository {
  create(data: UserCreateInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(params?: { skip?: number; take?: number }): Promise<[User[], number]>;
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}
}
```

#### Pattern 2: Service with Opt-in Cache Decorator

```typescript
// Caching is selective and opt-in to avoid dynamic state corruption
@Get(':id')
@Cacheable({ key: CACHE_KEY.USER_BY_ID, ttl: CACHE_TTL.USER })
async findOne(@IdParam() id: string) {
  const user = await this.usersRepository.findById(id);
  if (!user) throw new NotFoundException(`User not found`);
  return user;
}
```

#### Pattern 3: Pessimistic Row-level Locking (PostgreSQL)

Instead of complex Redis-distributed lock cycles, concurrent sitter booking limits are enforced natively inside a database transaction:

```typescript
// Enforce booking limitations transactionally
return this.prisma.$transaction(async (tx) => {
  // Lock pet sitter row to prevent concurrent booking count race conditions
  const sitter = await tx.$queryRaw`
    SELECT * FROM pet_sitters WHERE id = ${sitterId}::uuid FOR UPDATE
  `;
  
  // Validate active booking count overlaps dynamically
  const activeOverlappingBookings = await tx.sitter_bookings.count({
    where: {
      sitter_id: sitterId,
      status: { in: ['pending', 'confirmed', 'active'] },
      start_time: { lt: endTime },
      end_time: { gt: startTime }
    }
  });

  if (activeOverlappingBookings >= sitter.max_concurrent_bookings) {
    throw new ConflictException('Pet Sitter is fully booked for this timeframe');
  }

  return tx.sitter_bookings.create({ data });
});
```

#### Pattern 4: Decoupled Queue Dispatching via Event Bus

To maintain clean DDD boundaries, feature modules publish events to the `event-bus`, and listener modules handle queue dispatching asynchronously.

```typescript
// In SitterBookingsService
this.eventBus.publish(new BookingCreatedEvent(booking));

// In SitterBookingsListener
@OnEvent('booking.created')
async handleBookingCreated(event: BookingCreatedEvent) {
  await this.queueService.dispatchBookingConfirmed({
    bookingId: event.booking.id,
    userEmail: event.booking.user.email,
  });
}
```

---

## 3. Yeu-Pet Current State Assessment

### 3.1 Current Module Problems

| Problem | Location | Impact & Resolution |
| :--- | :--- | :--- |
| **Real Circular Dependency** | `PetsModule ↔ MedicalRecordsModule` | High coupling. Resolved by moving `GET /pets/:id/medical-records` sub-resource logic/routing directly into `MedicalRecordsController`. |
| **Fake Circular Dependencies** | `Reminders`, `Budgets`, `UserDevices` | Cargo-culted `forwardRef` usage. Removed all redundant forward imports since their dependencies are unidirectional. |
| **No `@Roles()` decorator** | `guards/jwt-auth.guard.ts` | Decoupled in Phase 1.2; JwtAuthGuard now only validates token authenticity. |
| **Telemetry Noise Flood** | `ErrorLoggingInterceptor` | Audit Finding: Validation errors flood Sentry. Resolved by wrapping Sentry exception capture in a `status >= 500` filter. |
| **Shadowed Sentry Filter** | `main.ts` | Audit Finding: Manual `AllExceptionsFilter` registration in main.ts shadows and bypasses `SentryGlobalFilter`. Resolved by registering filters as `APP_FILTER` in `app.module.ts`. |
| **Global Cache Invalidation** | `HttpCacheInterceptor` | Audit Finding: Global GET caching causes stale dashboard states. Resolved by migrating to selective `@Cacheable()` opt-in caching. |

---

## 4. Comparative Gap Analysis

| Feature | Initial Plan Strategy | Audited & Improved Strategy |
| :--- | :--- | :--- |
| **HTTP Cache** | Global-by-default (Opt-out) | **Selective Opt-in (`@Cacheable()`)** |
| **Concurrency Lock** | Redlock on non-existent `slotId` | **PostgreSQL Pessimistic Row Lock (`SELECT FOR UPDATE` on `pet_sitters`)** |
| **Queue Dispatch** | Tight coupling to services | **Decoupled domain events via Event Bus** |
| **Telemetry Error Tracking** | Captures all errors globally | **unexpected-only filters (HTTP status >= 500)** |
| **Global Exception Filter** | Manually registered in `main.ts` | **NestJS DI registered via `APP_FILTER` in `app.module.ts`** |
| **Refactoring Roadmap** | Refactor repositories, then consolidate | **Consolidate modules first, then refactor once** |
| **Test Scheduling** | Phase 6 (Waterfall end-of-project) | **Phase 2 Setup (Unit test factories in stride)** |

---

## 5. Recommended Target Architecture

### 5.1 High-Level Architecture

```
┌───────────────────────────────────────────┐
│                API Gateway                │
│    (Helmet, CORS, Versioning, Throttle)   │
├───────────────────────────────────────────┤
│            Global Interceptors            │
│       Track | Cache (Opt-in) | Telemetry  │
├───────────────────────────────────────────┤
│          Global Guards / Filters          │
│       JWT Auth | Roles | Exception        │
├───────────────────────────────────────────┤
│            Bounded Contexts               │
│   Auth, Users, Pets, MedicalRecords,      │
│   Reminders, Budget (Consolidated),       │
│   Photos (Consolidated),                  │
│   SitterBooking (Consolidated),           │
│   Subscription (RevenueCat)               │
├───────────────────────────────────────────┤
│         Decoupled Infrastructure          │
│   Redis | Cache | Queue | Event Bus       │
│   Email (Resend) | Sentry                 │
├───────────────────────────────────────────┤
│                Data Layer                 │
│         PrismaService + PostgreSQL        │
└───────────────────────────────────────────┘
```

---

## 6. Detailed Implementation Plan

### Phase 1: Foundation Infrastructure (Weeks 1-2) - *Gate Reviewed*

#### 1.1 Add Sentry Integration
- Create `src/instrument.ts`
- Add `@sentry/nestjs` and `@sentry/profiling-node` to dependencies.
- Update `main.ts` to import `instrument` as first import.
- **Audit Correction:** Remove manual `AllExceptionsFilter` and `PrismaExceptionFilter` instantiation from `main.ts`'s `app.useGlobalFilters()`.
- **Audit Correction:** Register `SentryGlobalFilter`, `AllExceptionsFilter`, and `PrismaExceptionFilter` as consecutive `APP_FILTER` providers in `app.module.ts` to preserve NestJS dependency injection.

#### 1.2 Add RolesGuard
- Create `src/decorators/roles.decorator.ts` and `src/guards/roles.guard.ts`.
- Remove admin role checking from `jwt-auth.guard.ts`.
- Register `RolesGuard` globally in `app.module.ts`.
- **Phase Gate Correction:** Remove or replace the stale `src/decorators/admin.decorator.ts`. All routes must use `AdminOnly` from `roles.decorator.ts`; otherwise `RolesGuard` does not see the metadata.
- **Phase Gate Correction:** Add a focused RBAC test proving admin-only metadata denies non-admin authenticated users.

#### 1.3 Add TrackService (PostHog)
- Create `src/modules/shared/track/` PostHog providers and service.

#### 1.4 Add HttpCacheInterceptor
- **Audit Correction:** Redesign `HttpCacheInterceptor` to act as an **opt-in** decorator mechanism (`@Cacheable()`).
- Add Redis query invalidation hooks via mutation-route decorators/interceptors (`POST/PUT/PATCH/DELETE`) that clear keys containing matching `userId` or resource prefixes.

#### 1.5 Add TrackInterceptor & Telemetry Scrubber
- Create `src/interceptors/track.interceptor.ts`.
- **Audit Correction:** Update `ErrorLoggingInterceptor` to ignore exceptions with status codes `< 500` (such as BadRequestException, UnauthorizedException, NotFoundException). Prevent sending standard validation warnings to PostHog and Sentry.

### Phase 2: Test Rigging & Common Infrastructures (Weeks 3-4)

#### 2.0 Phase Gate Corrections (Execute First)
- Verify the RBAC metadata regression remains fixed before adding new infrastructure.
- Verify authenticated list endpoints remain scoped to the current account before broadening repository refactors.
- Establish a green baseline for the existing Jest suite, or isolate empty generated specs behind a new `jest-unit.json` so failing placeholder tests do not mask regressions.
- Keep the old placeholder suite visible through `test:legacy` until each skeletal spec is either repaired or removed during module refactors.
- Add smoke tests for global guard/filter/interceptor wiring and decorator metadata (`@Public`, `@Roles`, `@AdminOnly`, `@Cacheable`, `@CacheEvict`).

#### 2.1 Setup Automated Testing Fixtures
- Create `apps/api/test/jest-unit.json` and `test/jest-e2e.json`.
- Create shared test app factories (`test-app.factory.ts`), mock providers, and transaction-wrapped test database services.
- Define mock factories for database models (User, Pet, Sitter, SitterBooking, Budget, Photo, Reminder) to allow TDD-lite throughout subsequent phases.
- Standardize unit specs on the helpers under `apps/api/test/`: `test-app.factory.ts`, `mocks/provider.mocks.ts`, and `factories/model.factories.ts`.

#### 2.2 Add Database Pessimistic Locking Helper
- Design a helper method inside `PrismaService` or a shared module that executes `SELECT ... FOR UPDATE` raw queries on a specified table row inside a transaction context, wrapping dynamic checks safely.
- The helper must validate SQL identifiers before using raw identifier fragments, bind row ids as query parameters, and be used by sitter-booking related repositories instead of hand-rolled row-lock SQL.

#### 2.3 Refactor Queue System & Event Bus Decoupling
- Create `src/interfaces/email-jobs.interface.ts`.
- Create `src/modules/shared/queue/queue.service.ts` BullMQ abstraction.
- Integrate the NestJS `event-bus` to decouple bookings and reminders from direct service calls. Domain modules will publish events; `QueueService` listeners will queue the jobs asynchronously.
- Existing file upload and OTP job dispatch must go through `QueueService` so queue behavior is centralized before adding email and booking listeners.

#### 2.4 Add Email Logging & Suppression (Resend)
- Add `email_logs` and `email_suppressions` models to the Prisma schema, including nullable `account_id` and `booking_id` relations for auditability without blocking account or booking deletion.
- Run migrations and generate Prisma client.
- Create `src/modules/shared/email` Resend HTTP client provider, `EmailService`, and EMAIL queue processor. Connect to `email_logs` to track sent, failed, and suppressed attempts; suppression ingestion/bounce webhooks remain outside Phase 2.4.

### Phase 3: Domain Bounded Context Consolidation & Refactoring (Weeks 5-7)

#### 3.1 Bounded Context Consolidation (Execute First)
- **Budget Consolidation:** Merge `budget-categories/`, `budget-transactions/`, and `budgets/` into a single, cohesive `budget/` directory under a unified `BudgetModule`.
- **Photos Consolidation:** Merge `photo-comments/` into `photos/` under a single module block.
- **SitterBooking Consolidation:** Merge `pet-sitters/`, `sitter-bookings/`, and `sitter-reviews/` into a unified `sitter-booking/` module directory.
- **Implementation note:** Keep route paths and controller/service class names stable during the move. Phase 3.1 is a packaging/boundary consolidation only; deeper DTO/repository contract cleanup remains in Phase 3.3.

#### 3.2 Decouple Pets and Medical Records Bounded Contexts
- Remove `forwardRef` module imports.
- Relocate sub-resource routing (`GET /pets/:id/medical-records`) out of `PetsController` and declare it directly within `MedicalRecordsController` as `@Get('pets/:id/medical-records')`.
- Configure `MedicalRecordsModule` to have a simple unidirectional import of `PetsModule` to access `PetsRepository`.

#### 3.3 Standardize Bounded Context Repositories & DTOs
- Convert consolidated modules to strict contract-based repositories:
  - Users, Pets, MedicalRecords, Reminders, Budget, Photos, SitterBooking.
- Clean up CASL rules: replace simple ownership queries inside CASL with explicit `userId === ownerId` checks in the services. Keep CASL solely for admin-level ABAC checks.
- Add standard Response DTOs and composed Swagger decorators.

### Phase 4: Concurrency & Sync Integration (Weeks 8-9)

#### 4.1 RevenueCat Webhook Integration
- Create `src/modules/subscription/` module, controller, and service.
- Implement `/api/v1/subscription/webhook` endpoint with `REVENUECAT_WEBHOOK_SECRET` validation.
- **Audit Correction:** Add webhook event timestamp or expiration comparison guards. Only update the user's tier if the webhook payload's event date is newer than the database's `subscription_expires_at` timestamp.

#### 4.2 Sitter Booking Dynamic Concurrency Protection
- **Audit Correction:** Add `idempotencyKey`, `expiresAt`, `confirmedAt`, and `cancelledAt` fields to `sitter_bookings` Prisma model. Run database migrations.
- In `SitterBookingService.createBooking()`:
  1. Validate booking request idempotency against `sitter_bookings.idempotency_key`.
  2. Start a transaction and execute `SELECT * FROM pet_sitters WHERE id = $1 FOR UPDATE` to lock the sitter row.
  3. Validate sitter time-overlap counts against `sitter_bookings` where status is active/confirmed and overlaps the requested start/end time.
  4. Create booking with `expiresAt = now + 15min` (pending status) and release row lock.
  5. Emit `BookingCreatedEvent` to notify users asynchronously.

#### 4.3 Scheduled Expiry Cleanups
- Create `@Cron(CronExpression.EVERY_MINUTE)` task under `SitterBookingModule` to search and flag all pending `sitter_bookings` whose `expiresAt < now`. Auto-decrement sitter active booking counters, mark booking as `cancelled`, and dispatch cancellation emails asynchronously.

### Phase 5: Verification and CI Pipeline (Weeks 10-12)

#### 5.1 Unit Tests Run
- Run unit test suites for all services, guards, and custom filters:
  ```bash
  pnpm --filter @yeu-pet/api test
  ```

#### 5.2 End-to-End Dynamic Flows
- Execute E2E integrations verifying:
  - Auth token refreshes and RBAC blockades.
  - Sitter bookings race conditions (triggering simultaneous E2E bookings on the same sitter to verify row-locking safety).
  - RevenueCat webhook sync validation.
  - Budget transaction calculations.

---

## 7. Database Refactor Plan

### 7.1 Schema Changes

```prisma
// Add Email Tracking
model email_logs {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  resend_email_id String?     @unique @db.VarChar(255)
  booking_id      String?     @db.Uuid
  account_id      String?     @db.Uuid
  to_email        String      @db.VarChar(255)
  subject         String      @db.VarChar(255)
  status          String      @default("pending") @db.VarChar(50)
  error           String?     @db.Text
  created_at      DateTime?   @default(now()) @db.Timestamptz(6)
  updated_at      DateTime?   @default(now()) @db.Timestamptz(6)
}

model email_suppressions {
  id         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email      String    @unique @db.VarChar(255)
  reason     String    @db.VarChar(50)
  created_at DateTime? @default(now()) @db.Timestamptz(6)
}

// Modify Sitter Bookings to support Concurrency and Idempotency
alter table sitter_bookings 
  add column idempotency_key varchar(255) unique,
  add column expires_at timestamptz,
  add column confirmed_at timestamptz,
  add column cancelled_at timestamptz;
```

---

## 8. Migration Strategy

- Keep database schema expansions strictly **additive** first.
- Execute data backfills asynchronously using scheduled script workers inside `scratch/`.
- Deploy changes incrementally via:
  `pnpm --filter @yeu-pet/api db:migrate --name add_email_logs_and_idempotency`

---

## 9. Testing Strategy

We transition from a delayed testing strategy to a **TDD-Lite** strategy:

1. **Phase 2 Setup:** Configure Jest suites and write factories.
2. **In-Stride Unit Tests:** Every repository and service refactored in Phase 3 must include its companion `.spec.ts` unit tests before the task is marked completed in the checklist.
3. **Concurrency Simulation:** E2E suites will spawn parallel promises booking the same sitter to verify transactional row-locking boundaries.

---

## 10. Performance & Security

- **Opt-in Caching:** Prevents stale state bugs on highly dynamic routes while securing fast responses for static paths (pet categories, sitter listings).
- **PostgreSQL Lock Efficiency:** Replaces external Redis network lock queries with local, index-optimized PostgreSQL row-level locks, reducing API response times.
- **Telemetry Protection:** Scrubbing client-side error stack traces prevents excessive network payloads and telemetry cost overruns.

---

## 11. Risks and Tradeoffs

| Core Architectural Risk | Mitigation |
| :--- | :--- |
| **Pessimistic Row Lock Deadlocks** | Keep transactional row lock periods extremely short. Do NOT execute external HTTP requests (e.g., calling Resend or RevenueCat APIs) inside the PostgreSQL database transaction block. |
| **Out-of-Order Webhook downgrades** | Ensure webhook updates perform an additive timestamp comparison on `subscription_expires_at`. |
| **Broken sub-resource routes** | Route `GET /pets/:id/medical-records` to `MedicalRecordsController` using custom path mapping, preserving mobile client URL contracts while decoupling modules. |

---

## 12. Incremental Migration Roadmap

- **Week 1 (Phase 1 Reconciliation):** Fix Sentry filter shadowing, convert HTTP cache to opt-in, clean up fake `forwardRef`s, scrub telemetry noise, and repair RBAC metadata drift.
- **Week 2-3 (Phase 2 - Test Rigging & Core Infrastructures):** Start with phase gate corrections, then setup Jest configs, factories, event-bus queue integration, and Resend email logging models.
- **Week 4-7 (Phase 3 - Domain Consolidation & Refactoring):** Consolidate Budget, Photos, and SitterBooking modules. Refactor repositories, DTOs, and ownership checks in one clean pass. Decouple Pets and Medical Records modules.
- **Week 8-9 (Phase 4 - Concurrency & Webhook Integration):** Add Postgres row-locking sitter logic, dynamic overlap validation, idempotency, and RevenueCat webhook sync.
- **Week 10 (Phase 5 - Verification):** Execute entire unit and E2E dynamic suites. Verify that no circular dependencies or stale-caching paths exist.
