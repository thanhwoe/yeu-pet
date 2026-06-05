# 10 — QA and Review Checklist

## Code quality QA

- [ ] No raw Axios calls inside screens.
- [ ] No direct `@google/genai` mobile usage.
- [ ] No WebSocket implementation.
- [ ] No `accountId` sent from mobile body.
- [ ] No hardcoded colors in refactored screens.
- [ ] No server state stored in Zustand.
- [ ] No feature imports inside UI primitives.
- [ ] No circular imports introduced.
- [ ] No unused moved files left behind.
- [ ] No duplicate components with same purpose unless documented.

## API QA

- [ ] Profile uses `/me`.
- [ ] Settings uses `/settings`.
- [ ] Subscriptions use `/subscriptions/me` and `/subscriptions/entitlements`.
- [ ] Pets use `/pets`.
- [ ] Reminders use `/reminders` and `/reminders/upcoming`.
- [ ] Medical record create uses `/pets/:id/medical-records`.
- [ ] Budget uses `/budgets` prefix.
- [ ] Social feed uses `/photos/social`.
- [ ] My photos uses `/photos/me`.
- [ ] Likes use explicit `POST/DELETE /photos/:id/like`.
- [ ] Reports use `/reports` where possible.
- [ ] Sitter profile uses `/sitters/me`.
- [ ] Sitter bookings use `/sitter-bookings/me` and POST action routes.
- [ ] Sitter messages use HTTP list/create.
- [ ] AI uses `/ai/conversations` backend APIs.
- [ ] Devices use `/devices`.
- [ ] Notifications use `/notifications`.

## UI/UX QA

For every Phase 1 screen:

- [ ] Main action is obvious.
- [ ] Loading state exists.
- [ ] Empty state exists.
- [ ] Error state exists.
- [ ] Retry or refresh exists where useful.
- [ ] Delete/cancel confirmation exists.
- [ ] Forms show validation errors.
- [ ] Submit button disables while pending.
- [ ] Keyboard does not cover submit actions.
- [ ] Dark mode is readable.
- [ ] Long text does not break layout.
- [ ] Touch targets are large enough.
- [ ] Screen works with no data.

## Feature QA

### Auth/account/settings

- [ ] Login/register still work.
- [ ] Logout clears token and cache.
- [ ] Profile edit works.
- [ ] Avatar upload works if implemented.
- [ ] Theme switch works.
- [ ] Language switch persists.
- [ ] Notification toggles persist.

### Pets

- [ ] Pets list loads.
- [ ] Add pet works.
- [ ] Edit pet works.
- [ ] Delete pet confirm works.
- [ ] Avatar upload works.
- [ ] Weight value/unit display correctly.
- [ ] Free pet limit error handled.

### Reminders

- [ ] Upcoming reminders load on Home.
- [ ] Calendar displays correct date.
- [ ] Create reminder works.
- [ ] Update reminder works.
- [ ] Delete reminder works.
- [ ] Complete/skip/cancel works.
- [ ] No `Invalid Date`.

### Medical Records

- [ ] Records list by pet.
- [ ] Create record works.
- [ ] Update record works.
- [ ] Delete record works.
- [ ] Attachments upload.
- [ ] Attachment limit handled.
- [ ] Image viewer works.

### Budget

- [ ] Monthly budget loads.
- [ ] Set/update budget works.
- [ ] Transactions CRUD works.
- [ ] Categories CRUD works.
- [ ] Charts render.
- [ ] Zero budget handled.
- [ ] Over-budget handled.
- [ ] VND formatted correctly.

### Photos

- [ ] Social photos load.
- [ ] My photos load.
- [ ] Private photos excluded from social feed.
- [ ] Upload photo works.
- [ ] Like/unlike works.
- [ ] Comment works.
- [ ] Reply works.
- [ ] Delete own comment works.
- [ ] Owner delete photo works.

### Sitter

- [ ] Create sitter profile works.
- [ ] Update sitter profile works.
- [ ] Search sitters works.
- [ ] Booking request works.
- [ ] Accept/reject/cancel/complete actions work.
- [ ] Review works only after completed.
- [ ] HTTP messages work.
- [ ] External payment copy is visible.

### AI

- [ ] Conversation list works.
- [ ] Create conversation works.
- [ ] Messages load.
- [ ] Send message calls backend.
- [ ] Streaming/fallback works.
- [ ] Markdown renders.
- [ ] Safety disclaimer visible.
- [ ] Quota error handled.
- [ ] No direct AI provider call.

### Notifications

- [ ] Permission requested appropriately.
- [ ] Device token registered.
- [ ] Notification list loads.
- [ ] Badge loads.
- [ ] Mark read/read all works.
- [ ] Delete notification works.

## Performance QA

- [ ] Long lists use FlashList where appropriate.
- [ ] Heavy cards are memoized only where useful.
- [ ] Images use Expo Image.
- [ ] Queries are not refetching excessively.
- [ ] Mutations do not invalidate unrelated entire app.
- [ ] Bottom sheets do not lag significantly.

## Final review questions

Before marking task complete, answer:

1. Which Phase 1 screens are now fully integrated?
2. Which screens remain partially implemented?
3. Which out-of-scope screens were intentionally skipped?
4. Are there any backend contract ambiguities?
5. Are there any upload field ambiguities?
6. Are there any known dark mode issues?
7. Are there any broken routes?
8. What should be the next task?
