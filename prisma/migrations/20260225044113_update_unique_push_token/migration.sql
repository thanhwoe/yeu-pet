/*
  Warnings:

  - A unique constraint covering the columns `[push_token]` on the table `account_devices` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "account_devices_push_token_key" ON "account_devices"("push_token");
