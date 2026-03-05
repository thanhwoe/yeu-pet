-- AddForeignKey
ALTER TABLE "photo_comments" ADD CONSTRAINT "fk_photo_comments_photo_id" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
