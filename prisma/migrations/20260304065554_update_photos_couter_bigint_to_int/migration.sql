/*
  Warnings:

  - You are about to alter the column `view_count` on the `photos` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `like_count` on the `photos` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `comment_count` on the `photos` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "photo_comments" DROP CONSTRAINT "fk_photo_comments_photo_id";

-- DropForeignKey
ALTER TABLE "photo_likes" DROP CONSTRAINT "fk_photo_likes_photo_id";

-- DropForeignKey
ALTER TABLE "photo_views" DROP CONSTRAINT "fk_photo_views_photo_id";

-- DropIndex
DROP INDEX "idx_photos_created_at";

-- AlterTable
ALTER TABLE "photos" ALTER COLUMN "view_count" SET DATA TYPE INTEGER,
ALTER COLUMN "like_count" SET DATA TYPE INTEGER,
ALTER COLUMN "comment_count" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE INDEX "idx_photos_created_at" ON "photos"("created_at");
