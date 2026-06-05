# 05 — Mobile FE Refactor & Implementation Plan

> Status: reference plan. The active Phase 1 mobile implementation tracker is
> `docs/mobile-fe-implementation-checklist.md`, the canonical API contract is
> `docs/12-mobile-api-contract.md`, and the current incremental folder plan is
> `apps/mobile/docs/mobile-refactor-plan.md`.

## 1. Goal

Refactor `apps/mobile` so phase 1 features are stable, consistent, and connected to backend APIs.

The app should feel like a real product, not a demo. Prioritize navigation clarity, form stability, bottom sheet stability, empty states, and consistent API/data state handling.

All future mobile UI tasks must use the project-local skills described in `docs/13-mobile-ui-ux-skills-guide.md`. Apply `pet-mobile-ui-ux-design` before design decisions, `react-native-expo-ui-implementation` while coding, and `mobile-ui-review-checklist` before marking UI work complete.

## 2. Navigation proposal

Bottom tabs:

```txt
Home
Reminder
Service
Sitter
Settings
```

Possible stack screens:

```txt
PetDetail
MedicalRecords
MedicalRecordDetail
Budget
PhotoDetailModal
AiChat
SitterList
SitterProfile
SitterBookingDetail
SubscriptionPaywall
EditProfile
SettingsSubscreens
```

## 3. Recommended folder structure

```txt
apps/mobile/
├── app
├── components
│   ├── ui
│   ├── form/shared controllers
│   ├── feedback
│   ├── media
│   └── navigation/shared app components
├── features
│   ├── auth
│   ├── pets
│   ├── reminders
│   ├── medical-records
│   ├── budget
│   ├── photos
│   ├── ai
│   ├── sitters
│   ├── subscriptions
│   └── settings
├── services
├── interfaces
├── hooks
├── theme
├── utils
└── stores
```

Do not introduce a `src/` tree during the current refactor. The mobile alias
maps to `apps/mobile/*`; feature ownership is being established at the current
root level first.

## 4. Data fetching rules

Use one consistent strategy. If the project already uses React Query, standardize all API calls with query keys.

Suggested query keys:

```ts
["me"]["settings"]["subscription"]["pets"][("pet", petId)][
  ("reminders", filters)
]["upcoming-reminders"][("medical-records", petId)][
  ("budget-summary", month, year, petId)
][("photos-social", cursor)][("photos-me", filters)]["ai-conversations"][
  ("sitters", filters)
][("sitter-bookings", filters)];
```

Mutation success should invalidate only relevant queries.

## 5. Bottom sheet rules

Current project has bottom sheet issues. Refactor bottom sheet usage carefully.

Recommended:

- Create one shared `AppBottomSheet` wrapper.
- Avoid nesting scroll views incorrectly.
- Use stable snap points with `useMemo`.
- Use `BottomSheetModalProvider` at app root.
- Ensure keyboard behavior works on iOS/Android.
- For forms, use `BottomSheetScrollView` or a compatible keyboard-aware component.
- Do not create a new bottom sheet implementation per feature.

## 6. UI component refactor

Create reusable components:

```txt
Button
IconButton
TextField
SelectField
DateTimeField
ImagePickerField
AvatarPicker
ConfirmDialog
EmptyState
LoadingState
ErrorState
SectionHeader
Card
StatCard
PetSelector
PaywallModal
```

## 7. Feature implementation notes

### 7.1 Home

Home should show:

- Greeting/user summary
- Pet carousel cards
- Upcoming reminders
- Quick actions to services
- Optional premium/AI entry point

Pet card:

- Front: name, species/breed, age, avatar, quick info
- Back/detail: gender, birthday, weight, color, notes, shortcuts
- Edit/delete via menu or buttons, with delete confirmation

### 7.2 Reminder

Screens:

```txt
ReminderScreen
ReminderFormBottomSheet
ReminderCalendar
ReminderList
ReminderItem
```

Must handle:

- create/update/delete
- selected date
- pet filter
- type filter
- upcoming/today/overdue/completed states
- notification permission request
- invalid date prevention

### 7.3 Service screen

Service screen is a feature launcher.

Cards:

```txt
Medical Records
Budget
Pet Photos / Memories
Pet Care AI
Pet Sitter
Grooming & Clinic (coming soon)
Training (coming soon)
Events (coming soon)
SOS (coming soon)
```

Coming soon cards should not look broken. They should have disabled state or roadmap label.

### 7.4 Medical Records

Screens:

```txt
MedicalRecordsScreen
MedicalRecordForm
MedicalRecordDetail
MedicalImageViewer
```

Must support:

- pet selector
- record type selector
- image upload max by entitlement
- slideshow/full-screen view
- delete with confirm
- timeline/list view

### 7.5 Budget

Screens:

```txt
BudgetScreen
BudgetMonthSelector
BudgetSummary
BudgetCharts
TransactionList
TransactionForm
CategoryManager
```

Must support:

- month/year select
- set/update budget
- transaction CRUD
- category CRUD
- optional pet selector
- line/column/donut chart
- over-budget state

### 7.6 Photos

Screens/components:

```txt
PhotosScreen
SocialPhotosTab
MyPhotosTab
PhotoUploadSheet
PhotoDetailModal
CommentList
CommentInput
CommentActionSheet
```

Must support:

- gallery picker
- caption
- public/private toggle
- optional pet selector
- like/unlike
- comment/reply/delete
- owner delete photo
- long-press comment action

### 7.7 Pet Care AI

Screens:

```txt
AiConversationList
AiChatScreen
AiMessageBubble
AiPetContextSelector
AiPaywall
```

Must support:

- streaming response
- loading indicator while assistant is typing
- quota/paywall state
- selected pet context
- safe disclaimer
- retry on error

### 7.8 Sitter Booking

Screens:

```txt
SitterListScreen
SitterProfileScreen
SitterRegistrationScreen
BookingRequestForm
BookingDetailScreen
BookingChatScreen optional
ReviewForm
```

Must support:

- create/update sitter profile
- browse sitters
- filter by area/rating/price if backend supports
- create booking request
- booking status actions
- review after completion
- clear note that payment is handled outside app

### 7.9 Settings

Settings bottom tab should include:

```txt
Profile header
Current plan
Account
- Edit Profile
- Subscription
Preferences
- Notifications
- Appearance
- Language
Support
- Contact Support
- Terms & Privacy
Session
- Logout
```

## 8. Subscription/paywall UX

Paywall should appear only when user hits meaningful limits or tries premium-only feature.

Triggers:

- create pet beyond Free limit
- create active reminder beyond Free limit
- recurring reminder
- upload more than free image limit
- AI quota exceeded
- export medical summary
- advanced budget insights

## 9. Mobile checklist

- [ ] App root providers are clean.
- [ ] API client has auth token handling.
- [ ] Query/mutation hooks are standardized.
- [ ] Bottom sheet refactored globally.
- [ ] Forms have validation and error display.
- [ ] Empty/loading/error states added.
- [ ] Destructive actions confirm.
- [ ] Settings tab implemented.
- [ ] Subscription state visible.
- [ ] AI streaming works on mobile.
- [ ] Sitter booking FE completed.
- [ ] Manual QA checklist completed.
