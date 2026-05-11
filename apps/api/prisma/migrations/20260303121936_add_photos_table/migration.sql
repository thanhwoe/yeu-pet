-- CreateEnum
CREATE TYPE "photos_status" AS ENUM ('pending', 'processing', 'ready', 'failed');

-- CreateTable
CREATE TABLE "photo_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "photo_id" UUID NOT NULL,
    "parent_id" UUID,
    "content" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_likes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "photo_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_views" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "photo_id" UUID NOT NULL,
    "view_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "url" TEXT,
    "file_id" TEXT,
    "thumbnail_url" TEXT,
    "caption" VARCHAR(200),
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "status" "photos_status" NOT NULL DEFAULT 'pending',
    "view_count" BIGINT NOT NULL DEFAULT 0,
    "like_count" BIGINT NOT NULL DEFAULT 0,
    "comment_count" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_photo_comments_account_id" ON "photo_comments"("account_id");

-- CreateIndex
CREATE INDEX "idx_photo_comments_parent_id" ON "photo_comments"("parent_id");

-- CreateIndex
CREATE INDEX "idx_photo_comments_photo_id" ON "photo_comments"("photo_id");

-- CreateIndex
CREATE INDEX "idx_photo_likes_account_id" ON "photo_likes"("account_id");

-- CreateIndex
CREATE INDEX "idx_photo_likes_photo_id" ON "photo_likes"("photo_id");

-- CreateIndex
CREATE UNIQUE INDEX "photo_likes_photo_id_account_id_key" ON "photo_likes"("photo_id", "account_id");

-- CreateIndex
CREATE INDEX "idx_photo_views_account_id" ON "photo_views"("account_id");

-- CreateIndex
CREATE INDEX "idx_photo_views_photo_id" ON "photo_views"("photo_id");

-- CreateIndex
CREATE UNIQUE INDEX "photo_views_photo_id_account_id_key" ON "photo_views"("photo_id", "account_id");

-- CreateIndex
CREATE INDEX "idx_photos_account_id" ON "photos"("account_id");

-- CreateIndex
CREATE INDEX "idx_photos_created_at" ON "photos"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_photos_is_private" ON "photos"("is_private");

-- CreateIndex
CREATE INDEX "idx_photos_status" ON "photos"("status");

-- AddForeignKey
ALTER TABLE "photo_comments" ADD CONSTRAINT "fk_photo_comments_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_comments" ADD CONSTRAINT "fk_photo_comments_parent_id" FOREIGN KEY ("parent_id") REFERENCES "photo_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_comments" ADD CONSTRAINT "fk_photo_comments_photo_id" FOREIGN KEY ("account_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_likes" ADD CONSTRAINT "fk_photo_likes_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_likes" ADD CONSTRAINT "fk_photo_likes_photo_id" FOREIGN KEY ("account_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_views" ADD CONSTRAINT "fk_photo_views_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_views" ADD CONSTRAINT "fk_photo_views_photo_id" FOREIGN KEY ("account_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "fk_photos_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
