# 05 — Feature Module Spec

This document defines how each Phase 1 feature should be organized and refactored.

## General feature structure

```txt
src/features/<feature>/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
├── constants.ts
├── utils.ts
├── components/
├── screens/
└── index.ts
```

## Auth / Account / Profile

Target feature folder:

```txt
src/features/me/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
├── components/
│   ├── ProfileHeader.tsx
│   └── EditProfileForm.tsx
└── screens/
    └── EditProfileScreen.tsx
```

Responsibilities:

- `GET /me`
- `PATCH /me`
- `POST /me/avatar`
- `DELETE /me/avatar`
- `POST /auth/logout`

Rules:

- Do not expose sensitive fields.
- Settings screen can reuse profile header/form.
- Avatar upload must use multipart field expected by backend.

## Settings

Target feature folder:

```txt
src/features/settings/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
├── constants.ts
├── components/
│   ├── SettingsSection.tsx
│   ├── SettingsRow.tsx
│   ├── ThemeSelector.tsx
│   ├── LanguageSelector.tsx
│   └── NotificationSettings.tsx
└── screens/
    └── SettingsScreen.tsx
```

Responsibilities:

- `GET /settings`
- `PATCH /settings`
- profile entry
- subscription entry
- theme/language/notification toggles
- logout

Rules:

- Theme values: `system`, `light`, `dark`.
- Language values: `vi`, `en`.
- Toggle changes should optimistically update only if rollback is handled.

## Subscriptions

Target feature folder:

```txt
src/features/subscriptions/
├── api.ts
├── hooks.ts
├── types.ts
├── constants.ts
├── utils.ts
├── components/
│   ├── SubscriptionCard.tsx
│   ├── PaywallNotice.tsx
│   └── EntitlementGate.tsx
└── screens/
    └── SubscriptionScreen.tsx
```

Responsibilities:

- `GET /subscriptions/me`
- `GET /subscriptions/entitlements`
- dev-only mock upgrade/downgrade if enabled

Rules:

- Create helper functions for feature gating.
- Paywall should be contextual.
- Do not block too aggressively.

## Pets

Target feature folder:

```txt
src/features/pets/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
├── constants.ts
├── utils.ts
├── components/
│   ├── PetCardCarousel/
│   ├── PetCard.tsx
│   ├── PetDetailCard.tsx
│   ├── AddPetCard.tsx
│   ├── PetInfoForm.tsx
│   └── PetAvatar.tsx
└── screens/
    └── PetDetailScreen.tsx
```

Responsibilities:

- `GET /pets`
- `POST /pets`
- `GET /pets/:id`
- `PATCH /pets/:id`
- `DELETE /pets/:id`

Rules:

- Use `weightValue` and `weightUnit`.
- Keep temporary legacy `weight` only if current UI still depends on it.
- Delete requires confirm dialog.
- Avatar upload uses multipart.

## Reminders

Target feature folder:

```txt
src/features/reminders/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
├── constants.ts
├── utils.ts
├── components/
│   ├── ReminderCalendar/
│   ├── ReminderForm.tsx
│   ├── ReminderItem.tsx
│   ├── ReminderStatusBadge.tsx
│   ├── ReminderTypeIcon.tsx
│   └── ReminderFilters.tsx
└── screens/
    └── ReminderScreen.tsx
```

Responsibilities:

- list reminders
- upcoming reminders
- create/update/delete
- complete/skip/cancel
- date range filters

Rules:

- No invalid dates.
- Use `dayjs` consistently.
- If recurrence is not stable in UI, do not expose complex recurrence yet.

## Medical Records

Target feature folder:

```txt
src/features/medical-records/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
├── constants.ts
├── utils.ts
├── components/
│   ├── MedicalRecordForm.tsx
│   ├── MedicalRecordCard.tsx
│   ├── MedicalRecordTimeline.tsx
│   ├── MedicalAttachmentGrid.tsx
│   └── MedicalRecordTypeBadge.tsx
└── screens/
    ├── MedicalRecordsScreen.tsx
    └── MedicalRecordDetailScreen.tsx
```

Responsibilities:

- records by pet
- create/update/delete
- attachments upload/delete
- detail screen
- image viewer

Rules:

- Max images follows entitlements/backend errors.
- Show attachment processing/ready/failed.
- Use pet selector when needed.

## Budget

Target feature folder:

```txt
src/features/budget/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
├── constants.ts
├── utils.ts
├── components/
│   ├── BudgetSummaryCard.tsx
│   ├── BudgetProgressCard.tsx
│   ├── BudgetChartCard.tsx
│   ├── BudgetCategoryForm.tsx
│   ├── BudgetCategoryStatistic.tsx
│   ├── BudgetTransactionForm.tsx
│   ├── TransactionItem.tsx
│   └── charts/
└── screens/
    ├── BudgetScreen.tsx
    ├── BudgetCategoriesScreen.tsx
    └── BudgetTransactionsScreen.tsx
```

Responsibilities:

- monthly budget
- monthly/yearly statistics
- transactions
- categories
- charts

Rules:

- Format VND.
- Cap progress display at 100%.
- Show over-budget state clearly.
- Support month/year and optional pet filter.

## Photos

Target feature folder:

```txt
src/features/photos/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
├── constants.ts
├── utils.ts
├── components/
│   ├── PhotoGrid.tsx
│   ├── PhotoCard.tsx
│   ├── PhotoUploadSheet.tsx
│   ├── PhotoDetailModal.tsx
│   ├── LikeButton.tsx
│   ├── CommentList.tsx
│   ├── CommentItem.tsx
│   └── CommentInput.tsx
└── screens/
    └── PhotosScreen.tsx
```

Responsibilities:

- social feed
- my photos
- upload
- like/unlike
- comment/reply/delete
- report

Rules:

- Use `GET /photos/social`, not legacy `GET /photos`.
- Use explicit like/unlike, not legacy toggle-like.
- Private photos must only appear in My Photos.

## Sitter

Target feature folder:

```txt
src/features/sitter/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
├── constants.ts
├── utils.ts
├── components/
│   ├── SitterProfileForm.tsx
│   ├── SitterCard.tsx
│   ├── SitterFilters.tsx
│   ├── BookingRequestForm.tsx
│   ├── BookingStatusBadge.tsx
│   ├── BookingCard.tsx
│   ├── ReviewForm.tsx
│   └── BookingMessageThread.tsx
└── screens/
    ├── SitterScreen.tsx
    ├── SitterDetailScreen.tsx
    ├── MySitterProfileScreen.tsx
    ├── SitterBookingsScreen.tsx
    └── BookingMessagesScreen.tsx
```

Responsibilities:

- sitter profile
- sitter discovery
- booking request
- booking actions
- review
- HTTP messages

Rules:

- No WebSocket.
- No in-app payment.
- Show external payment/arrangement copy.

## Pet Care AI

Target feature folder:

```txt
src/features/ai/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
├── constants.ts
├── utils.ts
├── components/
│   ├── AIConversationList.tsx
│   ├── AIChatBubble.tsx
│   ├── AIMessageInput.tsx
│   ├── AIDisclaimer.tsx
│   ├── AIQuotaNotice.tsx
│   └── AIStreamingMessage.tsx
└── screens/
    ├── DoctorAIScreen.tsx
    └── AIConversationScreen.tsx
```

Responsibilities:

- conversations
- messages
- backend streaming
- quota errors
- safety disclaimer

Rules:

- Do not call `@google/genai` from mobile.
- Do not present as real vet diagnosis.
- If streaming is unstable, document fallback/limitation.

## Notifications

Target feature folder:

```txt
src/features/notifications/
├── api.ts
├── hooks.ts
├── types.ts
├── utils.ts
├── components/
│   ├── NotificationItem.tsx
│   └── NotificationBadge.tsx
└── screens/
    └── NotificationsScreen.tsx
```

Responsibilities:

- register device token
- notifications list
- badge
- mark read
- read all
- delete

Rules:

- Respect notification settings.
- On logout, clean local token/session; unregister device if API supports it.
