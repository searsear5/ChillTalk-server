/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `users_email_key` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `email`;

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);
