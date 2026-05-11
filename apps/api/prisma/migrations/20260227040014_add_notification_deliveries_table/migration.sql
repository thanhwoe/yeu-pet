/*
  Warnings:

  - You are about to drop the column `error` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `sent_at` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `notifications` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_notifications_error";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "error",
DROP COLUMN "sent_at",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "notification_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "push_token" VARCHAR(512),
    "status" "notifications_status" NOT NULL,
    "sent_at" TIMESTAMPTZ(6),
    "error" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_notification_deliveries" ON "notification_deliveries"("id");

-- CreateIndex
CREATE INDEX "idx_notification_deliveries_device_id" ON "notification_deliveries"("device_id");

-- CreateIndex
CREATE INDEX "idx_notification_deliveries_error" ON "notification_deliveries"("error");

-- CreateIndex
CREATE INDEX "idx_notification_deliveries_notification_id" ON "notification_deliveries"("notification_id");

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "fk_notification_deliveries_device_id" FOREIGN KEY ("device_id") REFERENCES "account_devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "fk_notification_deliveries_notification_id" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
