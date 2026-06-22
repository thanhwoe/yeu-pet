# 12 — Mobile API Contract

This is the canonical backend contract for Phase 1 mobile frontend integration.

All routes require JWT authentication unless marked public. Use the account id from the token; do not send `accountId` in request bodies.

## Canonical Endpoint Decisions

| Area                  | Canonical mobile endpoint                                                           | Compatibility routes kept                          |
| --------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| Profile               | `/me`, `/me/avatar`                                                                 | `/users/me`                                        |
| Settings              | `PATCH /settings`                                                                   | `PUT /settings`                                    |
| Budget                | `/budgets`, `/budgets/statistics/*`, `/budgets/categories`, `/budgets/transactions` | None                                               |
| Social feed           | `GET /photos/social`                                                                | `GET /photos`                                      |
| Likes                 | `POST /photos/:id/like`, `DELETE /photos/:id/like`                                  | `POST /photos/:id/toggle-like`                     |
| Reports               | `POST /reports`                                                                     | `POST /photos/:id/report`                          |
| Sitter profile        | `/sitters/me`                                                                       | `POST /sitters/register`                           |
| Sitter bookings       | `GET /sitter-bookings/me`, POST action routes                                       | PATCH action routes, `GET /sitter-bookings/sitter` |
| Subscriptions webhook | `POST /subscriptions/webhooks/revenuecat`                                           | `/subscription/webhook`, `/subscriptions/webhook`  |

Frontend should use only canonical endpoints unless a compatibility route is explicitly needed for an old client.

## Public Auth

```txt
POST /auth/register
POST /auth/login
POST /auth/refresh-token
POST /users/password/request
POST /users/password/reset
```

Authenticated auth/account utility routes:

```txt
POST   /auth/logout
POST   /users/verify
POST   /users/resend-otp
POST   /users/password/update
POST   /users/complete-onboarding
GET    /me
PATCH  /me
DELETE /me
POST   /me/avatar
DELETE /me/avatar
POST   /me/email-change/request
POST   /me/email-change/verify
POST   /me/email-change/resend
POST   /me/email-change/cancel
```

`PATCH /me` only accepts safe profile fields such as `firstName` and `lastName`.
Email changes must use the OTP flow below.

Request email change:

```ts
POST / me / email - change / request;
{
  newEmail: string;
}
```

Response:

```ts
{
  requestId: string
  newEmail: string
  maskedEmail: string
  expiresAt: string
  resendAvailableAt?: string
}
```

Verify email change:

```ts
POST / me / email - change / verify;
{
  requestId: string;
  otp: string; // 6 digits
}
```

Response:

```ts
{
  account: IUser;
}
```

Resend/cancel both accept `{ requestId: string }`. Resend returns the same request metadata shape as request.

## Settings

```txt
GET   /settings
PATCH /settings
```

Supported fields:

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

## Subscriptions

```txt
GET  /subscriptions/me
GET  /subscriptions/entitlements
POST /subscriptions/mock-upgrade
POST /subscriptions/mock-downgrade
```

Use `/subscriptions/entitlements` for feature gating in the app. Mock upgrade/downgrade routes are development helpers.

## Pets

```txt
GET    /pets
POST   /pets
GET    /pets/:id
PATCH  /pets/:id
DELETE /pets/:id
```

`POST /pets` and `PATCH /pets/:id` accept multipart avatar uploads. Numeric weight fields are `weightValue` and `weightUnit`; legacy `weight` is still accepted temporarily.

## Reminders

```txt
GET    /reminders?from=&to=&petId=&status=&type=
GET    /reminders/upcoming?limit=
POST   /reminders
GET    /reminders/:id
PATCH  /reminders/:id
DELETE /reminders/:id
POST   /reminders/:id/complete
POST   /reminders/:id/skip
POST   /reminders/:id/cancel
```

## Medical Records

```txt
GET    /pets/:id/medical-records
POST   /pets/:id/medical-records
POST   /medical-records
GET    /medical-records/:id
PATCH  /medical-records/:id
DELETE /medical-records/:id
POST   /medical-records/:id/attachments
DELETE /medical-records/:id/attachments/:attachmentId
```

Use `POST /pets/:id/medical-records` as the canonical mobile create route. `POST /medical-records` remains available when sending `petId` in the body.

Attachment uploads use multipart field `attachments`. Created uploads are queued and may return processing status before files are ready.

## Budget

```txt
GET   /budgets?month=&year=&petId=
POST  /budgets
PATCH /budgets
GET   /budgets/statistics/monthly?month=&year=&petId=
GET   /budgets/statistics/yearly?year=&petId=

GET    /budgets/categories
POST   /budgets/categories
PATCH  /budgets/categories/:id
DELETE /budgets/categories/:id

GET    /budgets/transactions?month=&year=&categoryId=&petId=
POST   /budgets/transactions
PATCH  /budgets/transactions/:id
DELETE /budgets/transactions/:id
```

`GET /budgets` returns the monthly budget summary with spent/remaining values.

## Photos Social

```txt
GET    /photos/social
GET    /photos/me?visibility=all|public|private
POST   /photos
GET    /photos/:id
PATCH  /photos/:id
DELETE /photos/:id
POST   /photos/:id/like
DELETE /photos/:id/like
SSE    /photos/:id/upload-status

GET    /photos/:id/comments
POST   /photos/:id/comments
POST   /photos/:id/comments/:commentId/replies
GET    /photos/:id/comments/:commentId/replies
DELETE /photos/:id/comments/:commentId
```

Social feed returns public, ready, not-deleted photos and excludes blocked/blocking accounts.

## Reports And Blocks

```txt
POST   /reports
GET    /reports/me
GET    /blocks/me
POST   /blocks/:id
DELETE /blocks/:id
```

`POST /reports` body:

```ts
{
  targetType: 'photo' | 'comment' | 'sitter' | 'user'
  targetId: string
  reason: string
  description?: string
}
```

## Sitters

```txt
GET   /sitters?city=&district=&minRating=&maxPrice=
POST  /sitters/me
GET   /sitters/me
PATCH /sitters/me
GET   /sitters/:id
PATCH /sitters/:id
```

Sitter discovery excludes blocked/blocking accounts.

## Sitter Bookings

```txt
POST   /sitter-bookings
GET    /sitter-bookings/me?role=owner|sitter&status=
GET    /sitter-bookings/:id
POST   /sitter-bookings/:id/accept
POST   /sitter-bookings/:id/reject
POST   /sitter-bookings/:id/cancel
POST   /sitter-bookings/:id/complete
POST   /sitter-bookings/:id/review
GET    /sitter-bookings/:id/messages
POST   /sitter-bookings/:id/messages
```

Payment is external in Phase 1. Booking responses include payment metadata for mobile copy.

## AI

```txt
GET    /ai/conversations
POST   /ai/conversations
GET    /ai/conversations/:id/messages
POST   /ai/conversations/:id/messages/stream
DELETE /ai/conversations/:id
```

The mobile app never calls AI providers directly. Backend provider is selected through `AI_PROVIDER=fallback|openai|gemini`.

## Notifications And Devices

```txt
POST   /devices
DELETE /devices/:id
GET    /notifications
GET    /notifications/badge
PATCH  /notifications/:id/read
POST   /notifications/read-all
DELETE /notifications/:id
```

Register mobile push tokens with `/devices`.

`POST /devices` requires the Firebase `pushToken`, platform/device metadata, a
stable per-install `installationId`, and a monotonic `registrationGeneration`
incremented for each new login session. Registering a new token for the same
installation deactivates that installation's previous token rows. Registering
an existing token reassigns it to the authenticated account; stale account
registration generations are rejected with `409 Conflict`.

For normal single-device logout, call `POST /auth/logout` with both
`refreshToken` and the current `deviceId`. The backend conditionally deactivates
that device for the authenticated account before revoking the refresh token.
`DELETE /devices/:id` remains an authenticated, idempotent explicit unregister.

## Integration Notes

- Pagination uses `page` and `limit`.
- Delete routes commonly return `204 No Content`.
- Quota errors use `429`.
- Ownership failures generally return `403` or hidden-resource `404`, depending on feature privacy.
- Multipart file fields: pet/photo uploads use `file` or `avatar` depending on endpoint; medical records use `attachments`; account avatar uses `avatar`.
- Backend external dependencies for production: Supabase/Postgres, Redis/BullMQ, Firebase push credentials, storage provider credentials, and optional OpenAI/Gemini API keys.
