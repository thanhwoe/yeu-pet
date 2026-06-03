-- Phase 1 database foundation.
-- This migration is mostly additive and keeps legacy columns for backward compatibility.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weight_unit') THEN
    CREATE TYPE "weight_unit" AS ENUM ('kg', 'lb');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_repeat_frequency') THEN
    CREATE TYPE "reminder_repeat_frequency" AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_provider') THEN
    CREATE TYPE "subscription_provider" AS ENUM ('manual', 'revenuecat', 'apple', 'google');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE "subscription_status" AS ENUM ('free', 'trialing', 'active', 'grace_period', 'expired', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_message_role') THEN
    CREATE TYPE "ai_message_role" AS ENUM ('user', 'assistant', 'system');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_conversation_status') THEN
    CREATE TYPE "ai_conversation_status" AS ENUM ('active', 'archived', 'deleted');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_target_type') THEN
    CREATE TYPE "report_target_type" AS ENUM ('photo', 'comment', 'sitter', 'user');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
    CREATE TYPE "report_status" AS ENUM ('pending', 'reviewed', 'resolved', 'rejected');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_message_type') THEN
    CREATE TYPE "booking_message_type" AS ENUM ('text', 'image', 'system');
  END IF;
END $$;

ALTER TYPE "reminder_status" ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE "reminder_status" ADD VALUE IF NOT EXISTS 'skipped';

ALTER TABLE "account_settings"
  ADD COLUMN IF NOT EXISTS "reminder_notifications" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "booking_notifications" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "social_notifications" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "ai_notifications" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "theme" VARCHAR(20) NOT NULL DEFAULT 'system';

ALTER TABLE "pets"
  ADD COLUMN IF NOT EXISTS "weight_value" DECIMAL(8, 2),
  ADD COLUMN IF NOT EXISTS "weight_unit" "weight_unit" DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ(6);

ALTER TABLE "medical_records"
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ(6);

CREATE INDEX IF NOT EXISTS "idx_medical_records_pet_date"
  ON "medical_records"("pet_id", "date");

ALTER TABLE "medical_attachments"
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "idx_medical_attachments_medical_sort"
  ON "medical_attachments"("medical_id", "sort_order");

ALTER TABLE "reminders"
  ADD COLUMN IF NOT EXISTS "custom_type" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  ADD COLUMN IF NOT EXISTS "repeat_frequency" "reminder_repeat_frequency" NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS "repeat_interval" INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "repeat_until" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "parent_reminder_id" UUID,
  ADD COLUMN IF NOT EXISTS "notification_provider_id" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMPTZ(6);

ALTER TABLE "reminders"
  ALTER COLUMN "description" TYPE VARCHAR(512),
  ALTER COLUMN "status" SET DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_reminders_parent_reminder_id'
  ) THEN
    ALTER TABLE "reminders"
      ADD CONSTRAINT "fk_reminders_parent_reminder_id"
      FOREIGN KEY ("parent_reminder_id") REFERENCES "reminders"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_reminders_account_scheduled"
  ON "reminders"("account_id", "scheduled_at");
CREATE INDEX IF NOT EXISTS "idx_reminders_pet_scheduled"
  ON "reminders"("pet_id", "scheduled_at");
CREATE INDEX IF NOT EXISTS "idx_reminders_account_status"
  ON "reminders"("account_id", "status");

DROP INDEX IF EXISTS "budget_categories_name_key";

ALTER TABLE "budget_categories"
  ADD COLUMN IF NOT EXISTS "is_default" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ(6);

CREATE UNIQUE INDEX IF NOT EXISTS "budget_categories_account_id_name_key"
  ON "budget_categories"("account_id", "name");

ALTER TABLE "budget_transactions"
  ADD COLUMN IF NOT EXISTS "pet_id" UUID,
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ(6);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_budget_transactions_pet_id'
  ) THEN
    ALTER TABLE "budget_transactions"
      ADD CONSTRAINT "fk_budget_transactions_pet_id"
      FOREIGN KEY ("pet_id") REFERENCES "pets"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_budget_transactions_account_date"
  ON "budget_transactions"("account_id", "date");
CREATE INDEX IF NOT EXISTS "idx_budget_transactions_pet_date"
  ON "budget_transactions"("pet_id", "date");
CREATE INDEX IF NOT EXISTS "idx_budget_transactions_category_date"
  ON "budget_transactions"("category_id", "date");

ALTER TABLE "photos"
  ADD COLUMN IF NOT EXISTS "pet_id" UUID,
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ(6),
  ALTER COLUMN "caption" TYPE VARCHAR(300);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_photos_pet_id'
  ) THEN
    ALTER TABLE "photos"
      ADD CONSTRAINT "fk_photos_pet_id"
      FOREIGN KEY ("pet_id") REFERENCES "pets"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_photos_pet_created"
  ON "photos"("pet_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_photos_visibility_status_created"
  ON "photos"("is_private", "status", "created_at");

ALTER TABLE "pet_sitters"
  ADD COLUMN IF NOT EXISTS "display_name" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "city" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "district" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "ward" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS "experience" TEXT,
  ADD COLUMN IF NOT EXISTS "service_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS "idx_pet_sitters_city_district"
  ON "pet_sitters"("city", "district");
CREATE INDEX IF NOT EXISTS "idx_pet_sitters_available_rating"
  ON "pet_sitters"("is_available", "avg_rating");

ALTER TABLE "sitter_bookings"
  ADD COLUMN IF NOT EXISTS "owner_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "sitter_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "care_instructions" TEXT,
  ADD COLUMN IF NOT EXISTS "payment_note" VARCHAR(255);

CREATE TABLE IF NOT EXISTS "subscription_plans" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(50) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "tier" "subscription_tier" NOT NULL,
  "price" DECIMAL(12, 2),
  "currency" VARCHAR(10),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plans_code_key"
  ON "subscription_plans"("code");

INSERT INTO "subscription_plans" ("code", "name", "tier", "price", "currency")
VALUES
  ('free', 'Free', 'free', 0, 'VND'),
  ('premium_monthly', 'Premium Monthly', 'premium', 49000, 'VND'),
  ('premium_yearly', 'Premium Yearly', 'premium', 399000, 'VND')
ON CONFLICT ("code") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "tier" = EXCLUDED."tier",
  "price" = EXCLUDED."price",
  "currency" = EXCLUDED."currency",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "user_subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "plan_code" VARCHAR(50) NOT NULL,
  "provider" "subscription_provider" NOT NULL DEFAULT 'manual',
  "provider_customer_id" VARCHAR(255),
  "provider_original_id" VARCHAR(255),
  "status" "subscription_status" NOT NULL DEFAULT 'free',
  "started_at" TIMESTAMPTZ(6),
  "expires_at" TIMESTAMPTZ(6),
  "cancelled_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_subscriptions_account_id'
  ) THEN
    ALTER TABLE "user_subscriptions"
      ADD CONSTRAINT "fk_user_subscriptions_account_id"
      FOREIGN KEY ("account_id") REFERENCES "accounts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_subscriptions_plan_code'
  ) THEN
    ALTER TABLE "user_subscriptions"
      ADD CONSTRAINT "fk_user_subscriptions_plan_code"
      FOREIGN KEY ("plan_code") REFERENCES "subscription_plans"("code")
      ON DELETE RESTRICT ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_account_status"
  ON "user_subscriptions"("account_id", "status");
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_provider_customer"
  ON "user_subscriptions"("provider_customer_id");

CREATE TABLE IF NOT EXISTS "usage_counters" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "feature_key" VARCHAR(80) NOT NULL,
  "period_key" VARCHAR(40) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "reset_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_usage_counters_account_id'
  ) THEN
    ALTER TABLE "usage_counters"
      ADD CONSTRAINT "fk_usage_counters_account_id"
      FOREIGN KEY ("account_id") REFERENCES "accounts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "usage_counters_account_feature_period_key"
  ON "usage_counters"("account_id", "feature_key", "period_key");
CREATE INDEX IF NOT EXISTS "idx_usage_counters_account_feature"
  ON "usage_counters"("account_id", "feature_key");

CREATE TABLE IF NOT EXISTS "ai_conversations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "pet_id" UUID,
  "title" VARCHAR(160),
  "status" "ai_conversation_status" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ai_messages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" UUID NOT NULL,
  "account_id" UUID NOT NULL,
  "role" "ai_message_role" NOT NULL,
  "content" TEXT NOT NULL,
  "model" VARCHAR(100),
  "provider" VARCHAR(50),
  "input_tokens" INTEGER,
  "output_tokens" INTEGER,
  "safety_flags" JSONB,
  "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ai_usage_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "conversation_id" UUID,
  "provider" VARCHAR(50) NOT NULL,
  "model" VARCHAR(100) NOT NULL,
  "input_tokens" INTEGER NOT NULL DEFAULT 0,
  "output_tokens" INTEGER NOT NULL DEFAULT 0,
  "estimated_cost" DECIMAL(12, 6),
  "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ai_conversations_account_id'
  ) THEN
    ALTER TABLE "ai_conversations"
      ADD CONSTRAINT "fk_ai_conversations_account_id"
      FOREIGN KEY ("account_id") REFERENCES "accounts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ai_conversations_pet_id'
  ) THEN
    ALTER TABLE "ai_conversations"
      ADD CONSTRAINT "fk_ai_conversations_pet_id"
      FOREIGN KEY ("pet_id") REFERENCES "pets"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ai_messages_account_id'
  ) THEN
    ALTER TABLE "ai_messages"
      ADD CONSTRAINT "fk_ai_messages_account_id"
      FOREIGN KEY ("account_id") REFERENCES "accounts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ai_messages_conversation_id'
  ) THEN
    ALTER TABLE "ai_messages"
      ADD CONSTRAINT "fk_ai_messages_conversation_id"
      FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ai_usage_logs_account_id'
  ) THEN
    ALTER TABLE "ai_usage_logs"
      ADD CONSTRAINT "fk_ai_usage_logs_account_id"
      FOREIGN KEY ("account_id") REFERENCES "accounts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ai_usage_logs_conversation_id'
  ) THEN
    ALTER TABLE "ai_usage_logs"
      ADD CONSTRAINT "fk_ai_usage_logs_conversation_id"
      FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_ai_conversations_account_updated"
  ON "ai_conversations"("account_id", "updated_at");
CREATE INDEX IF NOT EXISTS "idx_ai_conversations_pet_updated"
  ON "ai_conversations"("pet_id", "updated_at");
CREATE INDEX IF NOT EXISTS "idx_ai_messages_conversation_created"
  ON "ai_messages"("conversation_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_ai_messages_account_created"
  ON "ai_messages"("account_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_ai_usage_logs_account_created"
  ON "ai_usage_logs"("account_id", "created_at");

CREATE TABLE IF NOT EXISTS "user_blocks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "blocker_account_id" UUID NOT NULL,
  "blocked_account_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "reports" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "reporter_account_id" UUID NOT NULL,
  "target_type" "report_target_type" NOT NULL,
  "target_id" UUID NOT NULL,
  "reason" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status" "report_status" NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_blocks_blocker_account_id'
  ) THEN
    ALTER TABLE "user_blocks"
      ADD CONSTRAINT "fk_user_blocks_blocker_account_id"
      FOREIGN KEY ("blocker_account_id") REFERENCES "accounts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_blocks_blocked_account_id'
  ) THEN
    ALTER TABLE "user_blocks"
      ADD CONSTRAINT "fk_user_blocks_blocked_account_id"
      FOREIGN KEY ("blocked_account_id") REFERENCES "accounts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_blocks_not_self_check'
  ) THEN
    ALTER TABLE "user_blocks"
      ADD CONSTRAINT "user_blocks_not_self_check"
      CHECK ("blocker_account_id" <> "blocked_account_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_reports_reporter_account_id'
  ) THEN
    ALTER TABLE "reports"
      ADD CONSTRAINT "fk_reports_reporter_account_id"
      FOREIGN KEY ("reporter_account_id") REFERENCES "accounts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "user_blocks_blocker_blocked_key"
  ON "user_blocks"("blocker_account_id", "blocked_account_id");
CREATE INDEX IF NOT EXISTS "idx_user_blocks_blocked_account_id"
  ON "user_blocks"("blocked_account_id");
CREATE INDEX IF NOT EXISTS "idx_reports_target"
  ON "reports"("target_type", "target_id");
CREATE INDEX IF NOT EXISTS "idx_reports_reporter_account_id"
  ON "reports"("reporter_account_id");
CREATE INDEX IF NOT EXISTS "idx_reports_status"
  ON "reports"("status");

CREATE TABLE IF NOT EXISTS "sitter_booking_messages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "booking_id" UUID NOT NULL,
  "sender_id" UUID NOT NULL,
  "type" "booking_message_type" NOT NULL DEFAULT 'text',
  "content" TEXT,
  "image_url" TEXT,
  "read_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sitter_booking_messages_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_sitter_booking_messages_booking_id'
  ) THEN
    ALTER TABLE "sitter_booking_messages"
      ADD CONSTRAINT "fk_sitter_booking_messages_booking_id"
      FOREIGN KEY ("booking_id") REFERENCES "sitter_bookings"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_sitter_booking_messages_sender_id'
  ) THEN
    ALTER TABLE "sitter_booking_messages"
      ADD CONSTRAINT "fk_sitter_booking_messages_sender_id"
      FOREIGN KEY ("sender_id") REFERENCES "accounts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_sitter_booking_messages_booking_created"
  ON "sitter_booking_messages"("booking_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_sitter_booking_messages_sender_created"
  ON "sitter_booking_messages"("sender_id", "created_at");
