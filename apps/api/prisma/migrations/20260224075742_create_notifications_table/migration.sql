-- CreateEnum
CREATE TYPE "device_platform" AS ENUM ('android', 'ios', 'unknown');

-- CreateEnum
CREATE TYPE "notifications_status" AS ENUM ('pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "reminder_status" AS ENUM ('pending', 'sent', 'cancelled');

-- CreateEnum
CREATE TYPE "reminder_type" AS ENUM ('grooming', 'feeding', 'vaccination', 'medication');

-- CreateTable
CREATE TABLE "account_devices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "push_token" VARCHAR(512) NOT NULL,
    "device_name" VARCHAR(100),
    "os_version" VARCHAR(20),
    "platform" "device_platform" DEFAULT 'unknown',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_settings" (
    "account_id" UUID NOT NULL,
    "notification_enable" BOOLEAN NOT NULL DEFAULT true,
    "language" VARCHAR(20) NOT NULL DEFAULT 'vi',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_settings_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "image_url" TEXT,
    "image_id" TEXT,
    "deep_link" TEXT,
    "data" JSONB,
    "is_read" BOOLEAN DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "status" "notifications_status" NOT NULL,
    "sent_at" TIMESTAMPTZ(6),
    "error" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "pet_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(255),
    "type" "reminder_type" NOT NULL,
    "status" "reminder_status" NOT NULL,
    "scheduled_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_account_account_id" ON "account_devices"("account_id");

-- CreateIndex
CREATE INDEX "idx_account_devices" ON "account_devices"("id");

-- CreateIndex
CREATE INDEX "idx_account_devices_push_token" ON "account_devices"("push_token");

-- CreateIndex
CREATE INDEX "idx_account_settings" ON "account_settings"("account_id");

-- CreateIndex
CREATE INDEX "idx_notifications" ON "notifications"("id");

-- CreateIndex
CREATE INDEX "idx_notifications_account_id" ON "notifications"("account_id");

-- CreateIndex
CREATE INDEX "idx_notifications_error" ON "notifications"("error");

-- CreateIndex
CREATE INDEX "idx_reminders" ON "reminders"("id");

-- CreateIndex
CREATE INDEX "idx_reminders_account_id" ON "reminders"("account_id");

-- CreateIndex
CREATE INDEX "idx_reminders_pet_id" ON "reminders"("pet_id");

-- AddForeignKey
ALTER TABLE "account_devices" ADD CONSTRAINT "fk_account_devices_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "account_settings" ADD CONSTRAINT "fk_account_settings_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "fk_notifications_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "fk_reminders_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "fk_reminders_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
