/*
  Warnings:

  - You are about to drop the column `attachments` on the `medical_records` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medical_records" DROP COLUMN "attachments";

-- CreateTable
CREATE TABLE "medical_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "medical_id" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "url" TEXT NOT NULL,
    "public_id" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_medical_attachments" ON "medical_attachments"("id");

-- CreateIndex
CREATE INDEX "idx_medical_attachments_medical_id" ON "medical_attachments"("medical_id");

-- AddForeignKey
ALTER TABLE "medical_attachments" ADD CONSTRAINT "fk_medical_attachments_medical_id" FOREIGN KEY ("medical_id") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
