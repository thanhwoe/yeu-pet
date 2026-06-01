UPDATE "sitter_bookings"
SET "expires_at" = COALESCE("created_at", NOW()) + INTERVAL '15 minutes'
WHERE "status" = 'pending'
  AND "expires_at" IS NULL;
