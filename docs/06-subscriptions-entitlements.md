# 06 — Subscriptions & Entitlements Plan

## 1. Recommended model

Start with two tiers:

```txt
Free
Premium
```

Do not add more tiers until real usage data exists.

## 2. Pricing hypothesis for Vietnam market

Initial test pricing:

```txt
Premium Monthly: 49,000 VND/month
Premium Yearly: 399,000 VND/year
Launch offer: 29,000 VND/month or 249,000 VND/year
```

This is a hypothesis and should be validated with real conversion data.

## 3. Free/Premium entitlement matrix

| Feature | Free | Premium |
|---|---:|---:|
| Pets | 2 | Unlimited |
| Active reminders | 5 | Unlimited |
| Recurring reminders | No | Yes |
| Medical records | 10 | Unlimited |
| Images per medical record | 1 | 5 |
| Budget transactions/month | 20 | Unlimited |
| Yearly/advanced budget insights | No | Yes |
| Photos | 20 | Higher/unlimited depending storage cost |
| AI messages/month | 5 | 300 fair-use |
| AI with pet context | No or limited | Yes |
| AI with medical history | No | Yes |
| Export/share medical summary | No | Yes |
| Sitter booking | Basic | Favorites/history priority later |

## 4. Entitlement constants

Create a shared backend constant. FE can consume entitlement API result but BE is source of truth.

```ts
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    maxPets: 2,
    maxActiveReminders: 5,
    recurringReminders: false,
    maxMedicalRecords: 10,
    maxImagesPerMedicalRecord: 1,
    maxBudgetTransactionsPerMonth: 20,
    yearlyBudgetStats: false,
    maxPhotos: 20,
    aiMessagesPerMonth: 5,
    aiWithPetContext: false,
    aiWithMedicalHistory: false,
    exportMedicalSummary: false,
  },
  PREMIUM: {
    maxPets: -1,
    maxActiveReminders: -1,
    recurringReminders: true,
    maxMedicalRecords: -1,
    maxImagesPerMedicalRecord: 5,
    maxBudgetTransactionsPerMonth: -1,
    yearlyBudgetStats: true,
    maxPhotos: -1,
    aiMessagesPerMonth: 300,
    aiWithPetContext: true,
    aiWithMedicalHistory: true,
    exportMedicalSummary: true,
  },
} as const
```

## 5. Backend enforcement

BE must enforce limits for:

```txt
pets.create
reminders.create
reminders.createRecurring
medicalRecords.create
medicalAttachments.upload
budgetTransactions.create
photos.upload
aiMessages.create
medicalSummary.export
```

Do not rely on FE-only checks.

## 6. Subscription API

```txt
GET /subscriptions/me
GET /subscriptions/entitlements
POST /subscriptions/mock-upgrade      # dev only
POST /subscriptions/mock-downgrade    # dev only
POST /subscriptions/webhooks/revenuecat
```

Example response:

```json
{
  "tier": "free",
  "status": "free",
  "expiresAt": null,
  "limits": {
    "maxPets": 2,
    "maxActiveReminders": 5,
    "aiMessagesPerMonth": 5
  },
  "usage": {
    "pets": 1,
    "activeReminders": 2,
    "aiMessagesThisMonth": 3
  }
}
```

## 7. Paywall triggers

Use contextual paywalls:

- User tries to create 3rd pet.
- User tries to create 6th active reminder.
- User chooses recurring reminder.
- User uploads 2nd medical image on Free.
- User exceeds monthly AI quota.
- User opens export/share medical summary.
- User opens yearly budget insight.

## 8. Paywall copy

### General

```txt
Unlock Premium Pet Care
Manage unlimited pets, reminders, health records, and get AI care support based on your pet's profile.
```

### AI

```txt
Ask more questions with Premium
Premium gives you more AI messages and personalized answers using your pet profile and health records.
```

### Medical Records

```txt
Keep the full health history
Premium lets you store unlimited medical records and up to 5 images per record.
```

### Reminder

```txt
Never miss important care again
Premium unlocks unlimited and recurring reminders.
```

## 9. Implementation phases

### Phase 1 — Mock/local subscription

- Backend entitlement service.
- Free/Premium mock status.
- FE paywalls.
- Dev-only upgrade/downgrade endpoints.

### Phase 2 — Store integration

- Add RevenueCat or native in-app purchase integration.
- Configure App Store and Google Play products.
- Add webhook handler.
- Sync subscription state into DB.

### Phase 3 — Optimization

- A/B test paywall copy.
- Offer yearly discount.
- Launch founding offer.
- Track conversion by trigger.

## 10. Metrics

Track:

```txt
paywall_view
paywall_trigger
upgrade_click
purchase_success
purchase_failed
free_limit_reached
ai_quota_reached
subscription_cancelled
subscription_expired
premium_feature_used
```
