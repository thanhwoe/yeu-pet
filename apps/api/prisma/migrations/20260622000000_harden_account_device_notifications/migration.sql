-- Track an app installation independently from its current FCM token so a
-- token refresh can retire the installation's previous token rows.
ALTER TABLE "account_devices"
ADD COLUMN "installation_id" UUID,
ADD COLUMN "registration_generation" INTEGER NOT NULL DEFAULT 0;

UPDATE "account_devices"
SET "installation_id" = "id";

UPDATE "account_devices"
SET "is_active" = TRUE
WHERE "is_active" IS NULL;

ALTER TABLE "account_devices"
ALTER COLUMN "installation_id" SET NOT NULL,
ALTER COLUMN "is_active" SET NOT NULL;

CREATE INDEX "idx_account_devices_installation_id"
ON "account_devices"("installation_id");

-- Snapshot recipient ownership directly on delivery history. The
-- notification relation remains authoritative, while this keeps historical
-- queries unambiguous after a device row is reassigned to another account.
ALTER TABLE "notification_deliveries"
ADD COLUMN "account_id" UUID;

UPDATE "notification_deliveries" AS delivery
SET "account_id" = notification."account_id"
FROM "notifications" AS notification
WHERE notification."id" = delivery."notification_id";

UPDATE "notification_deliveries" AS delivery
SET "push_token" = device."push_token"
FROM "account_devices" AS device
WHERE device."id" = delivery."device_id"
  AND delivery."push_token" IS NULL;

ALTER TABLE "notification_deliveries"
ALTER COLUMN "account_id" SET NOT NULL,
ALTER COLUMN "push_token" SET NOT NULL;

CREATE INDEX "idx_notification_deliveries_account_id"
ON "notification_deliveries"("account_id");
