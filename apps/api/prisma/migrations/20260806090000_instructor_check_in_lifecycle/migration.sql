CREATE TABLE `InstructorCheckInToken` (
  `id` CHAR(36) NOT NULL,
  `classSlotId` CHAR(36) NOT NULL,
  `instructorUserId` CHAR(36) NOT NULL,
  `issuedById` CHAR(36) NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `activeClassSlotKey` CHAR(36) NULL,
  `idempotencyKeyHash` VARCHAR(191) NOT NULL,
  `requestHash` VARCHAR(191) NOT NULL,
  `notBeforeAt` DATETIME(3) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `status` ENUM('ACTIVE', 'USED', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
  `usedAt` DATETIME(3) NULL,
  `revokedAt` DATETIME(3) NULL,
  `version` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `InstructorCheckInToken_tokenHash_key` (`tokenHash`),
  UNIQUE INDEX `InstructorCheckInToken_activeClassSlotKey_key` (`activeClassSlotKey`),
  UNIQUE INDEX `InstructorCheckInToken_instructorUserId_idempotencyKeyHash_key` (`instructorUserId`, `idempotencyKeyHash`),
  INDEX `InstructorCheckInToken_classSlotId_status_expiresAt_idx` (`classSlotId`, `status`, `expiresAt`),
  INDEX `InstructorCheckInToken_expiresAt_status_idx` (`expiresAt`, `status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `InstructorAttendance` (
  `id` CHAR(36) NOT NULL,
  `classSlotId` CHAR(36) NOT NULL,
  `instructorUserId` CHAR(36) NOT NULL,
  `tokenId` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NOT NULL,
  `checkedInAt` DATETIME(3) NOT NULL,
  `auditLogId` CHAR(36) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `InstructorAttendance_classSlotId_key` (`classSlotId`),
  UNIQUE INDEX `InstructorAttendance_tokenId_key` (`tokenId`),
  INDEX `InstructorAttendance_instructorUserId_checkedInAt_idx` (`instructorUserId`, `checkedInAt`),
  INDEX `InstructorAttendance_branchId_checkedInAt_idx` (`branchId`, `checkedInAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `InstructorCheckInToken`
  ADD CONSTRAINT `InstructorCheckInToken_classSlotId_fkey` FOREIGN KEY (`classSlotId`) REFERENCES `ClassSlot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `InstructorCheckInToken_instructorUserId_fkey` FOREIGN KEY (`instructorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `InstructorCheckInToken_issuedById_fkey` FOREIGN KEY (`issuedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `InstructorAttendance`
  ADD CONSTRAINT `InstructorAttendance_classSlotId_fkey` FOREIGN KEY (`classSlotId`) REFERENCES `ClassSlot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `InstructorAttendance_instructorUserId_fkey` FOREIGN KEY (`instructorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `InstructorAttendance_tokenId_fkey` FOREIGN KEY (`tokenId`) REFERENCES `InstructorCheckInToken`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `InstructorAttendance_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
