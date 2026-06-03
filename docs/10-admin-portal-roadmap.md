# 10 — Admin Portal Roadmap

## 1. Purpose

Admin portal is not part of immediate phase 1 implementation. It should be planned after mobile app and backend are stable.

The future admin portal will help manage users, pets, content, subscriptions, reports, sitters, bookings, and business metrics.

## 2. Recommended tech direction

Since monorepo already uses pnpm:

```txt
apps/admin or apps/portal
```

Possible stack:

```txt
Next.js or React SPA
Admin API via apps/api
Role-based access control using accounts.role = admin
```

## 3. Admin features

### User management

- List/search users
- View profile
- View subscription state
- Disable/reactivate account
- View usage counters

### Pet/content overview

- View pets count and activity
- View medical record count summary only; be careful with private health data
- View reminder usage summary

### Photos moderation

- View reported photos/comments
- Hide/delete inappropriate content
- Resolve/reject reports
- View blocked users if needed

### Sitter management

- View sitter profiles
- Verify/unverify sitter
- Disable sitter listing
- View sitter rating/reviews

### Booking monitoring

- View bookings
- Filter by status
- View cancellation/review statistics
- Do not interfere with external payment unless future policy exists

### Subscription management

- View plan/status
- Manual grant premium for testing/support
- Webhook event logs

### AI usage monitoring

- Usage by user
- Cost estimate
- Safety flag counts
- Abuse detection

### App configuration

- Feature flags
- Subscription limit config
- AI model config
- Announcement/maintenance banner

## 4. Admin API preparation

Backend should eventually support:

```txt
GET /admin/users
GET /admin/users/:id
PATCH /admin/users/:id/status
GET /admin/reports
POST /admin/reports/:id/resolve
GET /admin/sitters
PATCH /admin/sitters/:id/verify
GET /admin/subscriptions
POST /admin/users/:id/grant-premium
GET /admin/metrics
```

## 5. RBAC

Use `accounts.role`:

```txt
user
admin
```

Later:

```txt
support
moderator
super_admin
```

## 6. Important privacy note

Admin portal must be careful with medical records and AI conversations. These may contain sensitive user/pet health information.

Default admin view should show metadata and summaries, not expose full private content unless necessary for support/moderation.

## 7. Admin portal timing

Recommended order:

```txt
1. Finish phase 1 mobile/backend
2. Add reports/blocking in API
3. Add basic admin auth/RBAC
4. Build moderation dashboard first
5. Add user/subscription management
6. Add metrics dashboard
```
