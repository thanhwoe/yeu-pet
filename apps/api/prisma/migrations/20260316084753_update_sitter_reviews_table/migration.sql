/*
  Warnings:

  - A unique constraint covering the columns `[booking_id]` on the table `sitter_reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "idx_sitter_bookings" ON "sitter_bookings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "sitter_reviews_booking_id_key" ON "sitter_reviews"("booking_id");
