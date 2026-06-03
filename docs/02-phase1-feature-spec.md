# 02 — Phase 1 Feature Specification

## 1. Pet Management

### Current idea

- Home shows pet list as carousel cards.
- User can flip card to view details.
- User can edit pet through bottom sheet form.
- User can delete pet.
- User can add new pet.

### Required behavior

- User can create, read, update, delete pets.
- Each pet belongs to one account.
- Pet profile fields:
  - name
  - species
  - breed
  - gender
  - birthdate or estimated age
  - weight
  - color
  - avatar
  - notes
- Deleting pet should require confirmation.
- Consider soft delete/archive if pet has related records.

### Acceptance criteria

- [ ] Home shows user's pets.
- [ ] Empty state encourages creating first pet.
- [ ] Pet card shows useful quick info.
- [ ] Pet detail/flip shows summary.
- [ ] Edit form validates required fields.
- [ ] Delete action is confirmed.
- [ ] Related features can filter by pet.

## 2. Reminder

### Current idea

- User can create reminders for each pet.
- Home shows upcoming reminders.
- Reminder screen shows calendar and reminder list.
- User can create/update/delete reminders.
- Device push notification is sent when reminder time arrives.
- Types: feeding, grooming, vaccination, medication.

### Required behavior

- Reminder belongs to account and optionally pet.
- Should support status: pending, completed, skipped, cancelled, sent/triggered, overdue if computed.
- Should support timezone-aware scheduled time.
- Should store notification scheduling metadata.
- Recurring reminders should be Premium if implemented in phase 1.

### Acceptance criteria

- [ ] User can create reminder from reminder screen.
- [ ] User can select pet.
- [ ] User can select type and date/time.
- [ ] Home shows next few upcoming reminders.
- [ ] Calendar screen filters by selected date.
- [ ] Update/delete reschedules or cancels local/push notification.
- [ ] Invalid dates never appear in UI.

## 3. Medical Records

### Current idea

- User stores medical records for each pet.
- Record fields: title, date, type, vet clinic, vet name, description.
- Types: vaccination, checkup, surgery, medication.
- Each record can store up to 5 images.
- User can create/update/delete records.
- User can view images as slideshow or download.

### Required behavior

- Medical records must be pet-scoped.
- Attachments should support file id, url, thumbnail url, sort order, status.
- Enforce attachment limit by entitlement.
- Support timeline/list display.

### Acceptance criteria

- [ ] User can select pet and see records.
- [ ] User can create record with 0–5 images depending on entitlement.
- [ ] User can update metadata and attachments.
- [ ] User can delete record with confirmation.
- [ ] Images can be previewed full-screen.
- [ ] App can later export/share medical summary.

## 4. Budget Statistics

### Current idea

- User can set/update monthly budget.
- User can CRUD transactions.
- User can select month/year.
- Charts: line, column, donut.
- Transactions are managed by category.
- User can CRUD category.

### Required behavior

- Budget should be account-scoped and month/year-scoped.
- Transaction should optionally link to a pet.
- Categories should be account-scoped, not globally unique by name.
- Default pet-care categories should be seeded per user or provided as system categories.
- UI should handle over-budget and negative remaining amount clearly.

### Acceptance criteria

- [ ] User can set budget for selected month/year.
- [ ] User can create/edit/delete transaction.
- [ ] User can create/edit/delete category.
- [ ] Charts match selected month/year.
- [ ] Summary includes spent, remaining/over budget, percent used.
- [ ] Progress bar caps visually at 100%.

## 5. Photos Social

### Current idea

- User can share pet photos.
- Tabs: Social Photos and My Photos.
- Social Photos shows public photos.
- My Photos shows private and public photos of current user.
- User selects image from gallery, adds caption, uploads.
- Photo modal supports like/comment.
- User can comment, reply, delete comment.
- Owner can delete photo.
- Long-press comment opens bottom sheet action.

### Required behavior

- Photo should optionally link to a pet.
- Public/private visibility should be explicit.
- Owner-only delete.
- User can like/unlike once.
- Comments support replies.
- Soft delete comments to preserve reply structure.
- Prepare moderation/report/block even if not fully implemented.

### Acceptance criteria

- [ ] Social tab only shows public ready photos.
- [ ] My Photos shows user's public/private photos.
- [ ] Upload validates file and caption length.
- [ ] Full-screen modal supports like/comment/reply.
- [ ] Owner can delete photo with confirmation.
- [ ] Comment owner can delete comment.
- [ ] Empty states are friendly.

## 6. Doctor AI / Pet Care AI

### Current idea

- Not implemented.
- Previous FE test used `@google/genai` and Gemini Flash Lite.
- Target direction: handle in BE and stream to FE.
- User chats with AI for pet-care advice.

### Required behavior

- AI provider must be called from backend only.
- Support streaming response to mobile.
- Free/Premium usage limits.
- Premium can use pet context and medical records.
- Safety guard must detect urgent cases and recommend vet care.
- AI must not claim official diagnosis.

### Acceptance criteria

- [ ] FE can send message and receive streaming response.
- [ ] BE stores conversations/messages.
- [ ] BE enforces AI quota.
- [ ] BE injects selected pet context for Premium.
- [ ] Emergency disclaimer and safety response are included.

## 7. Sitter Booking

### Current idea

- User can register as sitter with address and hourly/daily price.
- Owners can book sitters by hour/day.
- App acts as connection platform.
- Delivery/payment are handled by users themselves.
- Chat may be added.
- After booking completion, owner can rate/review sitter.

### Acceptance criteria

- [ ] User can create/update sitter profile.
- [ ] Owner can browse/filter sitters.
- [ ] Owner can create booking request.
- [ ] Sitter can accept/reject.
- [ ] Owner/sitter can cancel.
- [ ] Booking can be completed.
- [ ] Owner can review after completed booking.
- [ ] App clearly states payment is handled between users in phase 1.

## 8. Subscriptions

### Required behavior

- Free/Premium plan.
- BE enforces entitlements.
- FE shows paywalls on feature limits.
- Store integration can be mocked first, then connected to RevenueCat/App Store/Google Play later.

## 9. Settings

### Required behavior

- Bottom tab opens Settings screen.
- Sections:
  - Profile
  - Subscription
  - Notifications
  - Appearance
  - Language
  - Support/Legal
  - Logout
- Settings should be persisted per account.

### Acceptance criteria

- [ ] User can edit profile.
- [ ] User can enable/disable notifications.
- [ ] User can choose light/dark/system theme.
- [ ] User can choose Vietnamese/English.
- [ ] User can view subscription state.
- [ ] User can logout.
