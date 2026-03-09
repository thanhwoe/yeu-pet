-- CreateEnum
CREATE TYPE "sitter_bookings_status" AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected');

-- CreateEnum
CREATE TYPE "sitter_bookings_type" AS ENUM ('hourly', 'daily');

-- CreateTable
CREATE TABLE "pet_sitters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "bio" VARCHAR(200),
    "address" VARCHAR(200) NOT NULL,
    "hourly_rate" DECIMAL(12,2) NOT NULL,
    "daily_rate" DECIMAL(12,2) NOT NULL,
    "max_concurrent_bookings" INTEGER NOT NULL DEFAULT 3,
    "active_bookings_count" INTEGER NOT NULL DEFAULT 0,
    "completed_bookings_count" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pet_sitters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitter_bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "sitter_id" UUID NOT NULL,
    "pet_id" UUID NOT NULL,
    "type" "sitter_bookings_type" NOT NULL,
    "status" "sitter_bookings_status" NOT NULL DEFAULT 'pending',
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "total_price" DECIMAL(10,2),
    "cancelled_by" UUID,
    "cancelled_at" TIMESTAMPTZ(6),
    "cancel_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sitter_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitter_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "sitter_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sitter_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_pet_sitters" ON "pet_sitters"("id");

-- CreateIndex
CREATE INDEX "idx_pet_sitters_account_id" ON "pet_sitters"("account_id");

-- CreateIndex
CREATE INDEX "idx_sitter_bookings_account_id" ON "sitter_bookings"("account_id");

-- CreateIndex
CREATE INDEX "idx_sitter_bookings_sitter_id" ON "sitter_bookings"("sitter_id");

-- CreateIndex
CREATE INDEX "idx_sitter_bookings_start_time" ON "sitter_bookings"("start_time");

-- CreateIndex
CREATE INDEX "idx_sitter_bookings_status" ON "sitter_bookings"("sitter_id", "status");

-- CreateIndex
CREATE INDEX "idx_sitter_reviews_account_id" ON "sitter_reviews"("account_id");

-- CreateIndex
CREATE INDEX "idx_sitter_reviews_sitter_id" ON "sitter_reviews"("sitter_id");

-- AddForeignKey
ALTER TABLE "pet_sitters" ADD CONSTRAINT "fk_pet_sitters_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sitter_bookings" ADD CONSTRAINT "fk_sitter_bookings_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sitter_bookings" ADD CONSTRAINT "fk_sitter_bookings_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sitter_bookings" ADD CONSTRAINT "fk_sitter_bookings_sitter_id" FOREIGN KEY ("sitter_id") REFERENCES "pet_sitters"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sitter_reviews" ADD CONSTRAINT "fk_sitter_reviews_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sitter_reviews" ADD CONSTRAINT "fk_sitter_reviews_booking_id" FOREIGN KEY ("booking_id") REFERENCES "sitter_bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sitter_reviews" ADD CONSTRAINT "fk_sitter_reviews_sitter_id" FOREIGN KEY ("sitter_id") REFERENCES "pet_sitters"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
