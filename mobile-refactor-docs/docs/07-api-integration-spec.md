# 07 — API Integration Spec

This document tells the mobile agent how to integrate backend APIs safely.

## Source of truth

Use the latest backend mobile API contract in the project. The expected canonical endpoints include:

- `/me` for profile
- `/settings` for settings
- `/subscriptions/me` and `/subscriptions/entitlements`
- `/pets`
- `/reminders`
- `/pets/:id/medical-records` and `/medical-records/:id`
- `/budgets`
- `/photos/social` and `/photos/me`
- `/reports`
- `/sitters/me` and `/sitters`
- `/sitter-bookings`
- `/ai/conversations`
- `/devices` and `/notifications`

Do not rely on old endpoint names from old docs or old code.

## API client requirements

Create/refactor:

```txt
src/api/client.ts
src/api/errors.ts
src/api/queryKeys.ts
```

### `client.ts`

Responsibilities:

- Create Axios instance.
- Set base URL from app config/environment.
- Attach access token.
- Handle refresh token flow if backend supports it.
- Handle 401 and logout/session expired.
- Normalize error shape.
- Support multipart requests.

### `errors.ts`

Define a normalized app error:

```ts
export type AppApiError = {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
};
```

### `queryKeys.ts`

Define stable query keys:

```ts
export const queryKeys = {
  me: ['me'] as const,
  settings: ['settings'] as const,
  subscription: ['subscriptions', 'me'] as const,
  entitlements: ['subscriptions', 'entitlements'] as const,
  pets: ['pets'] as const,
  pet: (id: string) => ['pets', id] as const,
  reminders: (filters: unknown) => ['reminders', filters] as const,
  upcomingReminders: (limit?: number) => ['reminders', 'upcoming', limit] as const,
  medicalRecords: (petId: string) => ['pets', petId, 'medical-records'] as const,
  budgetSummary: (params: unknown) => ['budgets', 'summary', params] as const,
  budgetStatistics: (params: unknown) => ['budgets', 'statistics', params] as const,
  photosSocial: (params: unknown) => ['photos', 'social', params] as const,
  photosMe: (params: unknown) => ['photos', 'me', params] as const,
  sitters: (filters: unknown) => ['sitters', filters] as const,
  sitterBookings: (params: unknown) => ['sitter-bookings', 'me', params] as const,
  aiConversations: ['ai', 'conversations'] as const,
  notifications: ['notifications'] as const,
};
```

## Endpoint modules

Create/refactor modules:

```txt
src/api/auth.api.ts
src/api/me.api.ts
src/api/settings.api.ts
src/api/subscriptions.api.ts
src/api/pets.api.ts
src/api/reminders.api.ts
src/api/medical-records.api.ts
src/api/budgets.api.ts
src/api/photos.api.ts
src/api/reports.api.ts
src/api/sitters.api.ts
src/api/sitter-bookings.api.ts
src/api/ai.api.ts
src/api/devices.api.ts
src/api/notifications.api.ts
```

Each API module should:

- Export typed functions.
- Accept DTOs/query params.
- Return typed responses.
- Avoid UI-specific logic.
- Avoid React hooks.

React Query hooks can be colocated in feature modules.

## Legacy endpoint audit

Search for and replace old endpoints.

Avoid:

```txt
/users/me
PUT /settings
GET /photos
POST /photos/:id/toggle-like
POST /sitters/register
PATCH sitter booking action routes
GET /sitter-bookings/sitter
/subscription/webhook
/subscriptions/webhook
```

Use canonical endpoints instead.

Create a section in `apps/mobile/docs/mobile-refactor-audit.md`:

```txt
Legacy Endpoint Audit
- old endpoint
- file path
- replacement endpoint
- status
```

## React Query rules

- Use `useQuery` for GET.
- Use `useMutation` for create/update/delete/actions.
- Invalidate only related queries.
- Do not invalidate the entire app after every mutation.
- Use optimistic update only for like/unlike if rollback is implemented.
- Use infinite query for social feed/comments if pagination is ready.

## Auth/token handling

- Store tokens in Expo Secure Store.
- Do not store tokens in AsyncStorage unless project already made that decision and it is documented.
- On logout:
  - call backend logout
  - clear secure tokens
  - clear user/session store
  - clear React Query cache
  - navigate to auth route

## Multipart upload rules

Expected upload fields:

- account avatar: `avatar`
- pet avatar: check backend contract; likely `avatar` or `file`
- photo upload: check backend contract; likely `file`
- medical record attachments: `attachments`

The agent must inspect backend contract/controller if field name is ambiguous.

## Pet Care AI API rules

- Do not use `@google/genai` from mobile.
- Backend owns provider and API keys.
- Use `/ai/conversations` endpoints.
- Streaming should be implemented using backend-supported method.
- If React Native streaming is unstable, document limitation and implement safest supported behavior.

## Sitter messages rules

- Keep HTTP:
  - `GET /sitter-bookings/:id/messages`
  - `POST /sitter-bookings/:id/messages`
- Optional polling while chat screen is focused is acceptable.
- Do not add WebSocket.

## Error handling rules

Handle:

- 400 validation errors
- 401 session expired
- 403 ownership/permission
- 404 hidden/not found
- 409 duplicate/conflict
- 429 quota/limit exceeded
- 500 fallback message

Quota errors should show contextual upgrade/paywall UI.

## API integration done criteria

A feature's API integration is done when:

- It uses canonical endpoint.
- It has typed DTOs/responses.
- It uses React Query hooks.
- It handles loading/error/empty states.
- It invalidates relevant queries after mutation.
- It handles 401 and quota errors.
- It does not send `accountId`.
