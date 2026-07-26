ALTER TABLE `Purchase`
  MODIFY COLUMN `status` ENUM('AWAITING_PAYMENT', 'PENDING', 'ACTION_REQUIRED', 'APPROVED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
  MODIFY COLUMN `paymentProofId` CHAR(36) NULL,
  ADD COLUMN `paymentAccountId` CHAR(36) NULL,
  ADD COLUMN `paymentBankNameSnapshot` VARCHAR(191) NULL,
  ADD COLUMN `paymentAccountNumberSnapshotEncrypted` TEXT NULL,
  ADD COLUMN `paymentAccountLast4Snapshot` VARCHAR(4) NULL,
  ADD COLUMN `paymentAccountHolderSnapshot` VARCHAR(191) NULL,
  ADD COLUMN `paymentExpiresAt` DATETIME(3) NULL,
  ADD COLUMN `continuationClassSlotId` CHAR(36) NULL;

CREATE TABLE `PaymentAccount` (
  `id` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NOT NULL,
  `activeBranchKey` CHAR(36) NULL,
  `bankCode` VARCHAR(191) NOT NULL,
  `bankName` VARCHAR(191) NOT NULL,
  `accountNumberEncrypted` TEXT NOT NULL,
  `accountNumberLast4` VARCHAR(4) NOT NULL,
  `accountHolderName` VARCHAR(191) NOT NULL,
  `paymentWindowHours` INTEGER NOT NULL DEFAULT 24,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `version` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `PaymentAccount_activeBranchKey_key` (`activeBranchKey`),
  INDEX `PaymentAccount_branchId_active_idx` (`branchId`, `active`),
  CONSTRAINT `PaymentAccount_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `Purchase_paymentAccountId_status_paymentExpiresAt_idx` ON `Purchase`(`paymentAccountId`, `status`, `paymentExpiresAt`);
ALTER TABLE `Purchase`
  ADD CONSTRAINT `Purchase_paymentAccountId_fkey` FOREIGN KEY (`paymentAccountId`) REFERENCES `PaymentAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `Purchase_continuationClassSlotId_fkey` FOREIGN KEY (`continuationClassSlotId`) REFERENCES `ClassSlot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
