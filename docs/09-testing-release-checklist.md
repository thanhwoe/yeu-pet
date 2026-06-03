# 09 — Testing & Release Checklist

## 1. Backend checks

Run available scripts:

```txt
pnpm install
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api build
pnpm --filter api prisma generate
pnpm --filter api prisma migrate status
```

Adjust commands based on actual package names.

## 2. Mobile checks

Run available scripts:

```txt
pnpm --filter mobile lint
pnpm --filter mobile test
pnpm --filter mobile typecheck
pnpm --filter mobile start
```

Test on:

- iOS simulator
- Android emulator if available
- real device if push notifications are involved

## 3. Manual QA — Pet Management

- [ ] Create first pet.
- [ ] Edit pet.
- [ ] Upload/change avatar.
- [ ] Delete pet with confirmation.
- [ ] Pet appears on home carousel.
- [ ] Related reminders/records filter by pet.

## 4. Manual QA — Reminder

- [ ] Create reminder for a pet.
- [ ] Create reminder without pet if allowed.
- [ ] Update reminder time.
- [ ] Delete reminder.
- [ ] Complete reminder.
- [ ] Calendar shows selected date reminders.
- [ ] Home shows upcoming reminders.
- [ ] Notification permission flow works.
- [ ] No `Invalid Date` appears.

## 5. Manual QA — Medical Records

- [ ] Create record with no image.
- [ ] Create record with images.
- [ ] Enforce image limit.
- [ ] Update record.
- [ ] Delete attachment.
- [ ] Delete record.
- [ ] Open image slideshow.
- [ ] Check pet-specific records.

## 6. Manual QA — Budget

- [ ] Set monthly budget.
- [ ] Update monthly budget.
- [ ] Create transaction.
- [ ] Edit transaction.
- [ ] Delete transaction.
- [ ] Create category.
- [ ] Edit category.
- [ ] Delete category.
- [ ] Charts update by month/year.
- [ ] Over-budget state is clear.
- [ ] Zero budget does not crash percent calculation.

## 7. Manual QA — Photos

- [ ] Upload public photo.
- [ ] Upload private photo.
- [ ] Social tab shows public photo only.
- [ ] My Photos shows public/private owned photos.
- [ ] Open full-screen photo.
- [ ] Like/unlike.
- [ ] Comment.
- [ ] Reply.
- [ ] Delete own comment.
- [ ] Delete own photo.
- [ ] Non-owner cannot delete.

## 8. Manual QA — Doctor AI

- [ ] Create conversation.
- [ ] Send message.
- [ ] Receive streaming response.
- [ ] Quota decreases.
- [ ] Free quota exceeded shows paywall.
- [ ] Premium context includes pet data.
- [ ] Urgent symptom triggers safety response.
- [ ] Conversation history persists.

## 9. Manual QA — Sitter Booking

- [ ] Register as sitter.
- [ ] Edit sitter profile.
- [ ] Browse sitter list from another account.
- [ ] Create booking request.
- [ ] Sitter accepts.
- [ ] Sitter rejects.
- [ ] Owner cancels.
- [ ] Sitter cancels.
- [ ] Complete booking.
- [ ] Review completed booking.
- [ ] Duplicate review is blocked.
- [ ] External payment disclaimer visible.

## 10. Manual QA — Subscription

- [ ] Free plan limits returned by API.
- [ ] Premium plan limits returned by API.
- [ ] Free user cannot exceed pet limit.
- [ ] Free user cannot exceed reminder limit.
- [ ] Free user cannot exceed AI quota.
- [ ] Paywall appears with correct copy.
- [ ] Mock upgrade unlocks premium.
- [ ] Mock downgrade returns free limits.

## 11. Manual QA — Settings

- [ ] Edit profile.
- [ ] Toggle notifications.
- [ ] Change language.
- [ ] Change theme light/dark/system.
- [ ] View current subscription.
- [ ] Logout.

## 12. Security checklist

- [ ] No API keys in mobile app.
- [ ] AI provider key only in backend env.
- [ ] Auth guard on all protected endpoints.
- [ ] Ownership checks on all resources.
- [ ] Private photos are not visible publicly.
- [ ] Sitter booking visible only to participants.
- [ ] Upload file size/type validation.
- [ ] Destructive actions require auth and ownership.

## 13. Release checklist

- [ ] Environment variables documented.
- [ ] Database migration applied in staging.
- [ ] Seed/default data available.
- [ ] App builds successfully.
- [ ] Error tracking/logging configured if available.
- [ ] Privacy Policy and Terms prepared before public launch.
- [ ] AI disclaimer visible.
- [ ] Sitter external-payment disclaimer visible.
