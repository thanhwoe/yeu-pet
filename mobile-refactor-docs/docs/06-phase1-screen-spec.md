# 06 — Phase 1 Screen Refactor Spec

This document gives screen-by-screen requirements for the Phase 1 mobile refactor.

## General screen requirements

Every Phase 1 screen must include:

- Loading state
- Empty state
- Error state
- Retry or refresh action where useful
- Mutation pending state
- Themed light/dark UI
- Safe area handling
- Keyboard handling for forms
- Delete/cancel confirmation
- No raw Axios calls
- No legacy endpoint usage

## Home Screen

Current related areas:

- `screens/Home`
- `components/PetCardCarousel`
- `components/Headers/HomeHeader`
- `components/ServiceCard`

Target:

```txt
src/features/home/screens/HomeScreen.tsx
src/features/pets/components/PetCardCarousel/
src/features/reminders/components/UpcomingReminderList.tsx
```

Home content:

1. Greeting header.
2. Pet carousel hero section.
3. Upcoming reminders section.
4. Quick services grid.
5. Optional subscription/AI upsell card.

Rules:

- Pet carousel should use real `GET /pets` data or `/home/summary` if implemented.
- Upcoming reminders should use `GET /reminders/upcoming` or `/home/summary`.
- Do not show too many actions on pet card.
- Edit/delete can move to menu or bottom sheet action.
- Add pet card should be clear.
- Empty state when no pets: invite user to add first pet.

## Settings Screen

Current related areas:

- `features/settings`
- possible settings route under `app/(tabs)`

Target:

```txt
src/features/settings/screens/SettingsScreen.tsx
```

Content:

1. Profile header.
2. Subscription card.
3. Account section.
4. Notifications section.
5. Appearance section.
6. Language section.
7. Support/legal if available.
8. Logout.

API:

- `GET /settings`
- `PATCH /settings`
- `GET /me`
- `PATCH /me`
- `POST /auth/logout`

Rules:

- Theme change applies immediately and persists.
- Language change persists.
- Notification toggles persist.
- Logout clears secure tokens and query cache.

## Pet Management

Current related areas:

- `components/PetCardCarousel`
- `components/PetInfoForm`

Target:

```txt
src/features/pets/components/*
src/features/pets/screens/*
```

Capabilities:

- list pets
- create pet
- update pet
- delete pet
- avatar upload

Fields:

- name
- species
- breed
- gender
- birthdate/age
- `weightValue`
- `weightUnit`
- color
- notes
- avatar

Rules:

- Validate with Zod.
- Delete confirmation required.
- Show entitlement/paywall when free pet limit is reached.
- Do not send `accountId`.

## Reminder Screen

Current related areas:

- `screens/Reminder`
- `components/ReminderCalendar`
- `components/ReminderForm`
- `components/ReminderIcons`

Target:

```txt
src/features/reminders/screens/ReminderScreen.tsx
```

Content:

1. Header/month selector.
2. Calendar.
3. Selected day reminder list.
4. Upcoming/overdue section if useful.
5. Floating add button.
6. Create/edit bottom sheet.

API:

- `GET /reminders?from=&to=&petId=&status=&type=`
- `GET /reminders/upcoming?limit=`
- `POST /reminders`
- `PATCH /reminders/:id`
- `DELETE /reminders/:id`
- status actions

Rules:

- No `Invalid Date`.
- Use ISO for API and local format for UI.
- Support complete/skip/cancel.
- Delete requires confirm.
- Apply entitlement limit errors gracefully.

## Medical Records Screen

Current related areas:

- `screens/MedicalRecord`
- `screens/MedicalRecordDetail`
- `components/MedicalRecordForm`
- `components/PetTimeline`
- `components/DocumentsInputController`
- `components/ImageGallery`

Target:

```txt
src/features/medical-records/screens/MedicalRecordsScreen.tsx
src/features/medical-records/screens/MedicalRecordDetailScreen.tsx
```

Content:

1. Pet selector.
2. Medical record timeline/list.
3. Create/edit record form.
4. Attachment gallery.
5. Record detail.

API:

- `GET /pets/:id/medical-records`
- `POST /pets/:id/medical-records`
- `GET /medical-records/:id`
- `PATCH /medical-records/:id`
- `DELETE /medical-records/:id`
- attachment endpoints

Rules:

- Medical record type values: vaccination, checkup, surgery, medication.
- Max attachments from entitlement/backend response.
- Show upload processing state.
- Use fullscreen image viewer for images.
- Delete record/attachment requires confirm.

## Budget Screens

Current related areas:

- `screens/Budget`
- `screens/BudgetCategories`
- `screens/BudgetTransactions`
- `components/Budget*`
- `components/chart`

Target:

```txt
src/features/budget/screens/BudgetScreen.tsx
src/features/budget/screens/BudgetCategoriesScreen.tsx
src/features/budget/screens/BudgetTransactionsScreen.tsx
```

Content:

1. Month/year selector.
2. Optional pet selector.
3. Budget summary.
4. Progress/over-budget state.
5. Charts.
6. Category breakdown.
7. Transaction list.
8. Category/transaction CRUD.

Rules:

- Format VND.
- Handle budget amount 0.
- Cap progress visually at 100%.
- Show over-budget amount separately.
- Do not make it feel like a generic finance app.

## Photos Screen

Current related areas:

- `app/photos.tsx`
- `screens/Photos`
- `components/ImageGallery`

Target:

```txt
src/features/photos/screens/PhotosScreen.tsx
```

Content:

1. Social Photos tab.
2. My Photos tab.
3. Upload button.
4. Upload bottom sheet.
5. Fullscreen photo modal.
6. Like/comment/reply/delete/report actions.

Rules:

- Social feed uses `GET /photos/social`.
- My photos uses `GET /photos/me?visibility=`.
- Use explicit like/unlike endpoints.
- Long-press comment opens action sheet.
- Delete comment uses API.
- Owner can delete photo.
- Private photos must not appear in social tab.

## Sitter Screens

Current related areas:

- `screens/Sitter`

Target:

```txt
src/features/sitter/screens/*
```

Screens:

- sitter discovery/list
- sitter detail
- my sitter profile
- booking list
- booking detail
- HTTP message thread

Rules:

- No WebSocket.
- Payment is external.
- Use copy to make external payment clear.
- Review only after completed booking.
- Booking messages use HTTP list/create.

## Pet Care AI Screen

Current related areas:

- `app/doctor-ai.tsx`
- `screens/DoctorAI`
- `components/ChatMessage`
- `components/Markdown`
- `components/TypingMessage`
- `components/LoadingMessage`

Target:

```txt
src/features/ai/screens/DoctorAIScreen.tsx
src/features/ai/screens/AIConversationScreen.tsx
```

Rules:

- Never call AI provider directly from mobile.
- Use backend endpoints only.
- Show safety disclaimer.
- Handle quota errors with paywall/upgrade UI.
- Render markdown safely.
- If streaming is implemented, ensure cancellation/cleanup on unmount.

## Notifications Screen

Current related areas:

- `app/notifications.tsx`
- `screens/Notifications`
- notification registration logic maybe in providers/UserSync

Target:

```txt
src/features/notifications/screens/NotificationsScreen.tsx
```

Rules:

- Register device token after login/permission.
- Respect settings toggles.
- Mark read/read all/delete.
- Handle notification tap/deep link if currently supported.
