-- CreateEnum
CREATE TYPE "email_change_status" AS ENUM ('pending', 'verified', 'expired', 'cancelled');

-- CreateTable
CREATE TABLE "email_change_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "new_email" VARCHAR(255) NOT NULL,
    "otp_hash" VARCHAR(255) NOT NULL,
    "status" "email_change_status" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resend_count" INTEGER NOT NULL DEFAULT 0,
    "last_sent_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_email_change_requests_account_id" ON "email_change_requests"("account_id");

-- CreateIndex
CREATE INDEX "idx_email_change_requests_new_email" ON "email_change_requests"("new_email");

-- CreateIndex
CREATE INDEX "idx_email_change_requests_status" ON "email_change_requests"("status");

-- CreateIndex
CREATE INDEX "idx_email_change_requests_expires_at" ON "email_change_requests"("expires_at");

-- AddForeignKey
ALTER TABLE "email_change_requests" ADD CONSTRAINT "fk_email_change_requests_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
