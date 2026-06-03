# 03 — Database Redesign Plan

## 1. Purpose

The current schema already covers many phase 1 domains, but it needs redesign before serious backend/mobile implementation. The goals are:

- Make the database pet-centric.
- Support subscriptions and entitlements correctly.
- Prepare Doctor AI.
- Improve reminders, budget, photos, settings, sitter booking.
- Move all DB changes into Prisma migrations.
- Keep future admin portal and ecommerce extensible.

## 2. Current schema observations

Current schema already has these major areas:

- accounts/auth: `accounts`, `refresh_tokens`, `otp_tokens`
- pets: `pets`
- medical records: `medical_records`, `medical_attachments`
- reminders/notifications: `reminders`, `account_devices`, `notifications`, `notification_deliveries`
- budget: `budgets`, `budget_categories`, `budget_transactions`
- photos social: `photos`, `photo_likes`, `photo_comments`, `photo_views`
- sitter booking: `pet_sitters`, `sitter_bookings`, `sitter_reviews`
- settings: `account_settings`
- enums: subscription tier, user role, gender, species, reminder types/status, photo status, etc.

## 3. Main issues to fix

### 3.1 Account and subscription

Current `accounts.subscription` and `accounts.subscription_expires_at` are too simple for real subscriptions.

Need separate subscription tables:

- current plan
- provider
- provider customer id
- status
- started/expires dates
- entitlement checks
- usage counters

### 3.2 Settings

Current `account_settings` supports notification and language only.

Need:

- appearance/theme: light/dark/system
- more granular notifications later
- privacy/social settings later

### 3.3 Pets

Current `pets.weight` is string. Consider numeric weight fields.

Recommended:

- `weight_value Decimal?`
- `weight_unit weight_unit_enum`
- keep old `weight` temporarily if migration risk exists

Age should be derived from birthdate where possible.

### 3.4 Reminders

Current reminders do not support recurrence, timezone, completion, overdue, notification id, or skip state.

Need:

- timezone
- completed_at
- cancelled_at
- repeat_rule or recurrence fields
- notification scheduling metadata
- type extension/custom type support later

### 3.5 Budget

Current `budget_categories.name` is globally unique. This is a problem because two users should be able to have category named `Food`.

Fix:

- remove global unique on `name`
- add `@@unique([account_id, name])`

Transactions should optionally link to pet.

### 3.6 Photos

Photos currently do not link to pets. For a pet app, photo should optionally belong to a pet.

Need:

- `pet_id?`
- moderation/report tables later
- block user table later

### 3.7 Medical records

Medical records are mostly good. Improvements:

- add `sort_order` to attachments
- consider `deleted_at` on records
- add more record types later
- enforce max images by BE entitlement

### 3.8 Sitter booking

Current sitter booking is a good base. Improvements:

- sitter profile needs location/search fields: city, district, ward, lat/lng optional
- sitter availability optional
- booking notes and care instructions
- clear status transition rules
- chat-ready tables
- report/block later

### 3.9 Doctor AI

No current AI tables. Need:

- conversations
- messages
- usage logs
- provider metadata
- safety flags

## 4. Naming strategy

Current schema uses lowercase plural model names. Prisma convention usually uses PascalCase singular model names with `@@map` to database table names.

Recommended approach:

### Safer approach for existing codebase

Keep current model names initially to reduce code breakage. Add new tables using the current naming style.

### Cleaner long-term approach

Refactor to PascalCase models with `@@map`, for example:

```prisma
model Account {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email String? @unique

  @@map("accounts")
}
```

Do this only if the agent can update all backend references safely.

## 5. Recommended schema additions and changes

### 5.1 Account settings

```prisma
enum app_language {
  vi
  en
}

enum app_theme {
  system
  light
  dark
}

model account_settings {
  account_id              String       @id @db.Uuid
  notification_enable     Boolean      @default(true)
  reminder_notifications  Boolean      @default(true)
  booking_notifications   Boolean      @default(true)
  social_notifications    Boolean      @default(true)
  ai_notifications        Boolean      @default(true)
  language                app_language @default(vi)
  theme                   app_theme    @default(system)
  created_at              DateTime?    @default(now()) @db.Timestamptz(6)
  updated_at              DateTime?    @default(now()) @db.Timestamptz(6)
  accounts                accounts     @relation(fields: [account_id], references: [id], onDelete: Cascade)
}
```

### 5.2 Pets

Add numeric weight while keeping old string temporarily:

```prisma
enum weight_unit {
  kg
  lb
}

model pets {
  // existing fields
  weight          String?       @db.VarChar(100) // legacy, keep temporarily
  weight_value    Decimal?      @db.Decimal(8, 2)
  weight_unit     weight_unit?  @default(kg)
  deleted_at      DateTime?     @db.Timestamptz(6)
}
```

### 5.3 Reminders

```prisma
enum reminder_status {
  pending
  completed
  skipped
  sent
  cancelled
}

enum reminder_repeat_frequency {
  none
  daily
  weekly
  monthly
  yearly
  custom
}

model reminders {
  id                       String                     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  account_id               String                     @db.Uuid
  pet_id                   String?                    @db.Uuid
  title                    String                     @db.VarChar(200)
  description              String?                    @db.VarChar(512)
  type                     reminder_type
  custom_type              String?                    @db.VarChar(80)
  status                   reminder_status            @default(pending)
  scheduled_at             DateTime                   @db.Timestamptz(6)
  timezone                 String                     @default("Asia/Ho_Chi_Minh") @db.VarChar(64)
  repeat_frequency         reminder_repeat_frequency  @default(none)
  repeat_interval          Int?                       @default(1)
  repeat_until             DateTime?                  @db.Timestamptz(6)
  parent_reminder_id       String?                    @db.Uuid
  notification_provider_id String?                    @db.VarChar(255)
  completed_at             DateTime?                  @db.Timestamptz(6)
  cancelled_at             DateTime?                  @db.Timestamptz(6)
  created_at               DateTime?                  @default(now()) @db.Timestamptz(6)
  updated_at               DateTime?                  @default(now()) @db.Timestamptz(6)

  @@index([account_id, scheduled_at])
  @@index([pet_id, scheduled_at])
  @@index([account_id, status])
}
```

### 5.4 Medical attachments

```prisma
model medical_attachments {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  medical_id    String    @db.Uuid
  url           String
  thumbnail_url String?
  file_id       String?
  sort_order    Int       @default(0)
  deleted_at    DateTime? @db.Timestamptz(6)
  created_at    DateTime? @default(now()) @db.Timestamptz(6)
  updated_at    DateTime? @default(now()) @db.Timestamptz(6)

  @@index([medical_id, sort_order])
}
```

### 5.5 Budget

```prisma
model budget_categories {
  id         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  account_id String    @db.Uuid
  name       String    @db.VarChar(50)
  emoji      String?
  color      String?   @db.VarChar(50)
  is_default Boolean   @default(false)
  deleted_at DateTime? @db.Timestamptz(6)
  created_at DateTime? @default(now()) @db.Timestamptz(6)
  updated_at DateTime? @default(now()) @db.Timestamptz(6)

  @@unique([account_id, name])
  @@index([account_id])
}

model budget_transactions {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  account_id  String    @db.Uuid
  pet_id      String?   @db.Uuid
  category_id String    @db.Uuid
  amount      Decimal   @db.Decimal(12, 2)
  description String?   @db.VarChar(512)
  date        DateTime  @db.Timestamptz(6)
  deleted_at  DateTime? @db.Timestamptz(6)
  created_at  DateTime? @default(now()) @db.Timestamptz(6)
  updated_at  DateTime? @default(now()) @db.Timestamptz(6)

  @@index([account_id, date])
  @@index([pet_id, date])
  @@index([category_id, date])
}
```

### 5.6 Photos

```prisma
model photos {
  id            String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  account_id    String        @db.Uuid
  pet_id        String?       @db.Uuid
  url           String?
  file_id       String?
  thumbnail_url String?
  caption       String?       @db.VarChar(300)
  is_private    Boolean       @default(false)
  status        photos_status @default(pending)
  view_count    Int           @default(0)
  like_count    Int           @default(0)
  comment_count Int           @default(0)
  deleted_at    DateTime?     @db.Timestamptz(6)
  created_at    DateTime?     @default(now()) @db.Timestamptz(6)
  updated_at    DateTime?     @default(now()) @db.Timestamptz(6)

  @@index([account_id, created_at])
  @@index([pet_id, created_at])
  @@index([is_private, status, created_at])
}
```

Add moderation-ready tables:

```prisma
enum report_target_type {
  photo
  comment
  sitter
  user
}

enum report_status {
  pending
  reviewed
  resolved
  rejected
}

model user_blocks {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  blocker_account_id String   @db.Uuid
  blocked_account_id String   @db.Uuid
  created_at         DateTime @default(now()) @db.Timestamptz(6)

  @@unique([blocker_account_id, blocked_account_id])
}

model reports {
  id                  String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  reporter_account_id String             @db.Uuid
  target_type         report_target_type
  target_id           String             @db.Uuid
  reason              String             @db.VarChar(255)
  description         String?
  status              report_status      @default(pending)
  created_at          DateTime           @default(now()) @db.Timestamptz(6)
  updated_at          DateTime?          @default(now()) @db.Timestamptz(6)

  @@index([target_type, target_id])
  @@index([reporter_account_id])
  @@index([status])
}
```

### 5.7 Subscriptions and entitlements

```prisma
enum subscription_provider {
  manual
  revenuecat
  apple
  google
}

enum subscription_status {
  free
  trialing
  active
  grace_period
  expired
  cancelled
}

model subscription_plans {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String    @unique @db.VarChar(50) // free, premium_monthly, premium_yearly
  name        String    @db.VarChar(100)
  tier        subscription_tier
  price       Decimal?  @db.Decimal(12, 2)
  currency    String?   @db.VarChar(10)
  is_active   Boolean   @default(true)
  created_at  DateTime? @default(now()) @db.Timestamptz(6)
  updated_at  DateTime? @default(now()) @db.Timestamptz(6)
}

model user_subscriptions {
  id                    String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  account_id            String                @db.Uuid
  plan_code             String                @db.VarChar(50)
  provider              subscription_provider @default(manual)
  provider_customer_id  String?               @db.VarChar(255)
  provider_original_id  String?               @db.VarChar(255)
  status                subscription_status   @default(free)
  started_at            DateTime?             @db.Timestamptz(6)
  expires_at            DateTime?             @db.Timestamptz(6)
  cancelled_at          DateTime?             @db.Timestamptz(6)
  created_at            DateTime?             @default(now()) @db.Timestamptz(6)
  updated_at            DateTime?             @default(now()) @db.Timestamptz(6)

  @@index([account_id, status])
  @@index([provider_customer_id])
}

model usage_counters {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  account_id  String    @db.Uuid
  feature_key String    @db.VarChar(80)
  period_key  String    @db.VarChar(40) // 2026-06, 2026-06-03
  count       Int       @default(0)
  reset_at    DateTime  @db.Timestamptz(6)
  created_at  DateTime? @default(now()) @db.Timestamptz(6)
  updated_at  DateTime? @default(now()) @db.Timestamptz(6)

  @@unique([account_id, feature_key, period_key])
  @@index([account_id, feature_key])
}
```

### 5.8 Doctor AI

```prisma
enum ai_message_role {
  user
  assistant
  system
}

enum ai_conversation_status {
  active
  archived
  deleted
}

model ai_conversations {
  id          String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  account_id  String                 @db.Uuid
  pet_id      String?                @db.Uuid
  title       String?                @db.VarChar(160)
  status      ai_conversation_status @default(active)
  created_at  DateTime?              @default(now()) @db.Timestamptz(6)
  updated_at  DateTime?              @default(now()) @db.Timestamptz(6)

  @@index([account_id, updated_at])
  @@index([pet_id, updated_at])
}

model ai_messages {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  conversation_id String          @db.Uuid
  account_id      String          @db.Uuid
  role            ai_message_role
  content         String
  model           String?         @db.VarChar(100)
  provider        String?         @db.VarChar(50)
  input_tokens    Int?
  output_tokens   Int?
  safety_flags    Json?
  created_at      DateTime?       @default(now()) @db.Timestamptz(6)

  @@index([conversation_id, created_at])
  @@index([account_id, created_at])
}

model ai_usage_logs {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  account_id     String    @db.Uuid
  conversation_id String?  @db.Uuid
  provider       String    @db.VarChar(50)
  model          String    @db.VarChar(100)
  input_tokens   Int       @default(0)
  output_tokens  Int       @default(0)
  estimated_cost Decimal?  @db.Decimal(12, 6)
  created_at     DateTime? @default(now()) @db.Timestamptz(6)

  @@index([account_id, created_at])
}
```

### 5.9 Sitter booking chat-ready schema

Do not implement full chat if not needed, but prepare data model.

```prisma
enum booking_message_type {
  text
  image
  system
}

model sitter_booking_messages {
  id          String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  booking_id  String               @db.Uuid
  sender_id   String               @db.Uuid
  type        booking_message_type @default(text)
  content     String?
  image_url   String?
  read_at     DateTime?            @db.Timestamptz(6)
  created_at  DateTime?            @default(now()) @db.Timestamptz(6)

  @@index([booking_id, created_at])
  @@index([sender_id, created_at])
}
```

Add sitter profile fields:

```prisma
model pet_sitters {
  // existing fields
  display_name  String?  @db.VarChar(100)
  city          String?  @db.VarChar(100)
  district      String?  @db.VarChar(100)
  ward          String?  @db.VarChar(100)
  latitude      Decimal? @db.Decimal(10, 7)
  longitude     Decimal? @db.Decimal(10, 7)
  experience    String?
  service_notes String?
  is_verified   Boolean @default(false)
}
```

Booking fields:

```prisma
model sitter_bookings {
  // existing fields
  owner_notes       String?
  sitter_notes      String?
  care_instructions String?
  payment_note      String? @db.VarChar(255) // e.g. "Payment is arranged outside the app"
}
```

## 6. Recommended default categories and enums

### Budget categories

Seed per user or provide as default system categories:

```txt
Food
Treats
Toys
Grooming
Vet / Clinic
Medicine
Vaccination
Accessories
Sitter / Boarding
Training
Other
```

### Reminder types

Keep current MVP:

```txt
feeding
grooming
vaccination
medication
```

Prepare future:

```txt
vet_visit
bathing
deworming
flea_tick
food_purchase
weight_check
custom
```

### Medical record types

Current:

```txt
vaccination
checkup
surgery
medication
```

Future:

```txt
lab_test
allergy
dental
deworming
flea_tick
other
```

## 7. Migration strategy

### Step 1 — Baseline

- Ensure current Prisma schema matches current Supabase DB.
- Generate baseline migration if not already tracked.
- Avoid destructive changes before backing up data.

### Step 2 — Additive changes

Add new columns/tables first:

- settings theme/language enum
- pet numeric weight
- reminder recurrence/timezone/completed fields
- budget pet_id and category unique fix
- photos pet_id
- subscription tables
- AI tables
- sitter chat table/fields
- Update recent triggers if needed

### Step 3 — Backfill

- Backfill account settings if missing.
- Backfill budgets/categories if needed.
- Backfill `period_key` usage counters only for new usage going forward.
- If converting `weight`, parse old string best-effort into numeric field.

### Step 4 — Code update

- Update Prisma client.
- Update backend DTOs and services.
- Update FE types/API client.

### Step 5 — Cleanup

After confirming stability:

- Remove obsolete fields only if safe.
- Add stricter constraints.
- Add missing indexes.

## 8. Database checklist

- [ ] Remove global unique category name; use `[account_id, name]`.
- [ ] Add pet_id to budget transactions.
- [ ] Add pet_id to photos.
- [ ] Add recurrence and timezone fields to reminders.
- [ ] Add theme to settings.
- [ ] Add subscription tables.
- [ ] Add usage counters.
- [ ] Add AI conversation/message tables.
- [ ] Add sitter booking messages.
- [ ] Add moderation-ready report/block tables if feasible.
- [ ] Add indexes for all list views.
- [ ] Ensure all new relations have proper cascade/set-null behavior.
- [ ] Generate and test Prisma migration.
