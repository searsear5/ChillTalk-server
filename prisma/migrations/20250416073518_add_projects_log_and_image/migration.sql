/*
  Warnings:

  - The primary key for the `projects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `image2` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `image3` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `image4` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pid` to the `Projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `projects_title_key` ON `projects`;

-- AlterTable
ALTER TABLE `projects` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `image`,
    DROP COLUMN `image2`,
    DROP COLUMN `image3`,
    DROP COLUMN `image4`,
    ADD COLUMN `dateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `pid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`pid`);

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `Image` (
    `imid` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `pid` INTEGER NOT NULL,

    INDEX `Image_pid_idx`(`pid`),
    PRIMARY KEY (`imid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project_logs` (
    `lid` INTEGER NOT NULL AUTO_INCREMENT,
    `pid` INTEGER NOT NULL,
    `action_type` VARCHAR(191) NOT NULL,
    `old_data` VARCHAR(191) NOT NULL,
    `new_data` VARCHAR(191) NOT NULL,
    `changed_date` DATETIME(3) NOT NULL,
    `uid` INTEGER NOT NULL,

    INDEX `Project_logs_pid_idx`(`pid`),
    INDEX `Project_logs_uid_idx`(`uid`),
    PRIMARY KEY (`lid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `uid` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`uid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_pid_fkey` FOREIGN KEY (`pid`) REFERENCES `Projects`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project_logs` ADD CONSTRAINT `Project_logs_pid_fkey` FOREIGN KEY (`pid`) REFERENCES `Projects`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project_logs` ADD CONSTRAINT `Project_logs_uid_fkey` FOREIGN KEY (`uid`) REFERENCES `User`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;
