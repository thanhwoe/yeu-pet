# Backend Refactoring Checklist for AI Agent

> **Project:** Yeu-Pet Backend (`apps/api`)
> **Goal:** Refactor into a production-grade NestJS codebase following patterns from `smart-booking`
> **Reference Plan:** `backend-refactor-plan.md`
> **Status:** 📋 Not started

---

## How to use this checklist

1. Work through phases **in order** — each phase depends on prior phases.
2. Mark each item `[x]` when completed.
3. When a phase is 100% complete, move to the next one.
4. After each file change, verify with `pnpm --filter @yeu-pet/api lint` and `pnpm --filter @yeu-pet/api build`.
5. After DB migrations, run `pnpm --filter @yeu-pet/api db:generate` to update Prisma client.

---

## Phase 1: Foundation Infrastructure (Weeks 1-2)

### 1.1 Add Sentry Integration

- [ ] Add `@sentry/nestjs` and `@sentry/profiling-node` to `apps/api/package.json`
- [ ] Create `apps/api/src/instrument.ts` with Sentry.init()
- [ ] Update `apps/api/src/main.ts` to import `./instrument` as first import
- [ ] Add `SentryModule.forRoot()` to `apps/api/src/app.module.ts`
- [ ] Add `SentryGlobalFilter` as `APP_FILTER` in `app.module.ts`
- [ ] Add `@SentryExceptionCaptured()` decorator to `all-exceptions.filter.ts`
- [ ] Add `@SentryExceptionCaptured()` decorator to `prisma-exceptions.filter.ts`
- [ ] Add `SENTRY_DSN` to environment config
- [ ] Verify: `pnpm build` succeeds

### 1.2 Add RolesGuard

- [ ] Create `apps/api/src/decorators/roles.decorator.ts` with:
  - `Roles(...roles: UserRole[])` decorator
  - `AdminOnly()` decorator
  - Export `ROLES_KEY` metadata key
- [ ] Create `apps/api/src/guards/roles.guard.ts`:
  - Check `@Roles()` metadata on handler/class
  - Compare against `request.user.role`
  - Throw `ForbiddenException` if role mismatch
- [ ] Register `RolesGuard` as `APP_GUARD` in `app.module.ts`
- [ ] Remove admin role check from `apps/api/src/guards/jwt-auth.guard.ts`:
  - Delete the `requiredRole`, `REQUIRED_ROLE_KEY`, and admin check logic
  - Keep only JWT verification and `@Public()` bypass
- [ ] Verify: `pnpm build` succeeds

### 1.3 Add TrackService (PostHog Analytics)

- [ ] Add `posthog-node` to `apps/api/package.json`
- [ ] Create `apps/api/src/modules/shared/track/posthog/posthog.config.ts`:
  - Export `PostHogClient` symbol (Symbol)
  - Export `posthogFactory` using ConfigService
- [ ] Create `apps/api/src/modules/shared/track/posthog/posthog.module.ts`
- [ ] Create `apps/api/src/modules/shared/track/track.service.ts`:
  - `capture(event: { distinctId, event, properties })` method
  - `error(error, event)` method
- [ ] Create `apps/api/src/modules/shared/track/track.module.ts`
- [ ] Add TrackModule to `SharedModule` imports
- [ ] Add `POSTHOG_API_KEY` to environment config
- [ ] Verify: `pnpm build` succeeds

### 1.4 Add Cache Decorators + HttpCacheInterceptor

- [ ] Create `apps/api/src/constants/cache.constants.ts`:
  - `CACHE_KEY` object (USER_BY_ID, PET_BY_ID, etc.)
  - `CACHE_TTL` object (USER: 60, PET: 60, etc.)
- [ ] Create `apps/api/src/decorators/cache.decorator.ts`:
  - `@CacheTTL(ttlSeconds)` decorator
  - `@IgnoreCache()` decorator
- [ ] Create `apps/api/src/interceptors/http-cache.interceptor.ts`:
  - Skip non-GET requests
  - Check `@IgnoreCache()` metadata → skip
  - Check `@CacheTTL()` metadata → use TTL (default 60s)
  - Build cache key: `http_cache:{url}:{userId}`
  - Check Redis → return cached or call handler and cache response
  - Graceful fallback if Redis fails
- [ ] Register `HttpCacheInterceptor` as `APP_INTERCEPTOR` in `app.module.ts`
- [ ] Verify: `pnpm build` succeeds

### 1.5 Add TrackInterceptor

- [ ] Create `apps/api/src/interceptors/track.interceptor.ts`:
  - Capture `api_called` event to PostHog
  - Include: path, method, duration, userId
- [ ] Register `TrackInterceptor` as `APP_INTERCEPTOR` in `app.module.ts`
- [ ] Verify: `pnpm build` succeeds

---

## Phase 2: Infrastructure Enhancement (Weeks 2-3)

### 2.1 Add Distributed Lock Service

- [ ] Add `redlock` and `@types/redlock` to `apps/api/package.json`
- [ ] Create `apps/api/src/modules/shared/lock/lock.module.ts`
- [ ] Create `apps/api/src/modules/shared/lock/distributed-lock.service.ts`:
  - Initialize `Redlock` in `onModuleInit`
  - `withLock<T>(id, fn, prefix?, ttlMs?)` method
  - Acquire lock on `lock:{prefix}:{id}`
  - Return `fn()` result
  - Release lock in `finally` block
  - Throw `ConflictException` if lock acquisition fails
  - Add `LOCK_RETRY_COUNT`, `LOCK_RETRY_DELAY`, `LOCK_DEFAULT_TTL` to env config
- [ ] Register `LockModule` in `SharedModule`
- [ ] Verify: `pnpm build` succeeds

### 2.2 Refactor Queue System

- [ ] Create `apps/api/src/constants/queue.constants.ts`:
  - `QUEUES` object (EMAIL, etc.)
  - `JOBS` object (BOOKING_CONFIRMED, BOOKING_CANCELLED, etc.)
- [ ] Create `apps/api/src/interfaces/email-jobs.interface.ts`:
  - `BookingConfirmedJobPayload` type
  - `BookingCancelledJobPayload` type
  - `EmailJobPayload` union type
- [ ] Create `apps/api/src/modules/shared/queue/queue.service.ts`:
  - Inject `@InjectQueue(QUEUES.EMAIL)` emailQueue
  - `dispatchBookingConfirmed(payload)` method
  - `dispatchBookingCancelled(payload)` method
- [ ] Create `apps/api/src/modules/shared/queue/queue.module.ts`:
  - Import `BullMQModule`
  - Register `BullModule.registerQueue({ name: QUEUES.EMAIL, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } } })`
- [ ] Create `apps/api/src/modules/shared/queue/queue.constants.ts` (module-level)
- [ ] Create `apps/api/src/modules/shared/queue/processors/email.processor.ts`:
  - `@Processor(QUEUES.EMAIL)` with concurrency 5
  - Handle `booking.confirmed` and `booking.cancelled` jobs
  - Call EmailService methods
- [ ] Register `QueueModule` in `SharedModule`
- [ ] Refactor existing BullMQ usage in codebase to go through `QueueService`
- [ ] Verify: `pnpm build` succeeds

### 2.3 Add Email Logging System

- [ ] Add `EmailLog` model to `apps/api/prisma/schema.prisma`:
  - Fields: id, resendEmailId (unique), bookingId, userId, toEmail, subject, jobName, status (EmailStatus), delivery timestamps, bounce details
  - Indexes on status, toEmail
- [ ] Add `EmailSuppression` model:
  - Fields: id, email (unique), reason (SuppressionReason), source, notes
- [ ] Add enums: `EmailStatus`, `SuppressionReason`
- [ ] Run migration: `pnpm --filter @yeu-pet/api db:migrate --name add_email_logs`
- [ ] Generate Prisma client: `pnpm --filter @yeu-pet/api db:generate`
- [ ] Create `apps/api/src/modules/email-logs/email-logs.module.ts`
- [ ] Create `apps/api/src/modules/email-logs/email-logs.service.ts`:
  - `create(data)`, `markSent(id, resendEmailId)`, `markFailed(id)`, `markDelivered(id)`, `markBounced(id)`
  - `isSuppressed(email)` check
- [ ] Create `apps/api/src/modules/email-logs/email-logs.repository.ts`
- [ ] Create `apps/api/src/modules/email-logs/dto/` folder
- [ ] Register `EmailLogsModule` in appropriate module
- [ ] Verify: Build + migration succeed

### 2.4 Add Email Module

- [ ] Add `resend` to `apps/api/package.json`
- [ ] Create `apps/api/src/modules/shared/email/resend/resend.config.ts`:
  - Export `ResendClient` symbol
  - Export `resendFactory` using ConfigService
- [ ] Create `apps/api/src/modules/shared/email/resend/resend.module.ts`
- [ ] Create `apps/api/src/modules/shared/email/email.service.ts`:
  - `sendBookingConfirmed(data)` — templates + send via Resend
  - `sendBookingCancelled(data)` — templates + send via Resend
  - Private `send()` method: check suppression → create log → send → update log
- [ ] Create `apps/api/src/modules/shared/email/email.module.ts`
- [ ] Create email templates in `apps/api/src/modules/shared/email/templates/`
- [ ] Register in `SharedModule`
- [ ] Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL` to env config
- [ ] Verify: `pnpm build` succeeds

---

## Phase 3: Module Refactoring (Weeks 3-5)

### 3.1 Standardize Repository Pattern

For each module, apply the following pattern:

```typescript
// {module}.repository.ts
interface I{Entity}Repository {
  create(data: {Entity}CreateInput): Promise<{Entity}>;
  findById(id: string): Promise<{Entity} | null>;
  findAll(params: { skip, take, ...filters }): Promise<[{Entity}[], number]>;
  update(id: string, data: {Entity}UpdateInput): Promise<{Entity}>;
  delete(id: string): Promise<{Entity}>;
}

@Injectable()
export class {Entity}Repository implements I{Entity}Repository {
  constructor(private readonly prisma: PrismaService) {}
  // ... implement all methods
}
```

#### Modules to convert (in order):

**Users**

- [ ] Create contract interface `IUsersRepository`
- [ ] Create `users.repository.ts` with full implementation
- [ ] Inject `UsersRepository` in `UsersService` (replace inline Prisma calls)

**Pets**

- [ ] Create contract interface `IPetsRepository`
- [ ] Create `pets.repository.ts`
- [ ] Inject `PetsRepository` in `PetsService`

**Medical Records**

- [ ] Create contract interface `IMedicalRecordsRepository`
- [ ] Create `medical-records.repository.ts`
- [ ] Break circular dependency with PetsModule (extract shared types)

**Reminders**

- [ ] Create contract interface `IRemindersRepository`
- [ ] Create `reminders.repository.ts`

### 3.2 Add Response DTOs + Swagger Decorators

- [ ] Create `apps/api/src/decorators/swagger.decorator.ts`:
  - `@ApiOkResponse(options)` — builds ApiOperation + ApiResponse + error decorators
  - `@ApiCreatedResponse(options)` — same for 201
  - `@ApiNoContentResponse(options)` — same for 204
  - Support: summary, description, body, response, params, errors, roles

For each module, create response DTOs:

**Users**

- [ ] `ResponseUserDto implements accounts`
- [ ] `ResponseUsersDto extends PaginationResponseDto`

**Pets**

- [ ] `ResponsePetDto implements pets`
- [ ] `ResponsePetsDto extends PaginationResponseDto`

**Other modules** (apply same pattern)

- [ ] Medical Records
- [ ] Reminders
- [ ] Budget Categories / Transactions
- [ ] Photos
- [ ] Pet Sitters / Bookings
- [ ] Subscription (RevenueCat)

### 3.3 Add PaginationDto + PaginationResponseDto

- [ ] Update `apps/api/src/utils/pagination.ts` to add:
  - `PaginationDto` class with `page`, `limit` fields + validation decorators
  - `PaginationResponseDto` class with `meta` field
- [ ] Update `@PaginationQuery()` decorator to return `PaginationDto`
- [ ] Update all controllers to use `PaginationDto` type
- [ ] Update all list endpoints to return `Response{Entity}sDto` with paginated data

### 3.4 Refactor CASL Module

- [ ] Audit all CASL usage — identify which are simple ownership checks
- [ ] Replace simple ownership checks with direct `userId === ownerId` checks in services
- [ ] Keep CASL only for admin-level ABAC permissions
- [ ] Remove `forwardRef` circular dependencies introduced by CASL

---

## Phase 4: Module Consolidation (Weeks 5-6)

### 4.1 Budget Consolidation

- [ ] Create `apps/api/src/modules/budget/` directory
- [ ] Move `budget-categories/*`, `budget-transactions/*`, `budgets/*` into `budget/`
- [ ] Merge into single `BudgetModule` with sub-services if needed
- [ ] Create unified repository pattern
- [ ] Update routes to maintain backward compatibility

### 4.2 Photos Consolidation

- [ ] Create `apps/api/src/modules/photos/` consolidated directory
- [ ] Merge `photo-comments/` into `photos/`
- [ ] Create unified repository pattern

### 4.3 SitterBooking Consolidation

- [ ] Create `apps/api/src/modules/sitter-booking/` directory
- [ ] Merge `pet-sitters/`, `sitter-bookings/`, `sitter-reviews/` into `sitter-booking/`
- [ ] Create unified repository pattern

### 4.4 Remaining Modules

- [ ] Refactor `notifications/` module
- [ ] Refactor `user-devices/` module
- [ ] Refactor `user-settings/` module

---

## Phase 5: Feature Enhancements (Weeks 6-7)

> **Important:** Yeu-Pet uses **RevenueCat** for in-app purchases and subscription management — NOT Stripe. RevenueCat handles the entire purchase flow on the mobile client. The backend only needs a lightweight webhook receiver to sync subscription state. Do NOT create a `payments/` or `stripe/` module.

### 5.1 Add Subscription Module (RevenueCat)

- [ ] Create `apps/api/src/modules/subscription/subscription.module.ts`
- [ ] Create `apps/api/src/modules/subscription/subscription.controller.ts`:
  - `POST /api/v1/subscription/webhook` — RevenueCat webhook receiver (`@Public()`)
  - `GET /api/v1/subscription/me` — Get current user subscription status
- [ ] Create `apps/api/src/modules/subscription/subscription.service.ts`:
  - `handleWebhook(event)` — Process RevenueCat webhook events
    - Handle: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `UNCANCELLATION`, `NON_RENEWING_PURCHASE`
  - Update `accounts.subscription` (enum: `free`, `premium`) and `accounts.subscription_expires_at`
  - `getSubscriptionStatus(userId)` — Return current tier and expiry
- [ ] Create `apps/api/src/modules/subscription/dto/response-subscription.dto.ts`
- [ ] Add `REVENUECAT_WEBHOOK_SECRET` to environment config
- [ ] Register `SubscriptionModule` in `app.module.ts`
- [ ] Verify: `pnpm build` succeeds

### 5.2 Add Scheduled Cleanup Tasks

- [ ] Create `apps/api/src/modules/sitter-booking/tasks/cleanup-expired-bookings.task.ts`:
  - `@Cron(CronExpression.EVERY_MINUTE)` handler
  - Cancel expired PENDING bookings
  - Decrement slot bookedCount
  - Mark as CANCELLED
- [ ] Register task in `SitterBookingModule`

### 5.3 Enhance Sitter Booking with Distributed Lock

- [ ] Add `idempotencyKey` to CreateSitterBookingDto
- [ ] Add `idempotency_key` field to `sitter_bookings` Prisma model (unique)
- [ ] Run migration
- [ ] In `BookingsService.create()`:
  1. Check idempotency (return existing if found)
  2. Validate slot availability
  3. Acquire distributed lock: `this.distributedLockService.withLock(slotId, ...)`
  4. Create booking in serializable Prisma transaction
  5. Dispatch confirmation email via QueueService

### 5.4 Add Expiry Tracking to SitterBookings

- [ ] Add `expiresAt`, `confirmedAt`, `cancelledAt` fields to `sitter_bookings`
- [ ] Run migration
- [ ] Set `expiresAt = now + 15min` on PENDING booking creation
- [ ] Update cleanup task to use `expiresAt` field

### 5.5 Pagination Audit

- [ ] Audit ALL `@Get()` endpoints in every controller
- [ ] Ensure each uses `@PaginationQuery()` or `@Query()` with pagination support
- [ ] Ensure each returns `PaginatedResult<T>` via `paginate()` helper

---

## Phase 6: Testing (Weeks 7-8)

### 6.1 Test Infrastructure

- [ ] Create `apps/api/test/jest-unit.json`
- [ ] Create `apps/api/test/jest-e2e.json`
- [ ] Create `apps/api/test/setup/test-app.factory.ts`
- [ ] Create `apps/api/test/setup/test-prisma.service.ts`
- [ ] Create `apps/api/test/setup/mock-providers.ts`
- [ ] Create `apps/api/test/factories/user.factory.ts`
- [ ] Create `apps/api/test/factories/pet.factory.ts`
- [ ] Create `apps/api/test/factories/sitter.factory.ts`
- [ ] Create `apps/api/test/factories/booking.factory.ts`
- [ ] Create `apps/api/test/factories/slot.factory.ts`

### 6.2 Unit Tests

**Services:**

- [ ] `users.service.spec.ts`
- [ ] `pets.service.spec.ts`
- [ ] `pets-sitters.service.spec.ts`
- [ ] `sitter-bookings.service.spec.ts`
- [ ] `budget.service.spec.ts`
- [ ] `reminders.service.spec.ts`
- [ ] `subscription.service.spec.ts`

**Guards:**

- [ ] `jwt-auth.guard.spec.ts`
- [ ] `roles.guard.spec.ts`
- [ ] `throttler.guard.spec.ts`

**Filters:**

- [ ] `all-exceptions.filter.spec.ts`
- [ ] `prisma-exceptions.filter.spec.ts`

### 6.3 E2E Tests

- [ ] `auth.e2e-spec.ts` — register → login → refresh → logout
- [ ] `pets.e2e-spec.ts` — create → read → update → delete with permissions
- [ ] `bookings.e2e-spec.ts` — register sitter → create slot → book → confirm → cancel
- [ ] `budget.e2e-spec.ts` — categories → transactions → statistics
- [ ] `subscription.e2e-spec.ts` — webhook handling → status check

---

## Verification Gates

Before marking any phase as complete, run:

```bash
# 1. Build
pnpm --filter @yeu-pet/api build

# 2. Lint
pnpm --filter @yeu-pet/api lint

# 3. Unit tests
pnpm --filter @yeu-pet/api test:unit

# 4. E2E tests (if applicable)
pnpm --filter @yeu-pet/api test:e2e
```

---

## Reference Architecture Patterns

When implementing any new file, follow these patterns from `smart-booking`:

| Pattern                   | Location in smart-booking                                     | File                                                   |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| Repository with interface | `src/modules/users/users.repository.ts`                       | Implement + export interface                           |
| Cache wrapping            | `src/modules/users/users.service.ts`                          | `this.cacheService.wrap(key, ttl, fetcher)`            |
| Distributed lock          | `src/modules/bookings/bookings.service.ts`                    | `this.distributedLockService.withLock(id, fn, prefix)` |
| Queue dispatch            | `src/modules/shared/queue/queue.service.ts`                   | `this.queueService.dispatchBookingConfirmed(payload)`  |
| Cron task                 | `src/modules/bookings/tasks/cleanup-expired-bookings.task.ts` | `@Cron(CronExpression.EVERY_MINUTE)`                   |
| Swagger decorator         | `src/decorators/swagger.decorator.ts`                         | `@ApiOkResponse({ summary, response })`                |
| Response DTO              | `src/modules/users/dto/response-user.dto.ts`                  | `implements User` + `@ApiProperty()`                   |
| Serialized transaction    | `src/modules/bookings/bookings.repository.ts`                 | `$transaction(tx => {...}, { isolationLevel })`        |

---

## Completed Progress

- [ ] Phase 1: Foundation Infrastructure
- [ ] Phase 2: Infrastructure Enhancement
- [ ] Phase 3: Module Refactoring
- [ ] Phase 4: Module Consolidation
- [ ] Phase 5: Feature Enhancements
- [ ] Phase 6: Testing
