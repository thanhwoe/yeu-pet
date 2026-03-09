/*
  Warnings:

  - A unique constraint covering the columns `[account_id]` on the table `pet_sitters` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "pet_sitters_account_id_key" ON "pet_sitters"("account_id");
