ALTER TABLE "user_subscriptions"
  ADD COLUMN IF NOT EXISTS "last_rc_event_id" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "last_rc_event_at" BIGINT;

CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_provider_original"
  ON "user_subscriptions"("provider_original_id");

CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_last_rc_event"
  ON "user_subscriptions"("last_rc_event_id");
