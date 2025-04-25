-- CreateTable
CREATE TABLE `User_role` (
    `urid` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` INTEGER NOT NULL,
    `rid` INTEGER NOT NULL,

    INDEX `User_role_uid_idx`(`uid`),
    INDEX `User_role_rid_idx`(`rid`),
    PRIMARY KEY (`urid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `rid` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`rid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role_permission` (
    `rpid` INTEGER NOT NULL AUTO_INCREMENT,
    `rid` INTEGER NOT NULL,
    `pid` INTEGER NOT NULL,

    INDEX `Role_permission_rid_idx`(`rid`),
    INDEX `Role_permission_pid_idx`(`pid`),
    PRIMARY KEY (`rpid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `pid` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Permission_name_key`(`name`),
    PRIMARY KEY (`pid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User_role` ADD CONSTRAINT `User_role_uid_fkey` FOREIGN KEY (`uid`) REFERENCES `User`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_role` ADD CONSTRAINT `User_role_rid_fkey` FOREIGN KEY (`rid`) REFERENCES `Role`(`rid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role_permission` ADD CONSTRAINT `Role_permission_rid_fkey` FOREIGN KEY (`rid`) REFERENCES `Role`(`rid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role_permission` ADD CONSTRAINT `Role_permission_pid_fkey` FOREIGN KEY (`pid`) REFERENCES `Permission`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;
