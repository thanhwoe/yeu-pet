# Yeu-Pet Backend Refactoring Plan

> **Reference Project:** `smart-booking` (`/Users/thanh/projects/smart-booking`)
> **Target Project:** `yeu-pet` (`apps/api`)
> **Date:** 2026-05-28
> **Status:** Planning Phase

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

The Yeu-Pet backend (NestJS, PostgreSQL, Prisma, Redis) has a solid foundation but lacks several production-grade patterns that the `smart-booking` project demonstrates. Key deficiencies include:

- **No consistent Repository pattern** with interface contracts
- **No distributed locking** for concurrent booking operations
- **No analytics/tracking** (PostHog or similar)
- **No HTTP response caching** on GET endpoints
- **No RolesGuard** — authorization roles mixed into JwtAuthGuard
- **No Response DTOs** for Swagger documentation
- **No email delivery tracking** or suppression management
- **No Sentry integration** for error monitoring
- **No scheduled cleanup tasks** (e.g., expired booking cleanup)
- **Tight coupling** between modules (circular dependencies, `forwardRef` usage)
- **Mixed naming conventions** (snake_case vs camelCase across modules)
- **No RevenueCat integration** for subscription management

This plan provides a **complete blueprint** to refactor the Yeu-Pet backend into a maintainable, scalable, production-grade codebase using the proven patterns from `smart-booking`.

---

## 2. Smart-Booking Architecture Analysis

> **Note:** Not all smart-booking patterns are directly applicable. Yeu-Pet will use **RevenueCat** for subscriptions/payments instead of Stripe, so Stripe-specific modules (payments/stripe) from smart-booking should be excluded. RevenueCat handles the mobile-side purchase flow, while the backend integrates via RevenueCat webhooks.

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
│       └── prisma.service.ts        # Extends PrismaClient, lifecycle hooks, query logging
├── decorators/                      # Custom decorators
│   ├── cache.decorator.ts           # @CacheTTL(), @IgnoreCache()
│   ├── current-user.decorator.ts    # @CurrentUser()
│   ├── pagination.decorator.ts      # @PaginationQuery()
│   ├── public.decorator.ts          # @Public()
│   ├── roles.decorator.ts           # @Roles(), @AdminOnly()
│   └── swagger.decorator.ts         # @ApiOkResponse(), @ApiCreatedResponse()
├── filters/
│   ├── all-exceptions.filter.ts     # Catch-all with Sentry
│   └── prisma-exceptions.filter.ts  # Prisma errors → HTTP
├── guards/
│   ├── jwt-auth.guard.ts            # Clerk JWT guard with public bypass
│   ├── roles.guard.ts               # Role-based access (RBAC)
│   └── throttler.guard.ts           # Custom rate limiting (user/IP-based)
├── interceptors/
│   ├── error-logging.interceptor.ts # Log errors to PostHog + Logger
│   ├── http-cache.interceptor.ts    # Auto-cache GET responses via Redis
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
    ├── payments/                    # Stripe — NOT applicable to Yeu-Pet
    ├── services/
    ├── slots/
    ├── users/
    └── shared/
        ├── cache/
        ├── email/
        ├── lock/
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
  findByClerkId(clerkId: string): Promise<User | null>;
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}
}
```

#### Pattern 2: Service with Cache Decorator Pattern

```typescript
async findOne(id: string) {
  return this.cacheService.wrap(
    CACHE_KEY.USER_BY_ID(id),
    CACHE_TTL.USER,
    async () => {
      const user = await this.usersRepository.findById(id);
      if (!user) throw new NotFoundException(`User with ID "${id}" not found`);
      return user;
    },
  );
}
```

#### Pattern 3: Distributed Lock for Concurrent Operations

```typescript
return this.distributedLockService.withLock(
  slotId,
  async () => {
    return this.bookingsRepository.create(data);
  },
  "booking",
);
```

#### Pattern 4: Queue Dispatching via Typed Service

```typescript
await this.queueService.dispatchBookingCancelled({
  bookingId: booking.id,
  userEmail: booking.user.email,
  userName: booking.user.name,
});
```

#### Pattern 5: Swagger Decorator Composition

```typescript
@ApiOkResponse({ summary: 'Get all users', response: ResponseUsersDto, roles: [UserRole.ADMIN] })
@AdminOnly()
findAll(@PaginationQuery() pagination: PaginationDto) { ... }
```

#### Pattern 6: HTTP Response Caching

```typescript
@Controller("services")
@CacheTTL(CACHE_TTL.SERVICE)
export class ServicesController {}
```

#### Pattern 7: Prisma Transaction with Serializable Isolation

```typescript
return this.prisma.$transaction(
  async (tx) => {
    const [lockedSlot] = await tx.$queryRaw<...>`SELECT ... FOR UPDATE OF s`;
  },
  { isolationLevel: TransactionIsolationLevel.Serializable },
);
```

### 2.3 Module Dependency Graph (Smart-Booking — Reference Only)

```
AppModule
 ├── SentryModule
 ├── ScheduleModule
 ├── PrismaModule (global)
 ├── AuthModule (Clerk)
 ├── UsersModule
 ├── SharedModule (global) — Cache, Redis, Lock, Queue, Track
 ├── SlotsModule → ServicesModule
 ├── ServicesModule
 ├── BookingsModule → SlotsModule
 ├── EmailLogsModule
 └── PaymentsModule (Stripe — NOT applicable to Yeu-Pet)
```

---

## 3. Yeu-Pet Current State Assessment

### 3.1 Current Folder Structure

```
apps/api/src/
├── main.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── database/
│   └── prisma/
│       └── prisma.module.ts, prisma.service.ts
├── decorators/
│   ├── admin.decorator.ts           # @Admin() — mixed role check
│   ├── current-user.decorator.ts
│   ├── file-uploaded.decorator.ts
│   ├── files-uploaded.decorator.ts
│   ├── id-param.decorator.ts
│   ├── is-after.decorator.ts
│   ├── is-decimal.decorator.ts
│   ├── pagination.decorator.ts
│   ├── policy.decorator.ts          # CASL
│   └── public.decorator.ts
├── filters/
│   ├── all-exceptions.filter.ts
│   └── prisma-exceptions.filter.ts
├── guards/
│   ├── jwt-auth.guard.ts            # JWT + admin role inline
│   ├── local-auth.guard.ts
│   ├── policy.guard.ts              # CASL
│   ├── throttler.guard.ts
│   └── user-verified.guard.ts
├── interceptors/
│   └── error-logging.interceptor.ts
├── interfaces/
│   ├── cache.interface.ts
│   ├── event-bus.interface.ts
│   ├── file-upload.interface.ts
│   ├── otp.interface.ts
│   ├── pagination.interface.ts
│   ├── repository.interface.ts      # IBaseRepository<T>
│   └── *-repository.interface.ts    # 15+ per-module repository interfaces
├── pipes/
│   ├── allow-values.pipe.ts
│   └── number-range.pipe.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── types/
│   └── jwt.ts
├── utils/
│   ├── pagination.ts
│   └── transform.ts
└── modules/
    ├── auth/
    ├── users/
    ├── pets/
    ├── medical-records/
    ├── reminders/
    ├── casl/                        # CASL authorization
    ├── budget-categories/
    ├── budget-transactions/
    ├── budgets/
    ├── photos/
    ├── photo-comments/
    ├── pet-sitters/
    ├── sitter-bookings/
    ├── sitter-reviews/
    ├── notifications/
    ├── user-devices/
    ├── user-settings/
    ├── file-workers/
    └── shared/
        ├── bullmq/
        ├── cache/
        ├── event-bus/
        ├── file-upload/
        ├── otp/
        └── redis/
```

### 3.2 Current Module Problems

| Problem                                            | Location                          | Impact                             |
| -------------------------------------------------- | --------------------------------- | ---------------------------------- |
| CASL tied to `@casl/prisma` tightly                | `casl/` module                    | High coupling, hard to test        |
| `forwardRef` in 5+ modules                         | pets, medical-records, auth, etc. | Circular dependency smell          |
| No `@Roles()` decorator                            | `guards/jwt-auth.guard.ts`        | Violates SRP, hard to extend       |
| Inline file upload handler in controllers          | `pets.controller.ts`              | Tight coupling to multer           |
| No response DTOs for Swagger                       | All controllers                   | Poor API documentation             |
| No HTTP cache interceptor                          | Missing                           | No GET response caching            |
| No tracking/analytics                              | Missing                           | No product event data              |
| No distributed lock                                | Missing                           | Concurrent booking race conditions |
| No email delivery tracking                         | Missing                           | Cannot monitor email reliability   |
| No Sentry                                          | Missing                           | No error monitoring                |
| No scheduled cleanup tasks                         | Missing                           | Orphaned records accumulate        |
| No RevenueCat integration                          | Missing                           | No subscription management         |
| Repository interfaces not consistently implemented | `interfaces/*.repository.ts`      | Dead code, incomplete adoption     |

### 3.3 Current Module Dependency Issues

```
PetsModule → MedicalRecordsModule (forwardRef) ↕ (circular)
MedicalRecordsModule → PetsModule (forwardRef)
AuthModule → UsersModule → AuthModule (forwardRef)
```

---

## 4. Comparative Gap Analysis

| Feature                    | Smart-Booking                 | Yeu-Pet                                | Action                     |
| -------------------------- | ----------------------------- | -------------------------------------- | -------------------------- |
| Repository Pattern         | ✅ Interface + Implementation | ⚠️ Partial                             | **Refine & standardize**   |
| Distributed Lock (Redlock) | ✅                            | ❌ Missing                             | **Add**                    |
| Queue Abstraction          | ✅ QueueService               | ⚠️ Direct BullMQ                       | **Refactor**               |
| Email Tracking             | ✅ EmailLog + Suppression     | ❌ Missing                             | **Add**                    |
| Analytics (PostHog)        | ✅ TrackService               | ❌ Missing                             | **Add**                    |
| HTTP Cache Interceptor     | ✅                            | ❌ Missing                             | **Add**                    |
| Response DTOs              | ✅                            | ❌ Missing                             | **Add**                    |
| Roles Guard                | ✅ Separate                   | ⚠️ Inline                              | **Extract**                |
| Sentry                     | ✅                            | ❌ Missing                             | **Add**                    |
| Swagger Decorators         | ✅ Custom                     | ❌ Basic                               | **Add**                    |
| Scheduled Tasks            | ✅                            | ❌ Missing                             | **Add**                    |
| Testing                    | ✅ Unit + E2E + Factories     | ⚠️ Minimal                             | **Build out**              |
| Auth Provider              | Clerk (external)              | JWT + Local (custom)                   | **Keep custom, refine**    |
| Authorization              | Roles (RBAC)                  | CASL (ABAC)                            | **Keep CASL, simplify**    |
| File Upload                | ❌ N/A                        | ✅ Cloudinary + BullMQ                 | **Keep, enhance**          |
| **Payment Processing**     | ✅ Stripe                     | ⚠️ Will use **RevenueCat**             | **Do NOT add Stripe**      |
| **Subscription Mgmt**      | ❌ N/A                        | ⚠️ Basic `subscription_tier` in schema | **Enhance via RevenueCat** |

---

## 5. Recommended Target Architecture

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────┐
│           API Gateway               │
│  (Helmet, CORS, Versioning, Throttle)│
├─────────────────────────────────────┤
│      Global Interceptors            │
│  Track | Cache | ErrorLogging       │
├─────────────────────────────────────┤
│      Global Guards / Filters        │
│  JWT Auth | Roles | Exception       │
├─────────────────────────────────────┤
│      Domain Modules                 │
│  Auth, Users, Pets, MedicalRecords, │
│  Reminders, Budget, Photos,         │
│  SitterBooking, Notifications,      │
│  Subscription (RevenueCat)          │
├─────────────────────────────────────┤
│       Shared Infrastructure         │
│  Redis | Cache | Queue (BullMQ)     │
│  DistributedLock | Track (PostHog)  │
│  Email (Resend) | FileUpload        │
│  Sentry                             │
├─────────────────────────────────────┤
│            Data Layer               │
│      PrismaService + PostgreSQL     │
└─────────────────────────────────────┘
```

### 5.2 Target Directory Structure

```
apps/api/src/
├── main.ts
├── instrument.ts                     # NEW: Sentry init
├── app.module.ts
├── constants/                        # NEW
│   ├── cache.constants.ts
│   └── queue.constants.ts
├── database/
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts         # Add query logging + tracking
├── decorators/
│   ├── cache.decorator.ts            # NEW
│   ├── roles.decorator.ts            # NEW
│   ├── swagger.decorator.ts          # NEW
│   └── ...keep existing
├── filters/
│   ├── all-exceptions.filter.ts      # REFINE: Add Sentry
│   └── prisma-exceptions.filter.ts   # REFINE: Add Sentry
├── guards/
│   ├── jwt-auth.guard.ts             # REFINE: Remove inline role check
│   ├── roles.guard.ts                # NEW
│   └── throttler.guard.ts
│   └── ...keep: local-auth, policy, user-verified
├── interceptors/
│   ├── error-logging.interceptor.ts  # REFINE: Add TrackService
│   ├── http-cache.interceptor.ts     # NEW
│   └── track.interceptor.ts          # NEW
├── interfaces/
│   ├── cache.interface.ts            # KEEP
│   ├── email-jobs.interface.ts       # NEW
│   └── event-bus.interface.ts        # KEEP or MERGE
├── utils/
│   ├── format.ts                     # NEW
│   └── pagination.ts                 # REFINE: Add PaginationDto + PaginationResponseDto
├── modules/
│   ├── auth/
│   ├── users/
│   ├── pets/
│   ├── medical-records/
│   ├── reminders/
│   ├── budget/                       # CONSOLIDATE: budget-categories + budget-transactions + budgets
│   ├── photos/                       # CONSOLIDATE: photos + photo-comments
│   ├── sitter-booking/               # CONSOLIDATE: pet-sitters + sitter-bookings + sitter-reviews
│   ├── subscription/                 # NEW: RevenueCat webhooks + plan management
│   ├── notifications/
│   ├── email-logs/                   # NEW
│   ├── file-workers/                 # KEEP
│   └── shared/
│       ├── shared.module.ts
│       ├── cache/                    # REFINE: Add wrap(), inflight dedup
│       ├── redis/
│       ├── lock/                     # NEW: Redlock
│       ├── queue/                    # REFINE: Add QueueService abstraction
│       ├── email/                    # NEW: Resend
│       ├── track/                    # NEW: PostHog
│       ├── file-upload/              # KEEP
│       ├── otp/                      # KEEP
│       └── event-bus/                # MERGE or deprecate
└── generated/prisma/
```

> **IMPORTANT:** Do NOT create a `payments/` or `stripe/` module. Subscription/payment is handled by **RevenueCat** on the mobile client. The backend only needs a lightweight webhook receiver to sync subscription state.

---

## 6. Detailed Implementation Plan

### Phase 1: Foundation Infrastructure (Weeks 1-2)

#### 1.1 Add Sentry Integration

- Create `src/instrument.ts`
- Add `@sentry/nestjs` and `@sentry/profiling-node` to package.json
- Update `main.ts` to import instrument first
- Add `SentryModule.forRoot()` in app.module.ts
- Add `SentryGlobalFilter` as `APP_FILTER`
- Add `@SentryExceptionCaptured()` to both exception filters

#### 1.2 Add RolesGuard

- Create `src/decorators/roles.decorator.ts` with `@Roles()`, `@AdminOnly()`
- Create `src/guards/roles.guard.ts`
- Remove admin role check from `jwt-auth.guard.ts`
- Register `RolesGuard` globally

#### 1.3 Add TrackService (PostHog)

- Create `src/modules/shared/track/` with PostHog client provider + TrackService
- Register in SharedModule

#### 1.4 Add HttpCacheInterceptor

- Create `src/decorators/cache.decorator.ts` with `@CacheTTL()`, `@IgnoreCache()`
- Create `src/interceptors/http-cache.interceptor.ts`
- Create `src/constants/cache.constants.ts`
- Register globally

#### 1.5 Add TrackInterceptor

- Create `src/interceptors/track.interceptor.ts`
- Register globally

### Phase 2: Infrastructure Enhancement (Weeks 2-3)

#### 2.1 Add Distributed Lock Service

- Add `redlock` to package.json
- Create `src/modules/shared/lock/lock.module.ts`
- Create `src/modules/shared/lock/distributed-lock.service.ts`

#### 2.2 Refactor Queue System

- Create `src/interfaces/email-jobs.interface.ts`
- Create `src/modules/shared/queue/queue.service.ts` abstraction
- Create `src/modules/shared/queue/queue.constants.ts`
- Create `EmailProcessor`
- Refactor existing BullMQ usage to go through `QueueService`

#### 2.3 Add Email Logging System

- Add `EmailLog` and `EmailSuppression` models to Prisma schema
- Create `src/modules/email-logs/` module with repository pattern
- Run migration

#### 2.4 Add Email Module (Resend)

- Create `src/modules/shared/email/` with Resend client provider + EmailService
- Connect to email-logs for delivery tracking

### Phase 3: Module Refactoring (Weeks 3-5)

#### 3.1 Standardize Repository Pattern

Convert modules in order: users → pets → medical-records → reminders → budget → photos → sitter-booking → notifications

#### 3.2 Add Response DTOs + Swagger Decorators

- Create `src/decorators/swagger.decorator.ts`
- Create `Response{Entity}Dto` for each module
- Create `Response{Entity}sDto` extending `PaginationResponseDto`

#### 3.3 Add PaginationDto + PaginationResponseDto

- Update `src/utils/pagination.ts` to add DTO classes with validation

#### 3.4 Refactor CASL Module

- Replace simple ownership checks with direct `userId === ownerId`
- Keep CASL only for admin ABAC permissions

### Phase 4: Module Consolidation (Weeks 5-6)

#### 4.1 Budget Consolidation

- Merge `budget-categories/` + `budget-transactions/` + `budgets/` → `budget/`

#### 4.2 Photos Consolidation

- Merge `photo-comments/` into `photos/`

#### 4.3 SitterBooking Consolidation

- Merge `pet-sitters/` + `sitter-bookings/` + `sitter-reviews/` → `sitter-booking/`

#### 4.4 Remaining Modules

- Refactor `notifications/`, `user-devices/`, `user-settings/`

### Phase 5: Feature Enhancements (Weeks 6-7)

> **Note on Payments/Subscriptions:** Yeu-Pet uses **RevenueCat** for in-app purchases and subscription management — NOT Stripe. RevenueCat handles the entire purchase flow on the mobile client side. The backend only needs to receive RevenueCat webhooks to update user subscription tiers in the existing `accounts.subscription` and `accounts.subscription_expires_at` fields. Do NOT create a `payments/` or `stripe/` module.

#### 5.1 Add Subscription Module (RevenueCat)

- Create `src/modules/subscription/subscription.module.ts`
- Create `src/modules/subscription/subscription.controller.ts`:
  - `POST /api/v1/subscription/webhook` — RevenueCat webhook receiver (`@Public()`)
  - `GET /api/v1/subscription/me` — Get current user subscription status
- Create `src/modules/subscription/subscription.service.ts`:
  - `handleWebhook(event)` — Process RevenueCat webhook events:
    - `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `UNCANCELLATION`, `NON_RENEWING_PURCHASE`
  - Update `accounts.subscription` (enum: `free`, `premium`) and `accounts.subscription_expires_at`
  - `getSubscriptionStatus(userId)` — Return current tier and expiry
- Create `src/modules/subscription/dto/response-subscription.dto.ts`
- Add `REVENUECAT_WEBHOOK_SECRET` to env config
- Register `SubscriptionModule` in `app.module.ts`

#### 5.2 Add Scheduled Cleanup Tasks

- Create `src/modules/sitter-booking/tasks/cleanup-expired-bookings.task.ts`:
  - `@Cron(CronExpression.EVERY_MINUTE)` handler
  - Auto-cancel expired PENDING bookings
  - Decrement slot bookedCount
  - Dispatch cancellation emails via QueueService

#### 5.3 Enhance Sitter Booking with Distributed Lock

```typescript
async createBooking(user: accounts, dto: CreateSitterBookingDto) {
  // 1. Check idempotency
  // 2. Validate slot availability
  // 3. Acquire distributed lock on slotId
  // 4. Create booking in serializable transaction
  // 5. Release lock
  // 6. Dispatch confirmation email via QueueService
}
```

#### 5.4 Add Booking Idempotency

- Add `idempotencyKey` to CreateSitterBookingDto
- Add `idempotency_key` field to `sitter_bookings` (unique)
- Run migration

#### 5.5 Add Expiry Tracking to SitterBookings

- Add `expiresAt`, `confirmedAt`, `cancelledAt` to `sitter_bookings`
- Run migration
- Set `expiresAt = now + 15min` on PENDING booking creation

#### 5.6 Pagination Audit

- Audit ALL `@Get()` endpoints to use `@PaginationQuery()` and return paginated responses

### Phase 6: Testing (Weeks 7-8)

#### 6.1 Test Infrastructure

- Create `test/jest-unit.json`, `test/jest-e2e.json`
- Create test factories (user, pet, sitter, booking, slot)
- Create test app factory, mock providers, test Prisma service

#### 6.2 Unit Tests

- Services: users, pets, sitter-bookings, budget, reminders, subscription
- Guards: jwt-auth, roles, throttler
- Filters: all-exceptions, prisma-exceptions

#### 6.3 E2E Tests

- Auth flow, Pets CRUD, Sitter booking (register → slot → book → confirm → cancel), Budget

---

## 7. Database Refactor Plan

### 7.1 Naming Convention Standardization

All new models: `snake_case` + `@map("table_name")`, `@map("field_name")`, UUID primary keys.

### 7.2 New Models to Add

| Model                | Purpose                    | Priority |
| -------------------- | -------------------------- | -------- |
| `email_logs`         | Email delivery tracking    | High     |
| `email_suppressions` | Suppressed email addresses | High     |

### 7.3 Schema Changes to Existing Models

| Table             | Change                                                     | Reason                     |
| ----------------- | ---------------------------------------------------------- | -------------------------- |
| `sitter_bookings` | Add `idempotency_key` (unique)                             | Prevent duplicate bookings |
| `sitter_bookings` | Add `expires_at`                                           | Track pending expiry       |
| `sitter_bookings` | Add `confirmed_at`, `cancelled_at`                         | Lifecycle tracking         |
| `accounts`        | `subscription` and `subscription_expires_at` already exist | Used by RevenueCat sync    |

Note: The `accounts` table already has `subscription` (enum: `free`, `premium`) and `subscription_expires_at` fields. These are sufficient for RevenueCat integration — no new subscription-specific tables are needed.

### 7.4 Migration Strategy

```bash
pnpm --filter @yeu-pet/api db:migrate --name add_email_logs_and_idempotency
pnpm --filter @yeu-pet/api db:generate
```

---

## 8. Migration Strategy

### 8.1 Backward Compatibility Approach

1. Additive changes first
2. Deprecate, don't delete
3. Feature flags via env vars
4. Parallel run for logging/analytics

### 8.2 Migration Order by Module

```
Phase 1 (Infrastructure)      Phase 2 (Infrastructure+)    Phase 3 (Modules)
─────────────────────────     ─────────────────────────    ─────────────────
Sentry                        Distributed Lock             Users refactor
RolesGuard                    QueueService                 Pets refactor
TrackService (PostHog)        Email Logs                   MedicalRecords
HttpCacheInterceptor          Email (Resend)               Reminders
TrackInterceptor              PaginationDto                Budget consolidation
Cache decorators              Response DTOs                Photos consolidation
Swagger decorators            PaginationResponseDto        SitterBooking consolidation
                                                           Subscription (RevenueCat)
```

### 8.3 Git Branch Strategy

```
main
 └── refactor/phase-1-infrastructure
 └── refactor/phase-2-infrastructure-plus
 └── refactor/phase-3-modules
 └── refactor/phase-4-consolidation
 └── refactor/phase-5-enhancements
 └── refactor/phase-6-testing
```

---

## 9. Testing Strategy

### 9.1 Test Structure

```
apps/api/test/
├── jest-unit.json
├── jest-e2e.json
├── setup/           (test-app.factory, test-prisma.service, mock-providers)
├── factories/       (user, pet, sitter, booking, slot)
├── unit/            (services, guards, filters)
└── e2e/             (auth, pets, bookings, budget)
```

### 9.2 What to Test

| Layer        | Test Type     | Target                          |
| ------------ | ------------- | ------------------------------- |
| Services     | Unit          | Business logic, error paths     |
| Repositories | Integration   | Query correctness, transactions |
| Controllers  | Unit (mocked) | HTTP status, DTO validation     |
| Guards       | Unit          | Auth bypass, role enforcement   |
| Filters      | Unit          | Error mapping                   |
| E2E          | Integration   | Full request/response cycles    |

---

## 10. Performance & Security

### 10.1 Performance

| Concern              | Solution                               | Priority |
| -------------------- | -------------------------------------- | -------- |
| Duplicate DB queries | HttpCacheInterceptor                   | High     |
| Cache stampede       | Inflight dedup in CacheService.wrap()  | High     |
| Expired bookings     | Cron job EVERY_MINUTE                  | High     |
| N+1 queries          | Prisma `include`/`select` optimization | Medium   |

### 10.2 Security

| Concern       | Status          | Action                        |
| ------------- | --------------- | ----------------------------- |
| Rate limiting | ✅ Present      | Enhance with role-based skip  |
| Helmet        | ✅ Present      | Keep                          |
| IDOR          | ⚠️ CASL partial | Add explicit ownership checks |
| JWT rotation  | ✅ Present      | Keep                          |

---

## 11. Risks and Tradeoffs

| Risk                        | Impact | Mitigation                                            |
| --------------------------- | ------ | ----------------------------------------------------- |
| Breaking circular deps      | High   | Extract shared interfaces                             |
| CASL complexity             | Medium | Simplify, keep only for admin                         |
| Prisma migration conflicts  | Medium | Backup DB, dev-first                                  |
| No Stripe — RevenueCat only | Low    | RevenueCat handles payments; backend only syncs state |

---

## 12. Incremental Migration Roadmap

### Week 1-2: Phase 1 — Foundation Infrastructure

```
Sentry → RolesGuard → TrackService → HttpCacheInterceptor → TrackInterceptor
```

**Files:** ~15 create, ~8 modify. No DB changes.

### Week 3-4: Phase 2 — Infrastructure Enhancement

```
DistributedLock → QueueService → EmailLogs → Email Module
```

**Files:** ~20 create, ~10 modify. DB migration: email_logs, email_suppressions.

### Week 5-6: Phase 3 — Module Refactoring

```
Users → Pets → MedicalRecords → Reminders → Auth cleanup
```

**Files:** ~25 create, ~15 modify. No DB changes.

### Week 7-8: Phase 4 — Module Consolidation

```
Budget → Photos → SitterBooking → Notifications
```

**Files:** ~15 create, ~25 modify. No DB changes.

### Week 9-10: Phase 5 — Feature Enhancements

```
Subscription (RevenueCat) → Idempotency → Expiry tracking → Distributed Lock on SitterBooking
```

**Files:** ~12 create (including subscription module), ~12 modify. DB migration: idempotency_key, expires_at.

### Week 11-12: Phase 6 — Testing

```
Test infrastructure → Unit tests → E2E tests
```

**Files:** ~25 create. No code changes.

---

## Appendix A: Key Files to Create

| File                                                     | Purpose                                 | Phase |
| -------------------------------------------------------- | --------------------------------------- | ----- |
| `src/instrument.ts`                                      | Sentry initialization                   | 1     |
| `src/constants/cache.constants.ts`                       | CACHE_KEY, CACHE_TTL                    | 1     |
| `src/constants/queue.constants.ts`                       | QUEUES, JOBS                            | 2     |
| `src/decorators/cache.decorator.ts`                      | @CacheTTL(), @IgnoreCache()             | 1     |
| `src/decorators/roles.decorator.ts`                      | @Roles(), @AdminOnly()                  | 1     |
| `src/decorators/swagger.decorator.ts`                    | @ApiOkResponse(), @ApiCreatedResponse() | 1     |
| `src/guards/roles.guard.ts`                              | RBAC guard                              | 1     |
| `src/interceptors/http-cache.interceptor.ts`             | Auto-cache GET                          | 1     |
| `src/interceptors/track.interceptor.ts`                  | PostHog tracking                        | 1     |
| `src/interfaces/email-jobs.interface.ts`                 | Typed job payloads                      | 2     |
| `src/modules/shared/lock/lock.module.ts`                 | Distributed lock                        | 2     |
| `src/modules/shared/lock/distributed-lock.service.ts`    | Redlock service                         | 2     |
| `src/modules/shared/queue/queue.service.ts`              | Queue dispatcher                        | 2     |
| `src/modules/shared/queue/queue.constants.ts`            | Queue/job names                         | 2     |
| `src/modules/shared/queue/processors/email.processor.ts` | Email processor                         | 2     |
| `src/modules/shared/email/`                              | Resend email module                     | 2     |
| `src/modules/shared/track/`                              | PostHog analytics                       | 1     |
| `src/modules/email-logs/`                                | Email delivery tracking                 | 2     |
| `src/modules/subscription/`                              | RevenueCat webhook + status             | 5     |
| `src/utils/format.ts`                                    | Formatters                              | 1     |

## Appendix B: Key Files to Modify

| File                           | Change                                                | Phase |
| ------------------------------ | ----------------------------------------------------- | ----- |
| `package.json`                 | Add Sentry, Redlock, PostHog, Resend deps             | 1     |
| `src/main.ts`                  | Add instrument import                                 | 1     |
| `src/app.module.ts`            | Add guards, interceptors, filters, SubscriptionModule | 1,5   |
| `src/guards/jwt-auth.guard.ts` | Remove inline role check                              | 1     |
| `src/filters/*.filter.ts`      | Add @SentryExceptionCaptured                          | 1     |
| `prisma/schema.prisma`         | Add email_logs, email_suppressions, idempotency       | 2,5   |
| All modules                    | Repository pattern, DTOs, Swagger                     | 3,4   |
| All controllers                | @ApiOkResponse, @CacheTTL, @IgnoreCache               | 3,4   |

## Appendix C: Naming Conventions

| Item          | Convention                | Example                 |
| ------------- | ------------------------- | ----------------------- |
| Prisma models | `snake_case` + `@@map`    | `sitter_bookings`       |
| Prisma fields | `snake_case` + `@map`     | `expires_at`            |
| Classes       | PascalCase                | `CreateBookingDto`      |
| Files         | kebab-case                | `create-booking.dto.ts` |
| Controllers   | PascalCase + `Controller` | `PetsController`        |
| Services      | PascalCase + `Service`    | `PetsService`           |
| Repositories  | PascalCase + `Repository` | `PetsRepository`        |
| Interfaces    | PascalCase + `I` prefix   | `IPetsRepository`       |
| DI Tokens     | PascalCase + `Symbol`     | `ICacheService`         |
| Enums         | PascalCase                | `BookingStatus`         |
| Enum values   | UPPER_SNAKE_CASE          | `PENDING`, `CONFIRMED`  |

## Appendix D: Dependency Upgrade Plan

| Package                  | Current    | Target     | Reason              |
| ------------------------ | ---------- | ---------- | ------------------- |
| `@sentry/nestjs`         | ❌ Missing | `^10.49.0` | Error monitoring    |
| `@sentry/profiling-node` | ❌ Missing | `^10.49.0` | Profiling           |
| `redlock`                | ❌ Missing | `^4.2.0`   | Distributed locking |
| `posthog-node`           | ❌ Missing | `^5.28.0`  | Product analytics   |
| `resend`                 | ❌ Missing | `^6.10.0`  | Email delivery      |
| `ioredis`                | ✅ Present | Keep       | Redis client        |

> **Do NOT add:** `stripe`, `@stripe/stripe-js`, or any Stripe-related packages. Payment/subscription is handled by **RevenueCat** on the mobile client.

---

This plan was generated by analyzing the `smart-booking` reference project's architecture and comparing it with the current `yeu-pet` backend. All patterns recommended here have been proven in production in the smart-booking codebase.
