ALTER TABLE "sitter_bookings"
  ADD COLUMN "idempotency_key" VARCHAR(255),
  ADD COLUMN "expires_at" TIMESTAMPTZ(6),
  ADD COLUMN "confirmed_at" TIMESTAMPTZ(6);

CREATE UNIQUE INDEX "sitter_bookings_idempotency_key_key"
  ON "sitter_bookings"("idempotency_key");

CREATE INDEX "idx_sitter_bookings_expires_at"
  ON "sitter_bookings"("expires_at");

CREATE INDEX "idx_sitter_bookings_overlap"
  ON "sitter_bookings"("sitter_id", "start_time", "end_time");
