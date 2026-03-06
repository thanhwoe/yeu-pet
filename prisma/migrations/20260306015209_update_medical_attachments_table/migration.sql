/*
  Warnings:

  - You are about to drop the column `public_id` on the `medical_attachments` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "attachment_status" AS ENUM ('processing', 'ready', 'failed');

-- AlterEnum
ALTER TYPE "species_enum" ADD VALUE 'hamster';

-- AlterTable
ALTER TABLE "medical_attachments" DROP COLUMN "public_id",
ADD COLUMN     "file_id" TEXT,
ADD COLUMN     "thumbnail_url" TEXT;

-- AlterTable
ALTER TABLE "medical_records" ADD COLUMN     "attachment_status" "attachment_status" NOT NULL DEFAULT 'processing';
