-- Reconcile manually managed Supabase SQL with Prisma migrations.
-- This migration intentionally avoids DROP statements and data deletion.

CREATE INDEX IF NOT EXISTS "idx_accounts_role"
  ON "accounts"("role")
  WHERE "role" = 'admin';

CREATE INDEX IF NOT EXISTS "idx_accounts_subscription_expires"
  ON "accounts"("subscription_expires_at")
  WHERE "subscription_expires_at" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_otp_tokens_token"
  ON "otp_tokens"("token")
  WHERE "token" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_medical_attachments_deleted"
  ON "medical_attachments"("deleted_at")
  WHERE "deleted_at" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_notifications_un_read"
  ON "notifications"("is_read")
  WHERE "is_read" IS FALSE;

CREATE INDEX IF NOT EXISTS "idx_pet_sitters_available"
  ON "pet_sitters"("is_available")
  WHERE "is_available" IS TRUE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_photo_likes_photo_id'
  ) THEN
    ALTER TABLE "photo_likes"
      ADD CONSTRAINT "fk_photo_likes_photo_id"
      FOREIGN KEY ("photo_id") REFERENCES "photos"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_photo_views_photo_id'
  ) THEN
    ALTER TABLE "photo_views"
      ADD CONSTRAINT "fk_photo_views_photo_id"
      FOREIGN KEY ("photo_id") REFERENCES "photos"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_sitter_bookings_cancelled_by'
  ) THEN
    ALTER TABLE "sitter_bookings"
      ADD CONSTRAINT "fk_sitter_bookings_cancelled_by"
      FOREIGN KEY ("cancelled_by") REFERENCES "accounts"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_time_check'
  ) THEN
    ALTER TABLE "sitter_bookings"
      ADD CONSTRAINT "bookings_time_check"
      CHECK ("end_time" > "start_time")
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sitter_reviews_rating_check'
  ) THEN
    ALTER TABLE "sitter_reviews"
      ADD CONSTRAINT "sitter_reviews_rating_check"
      CHECK ("rating" BETWEEN 1 AND 5)
      NOT VALID;
  END IF;
END $$;

DROP TRIGGER IF EXISTS "trg_photo_like_count" ON "photo_likes";
DROP TRIGGER IF EXISTS "trg_photo_comment_count" ON "photo_comments";
DROP TRIGGER IF EXISTS "trg_comment_reply_count" ON "photo_comments";
DROP TRIGGER IF EXISTS "trg_prevent_self_booking" ON "sitter_bookings";
DROP TRIGGER IF EXISTS "trg_review_update_sitter_rating" ON "sitter_reviews";
DROP TRIGGER IF EXISTS "trg_booking_update_sitter_counts" ON "sitter_bookings";

CREATE OR REPLACE FUNCTION "update_photo_like_count"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE "photos"
    SET "like_count" = "like_count" + 1
    WHERE "id" = NEW."photo_id";
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE "photos"
    SET "like_count" = GREATEST("like_count" - 1, 0)
    WHERE "id" = OLD."photo_id";
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_photo_like_count"
AFTER INSERT OR DELETE ON "photo_likes"
FOR EACH ROW EXECUTE FUNCTION "update_photo_like_count"();

CREATE OR REPLACE FUNCTION "update_photo_comment_count"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW."parent_id" IS NULL THEN
    UPDATE "photos"
    SET "comment_count" = "comment_count" + 1
    WHERE "id" = NEW."photo_id";
  ELSIF TG_OP = 'UPDATE'
    AND OLD."deleted_at" IS NULL
    AND NEW."deleted_at" IS NOT NULL
    AND NEW."parent_id" IS NULL THEN
    UPDATE "photos"
    SET "comment_count" = GREATEST("comment_count" - 1, 0)
    WHERE "id" = NEW."photo_id";
  ELSIF TG_OP = 'DELETE' AND OLD."parent_id" IS NULL THEN
    UPDATE "photos"
    SET "comment_count" = GREATEST("comment_count" - 1, 0)
    WHERE "id" = OLD."photo_id";
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_photo_comment_count"
AFTER INSERT OR UPDATE OR DELETE ON "photo_comments"
FOR EACH ROW EXECUTE FUNCTION "update_photo_comment_count"();

CREATE OR REPLACE FUNCTION "update_comment_reply_count"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW."parent_id" IS NOT NULL THEN
    UPDATE "photo_comments"
    SET "reply_count" = "reply_count" + 1
    WHERE "id" = NEW."parent_id";
  ELSIF TG_OP = 'UPDATE'
    AND OLD."deleted_at" IS NULL
    AND NEW."deleted_at" IS NOT NULL
    AND NEW."parent_id" IS NOT NULL THEN
    UPDATE "photo_comments"
    SET "reply_count" = GREATEST("reply_count" - 1, 0)
    WHERE "id" = NEW."parent_id";
  ELSIF TG_OP = 'DELETE' AND OLD."parent_id" IS NOT NULL THEN
    UPDATE "photo_comments"
    SET "reply_count" = GREATEST("reply_count" - 1, 0)
    WHERE "id" = OLD."parent_id";
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_comment_reply_count"
AFTER INSERT OR UPDATE OR DELETE ON "photo_comments"
FOR EACH ROW EXECUTE FUNCTION "update_comment_reply_count"();

CREATE OR REPLACE FUNCTION "prevent_self_booking"()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."account_id" = (
    SELECT "account_id"
    FROM "pet_sitters"
    WHERE "id" = NEW."sitter_id"
  ) THEN
    RAISE EXCEPTION 'Owner cannot book themselves as a sitter';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_prevent_self_booking"
BEFORE INSERT OR UPDATE OF "account_id", "sitter_id" ON "sitter_bookings"
FOR EACH ROW EXECUTE FUNCTION "prevent_self_booking"();

CREATE OR REPLACE FUNCTION "recalculate_sitter_rating"("target_sitter_id" uuid)
RETURNS VOID AS $$
BEGIN
  UPDATE "pet_sitters"
  SET
    "avg_rating" = COALESCE((
      SELECT ROUND(AVG("rating")::numeric, 2)
      FROM "sitter_reviews"
      WHERE "sitter_id" = "target_sitter_id"
    ), 0),
    "total_reviews" = (
      SELECT COUNT(*)
      FROM "sitter_reviews"
      WHERE "sitter_id" = "target_sitter_id"
    ),
    "updated_at" = NOW()
  WHERE "id" = "target_sitter_id";
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "update_sitter_rating"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM "recalculate_sitter_rating"(NEW."sitter_id");
  END IF;

  IF TG_OP IN ('UPDATE', 'DELETE')
    AND (TG_OP = 'DELETE' OR OLD."sitter_id" IS DISTINCT FROM NEW."sitter_id") THEN
    PERFORM "recalculate_sitter_rating"(OLD."sitter_id");
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_review_update_sitter_rating"
AFTER INSERT OR UPDATE OR DELETE ON "sitter_reviews"
FOR EACH ROW EXECUTE FUNCTION "update_sitter_rating"();

CREATE OR REPLACE FUNCTION "recalculate_sitter_booking_counts"("target_sitter_id" uuid)
RETURNS VOID AS $$
BEGIN
  UPDATE "pet_sitters"
  SET
    "active_bookings_count" = (
      SELECT COUNT(*)
      FROM "sitter_bookings"
      WHERE "sitter_id" = "target_sitter_id"
        AND "status" IN ('confirmed', 'active')
    ),
    "completed_bookings_count" = (
      SELECT COUNT(*)
      FROM "sitter_bookings"
      WHERE "sitter_id" = "target_sitter_id"
        AND "status" = 'completed'
    ),
    "updated_at" = NOW()
  WHERE "id" = "target_sitter_id";
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "update_sitter_booking_counts"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM "recalculate_sitter_booking_counts"(NEW."sitter_id");
  END IF;

  IF TG_OP IN ('UPDATE', 'DELETE')
    AND (TG_OP = 'DELETE' OR OLD."sitter_id" IS DISTINCT FROM NEW."sitter_id") THEN
    PERFORM "recalculate_sitter_booking_counts"(OLD."sitter_id");
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_booking_update_sitter_counts"
AFTER INSERT OR UPDATE OR DELETE ON "sitter_bookings"
FOR EACH ROW EXECUTE FUNCTION "update_sitter_booking_counts"();

UPDATE "photos" AS p
SET
  "like_count" = COALESCE(l.count, 0),
  "comment_count" = COALESCE(c.count, 0)
FROM (
  SELECT "id" FROM "photos"
) AS source
LEFT JOIN (
  SELECT "photo_id", COUNT(*)::int AS count
  FROM "photo_likes"
  GROUP BY "photo_id"
) AS l ON l."photo_id" = source."id"
LEFT JOIN (
  SELECT "photo_id", COUNT(*)::int AS count
  FROM "photo_comments"
  WHERE "parent_id" IS NULL
    AND "deleted_at" IS NULL
  GROUP BY "photo_id"
) AS c ON c."photo_id" = source."id"
WHERE p."id" = source."id";

UPDATE "photo_comments" AS parent
SET "reply_count" = COALESCE(replies.count, 0)
FROM (
  SELECT "parent_id", COUNT(*)::int AS count
  FROM "photo_comments"
  WHERE "parent_id" IS NOT NULL
    AND "deleted_at" IS NULL
  GROUP BY "parent_id"
) AS replies
WHERE parent."id" = replies."parent_id";

UPDATE "photo_comments" AS parent
SET "reply_count" = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM "photo_comments" AS reply
  WHERE reply."parent_id" = parent."id"
    AND reply."deleted_at" IS NULL
);

UPDATE "pet_sitters" AS sitter
SET
  "avg_rating" = COALESCE(ratings.avg_rating, 0),
  "total_reviews" = COALESCE(ratings.total_reviews, 0),
  "active_bookings_count" = COALESCE(bookings.active_bookings_count, 0),
  "completed_bookings_count" = COALESCE(bookings.completed_bookings_count, 0),
  "updated_at" = NOW()
FROM (
  SELECT "id" FROM "pet_sitters"
) AS source
LEFT JOIN (
  SELECT
    "sitter_id",
    ROUND(AVG("rating")::numeric, 2) AS avg_rating,
    COUNT(*)::int AS total_reviews
  FROM "sitter_reviews"
  GROUP BY "sitter_id"
) AS ratings ON ratings."sitter_id" = source."id"
LEFT JOIN (
  SELECT
    "sitter_id",
    COUNT(*) FILTER (WHERE "status" IN ('confirmed', 'active'))::int AS active_bookings_count,
    COUNT(*) FILTER (WHERE "status" = 'completed')::int AS completed_bookings_count
  FROM "sitter_bookings"
  GROUP BY "sitter_id"
) AS bookings ON bookings."sitter_id" = source."id"
WHERE sitter."id" = source."id";
