/*
  Warnings:

  - You are about to drop the column `image_id` on the `budget_categories` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `budget_categories` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `budget_categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "budget_categories" DROP COLUMN "image_id",
DROP COLUMN "image_url",
ADD COLUMN     "account_id" UUID NOT NULL,
ADD COLUMN     "emoji" TEXT;

-- CreateIndex
CREATE INDEX "idx_budget_categories_account_id" ON "budget_categories"("account_id");

-- AddForeignKey
ALTER TABLE "budget_categories" ADD CONSTRAINT "fk_budget_categories_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
