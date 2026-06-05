# 04 — Backend API Refactor & Implementation Plan

## 1. Backend goals

Backend should provide stable, secure APIs for the mobile app and future admin portal.

Main goals:

- Clean NestJS modules.
- Strong DTO validation.
- Ownership checks for every user-owned resource.
- Consistent pagination and response shape.
- Subscription entitlement enforcement.
- AI provider handled only by backend.
- Push notification scheduling support.

## 2. Suggested module structure

```txt
apps/api/src
├── common
│   ├── decorators
│   ├── filters
│   ├── guards
│   ├── interceptors
│   ├── pagination
│   ├── pipes
│   └── utils
├── config
├── database
├── auth
├── accounts
├── settings
├── subscriptions
├── pets
├── reminders
├── medical-records
├── budgets
├── photos
├── notifications
├── ai
├── sitters
├── sitter-bookings
├── reports
└── health
```

## 3. API principles

### Authentication

- All user APIs require auth except login/register/OTP public APIs.
- Use account id from auth context, never trust `account_id` from request body.

### Authorization

Every service must verify ownership:

- Pet belongs to account.
- Reminder belongs to account.
- Medical record belongs to pet owned by account.
- Budget transaction belongs to account.
- Photo mutation owner only.
- Booking participant only.
- Review allowed only by booking owner after completion.

### Response shape

Use a consistent response format where possible:

```ts
{
  data: T,
  meta?: {
    page?: number,
    limit?: number,
    total?: number,
  }
}
```

### Errors

Use clear errors:

- `400 Bad Request` validation
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity` for business rule violation
- `429 Too Many Requests` for usage/quota limits

## 4. Endpoint plan

### 4.1 Accounts & profile

```txt
GET    /me
PATCH  /me
DELETE /me
POST   /me/avatar
DELETE /me/avatar
```

Implementation note:

- Root `/me` routes are implemented in `UsersModule`.
- Existing `/users/me` routes remain available for compatibility.
- `DELETE /me` is the canonical mobile account deactivation route; `/users/me` remains available for compatibility.
- Public profile reads do not include `password_hash`.
- Avatar upload is queued; avatar delete clears account avatar fields and queues file deletion when needed.

### 4.2 Settings

```txt
GET   /settings
PATCH /settings
```

DTO fields:

```ts
{
  notificationEnable?: boolean
  reminderNotifications?: boolean
  bookingNotifications?: boolean
  socialNotifications?: boolean
  aiNotifications?: boolean
  language?: 'vi' | 'en'
  theme?: 'system' | 'light' | 'dark'
}
```

### 4.3 Subscriptions

```txt
GET  /subscriptions/me
GET  /subscriptions/entitlements
POST /subscriptions/mock-upgrade        # dev only
POST /subscriptions/webhooks/revenuecat # later
```

Backend must expose current limits to FE:

```ts
{
  tier: 'free' | 'premium',
  status: 'free' | 'trialing' | 'active' | 'expired',
  limits: {...},
  usage: {...}
}
```

### 4.4 Pets

```txt
GET    /pets
POST   /pets
GET    /pets/:id
PATCH  /pets/:id
DELETE /pets/:id
POST   /pets/:id/avatar
```

Important service rules:

- Check Free max pets.
- Delete/archive with confirmation on FE.
- Do not return other users' pets.

Implementation note:

- Current NestJS implementation accepts avatar uploads on `POST /pets` and `PATCH /pets/:id` multipart requests.
- Numeric pet weight is supported through `weightValue` and `weightUnit`, while legacy string `weight` is kept temporarily for mobile compatibility.

### 4.5 Reminders

```txt
GET    /reminders?from=&to=&petId=&status=&type=
GET    /reminders/upcoming?limit=5
POST   /reminders
GET    /reminders/:id
PATCH  /reminders/:id
DELETE /reminders/:id
POST   /reminders/:id/complete
POST   /reminders/:id/skip
POST   /reminders/:id/cancel
```

Important service rules:

- Validate pet ownership.
- Check active reminder limit.
- Recurring reminders require Premium.
- Update/delete must handle notification rescheduling/cancellation.
- Timezone must be stored and returned.

### 4.6 Medical Records

```txt
GET    /pets/:petId/medical-records
POST   /pets/:petId/medical-records
GET    /medical-records/:id
PATCH  /medical-records/:id
DELETE /medical-records/:id
POST   /medical-records/:id/attachments
DELETE /medical-records/:id/attachments/:attachmentId
```

Important service rules:

- Validate pet ownership.
- Enforce record limit.
- Enforce images per record limit.
- Upload process should support status: processing/ready/failed.

### 4.7 Budget

```txt
GET    /budgets?month=&year=&petId=
POST   /budgets
PATCH  /budgets
GET    /budgets/statistics/monthly?month=&year=&petId=
GET    /budgets/statistics/yearly?year=&petId=
GET    /budgets/transactions?month=&year=&categoryId=&petId=
POST   /budgets/transactions
PATCH  /budgets/transactions/:id
DELETE /budgets/transactions/:id
GET    /budgets/categories
POST   /budgets/categories
PATCH  /budgets/categories/:id
DELETE /budgets/categories/:id
```

Important service rules:

- Category name unique per account only.
- Transaction optional petId must be owned by account.
- Amount must be positive.
- Summary must handle zero budget and over-budget.

### 4.8 Photos Social

```txt
GET    /photos/social?cursor=&limit=
GET    /photos/me?visibility=all|public|private&cursor=&limit=
POST   /photos
GET    /photos/:id
DELETE /photos/:id
POST   /photos/:id/like
DELETE /photos/:id/like
GET    /photos/:id/comments
POST   /photos/:id/comments
POST   /photos/:id/comments/:commentId/replies
DELETE /photos/:id/comments/:commentId
POST   /photos/:id/report
```

Important service rules:

- Social feed shows public + ready + not deleted photos only.
- Private photos visible only to owner.
- Owner-only delete.
- Like unique per account/photo.
- Soft delete comments.
- Optional petId must be owned by account.

Implementation note:

- Current NestJS implementation uses existing `page`/`limit` pagination DTOs.
- `POST /photos/:id/like` and `DELETE /photos/:id/like` are idempotent.
- `POST /photos/:id/toggle-like` remains available as a compatibility route.
- Photo upload is limited by subscription entitlements.
- Social feed excludes accounts the viewer blocked, and accounts that blocked the viewer.

### 4.9 Doctor AI / Pet Care AI

```txt
GET    /ai/conversations
POST   /ai/conversations
GET    /ai/conversations/:id/messages
POST   /ai/conversations/:id/messages/stream
DELETE /ai/conversations/:id
```

Important service rules:

- Backend calls AI provider.
- Mobile must not call provider directly.
- Enforce AI usage limit.
- Stream response to FE.
- Save user and assistant messages.
- Add safety disclaimer and urgent-case guard.

Implementation note:

- Current NestJS implementation stores conversations/messages in Prisma AI tables.
- `POST /ai/conversations/:id/messages/stream` emits SSE events after backend generation and persistence.
- Provider calls are isolated in `AiProviderService`; set `AI_PROVIDER=openai` or `AI_PROVIDER=gemini` to switch providers. If the selected provider key is missing, the backend returns a safe fallback response.
- Pet context requires Premium and pet ownership.
- Medical-record context is included for Premium users when a pet context conversation has recent records.

### 4.10 Sitter Profiles

```txt
GET    /sitters?city=&district=&petType=&minRating=&maxPrice=&cursor=&limit=
POST   /sitters/me
GET    /sitters/me
PATCH  /sitters/me
GET    /sitters/:id
```

Important service rules:

- One sitter profile per account.
- Owner cannot book themselves.
- Search should support area and availability later.

Implementation note:

- Current NestJS implementation supports `page`/`limit` pagination.
- `POST /sitters/me`, `GET /sitters/me`, and `PATCH /sitters/me` manage the current user's sitter profile.
- `POST /sitters/register` remains available as a compatibility route.
- Search supports `address`, `city`, `district`, `minRating`, and `maxPrice`.

### 4.11 Sitter Booking

```txt
GET    /sitter-bookings/me?role=owner|sitter&status=
POST   /sitter-bookings
GET    /sitter-bookings/:id
POST   /sitter-bookings/:id/accept
POST   /sitter-bookings/:id/reject
POST   /sitter-bookings/:id/cancel
POST   /sitter-bookings/:id/complete
POST   /sitter-bookings/:id/review
GET    /sitter-bookings/:id/messages
POST   /sitter-bookings/:id/messages
```

Important service rules:

- Booking owner must own selected pet.
- Sitter must be available.
- Status transition must be enforced.
- Review only after completed booking and only once.
- Payment is outside app in phase 1.

Implementation note:

- Current NestJS implementation supports `page`/`limit` pagination.
- `GET /sitter-bookings/me` dispatches by `role=owner|sitter`.
- POST action routes are implemented for mobile, with existing PATCH routes kept for compatibility.
- Booking responses include `payment.inApp=false` and an external payment note.
- Booking messages are list/create only and require booking participant access.
- Sitter discovery excludes accounts the viewer blocked, and accounts that blocked the viewer.

### 4.11 Reports / Blocking

```txt
POST   /reports
GET    /reports/me
GET    /blocks/me
POST   /blocks/:id
DELETE /blocks/:id
```

Important service rules:

- `POST /reports` accepts `targetType=photo|comment|sitter|user`, validates the target exists, and rejects self-reports.
- `POST /photos/:id/report` remains available as a photo-specific compatibility route.
- Blocking is idempotent and rejects self-blocks.
- Blocked relationships affect social photo feed and sitter discovery in both directions.

## 5. Entitlement service

Create a central service:

```ts
EntitlementService
- getCurrentPlan(accountId)
- getLimits(accountId)
- assertCanCreatePet(accountId)
- assertCanCreateReminder(accountId, input)
- assertCanCreateMedicalRecord(accountId)
- assertCanUploadMedicalImages(accountId, count)
- assertCanCreateBudgetTransaction(accountId)
- assertCanUploadPhoto(accountId)
- assertCanUseAi(accountId)
- incrementUsage(accountId, featureKey)
```

No feature module should hardcode plan limits directly.

## 6. Notification service

Needed for reminders and future booking/social notifications.

```ts
NotificationService
- registerDevice(accountId, pushToken, metadata)
- createNotification(accountId, payload)
- sendPushToAccount(accountId, payload)
- scheduleReminder(reminder)
- cancelScheduledReminder(reminder)
```

For Expo, persist device push tokens and delivery logs.

## 7. File upload service

Centralize uploads:

```ts
FileStorageService
- createUploadUrl
- uploadFromMultipart
- deleteFile
- getPublicUrl
- createThumbnail if applicable
```

Used by:

- pet avatar
- account avatar
- medical attachments
- photos social
- sitter profile images later

## 8. Backend implementation checklist

- [x] Create/verify common auth guard.
- [x] Create current account decorator.
- [x] Create pagination DTO.
- [x] Create entitlement service.
- [x] Refactor pets module.
- [x] Refactor reminders module.
- [x] Refactor medical records module.
- [x] Refactor budget module.
- [x] Refactor photos module.
- [x] Implement settings module.
- [x] Implement subscriptions module.
- [x] Implement AI module with streaming.
- [x] Implement sitter booking FE-support APIs.
- [x] Add tests for business rules.
- [x] Add API documentation or endpoint checklist.
