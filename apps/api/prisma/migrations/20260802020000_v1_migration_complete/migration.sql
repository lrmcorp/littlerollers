-- Preserve legacy business status without changing v2 operational enums.
ALTER TABLE `ClassType` ADD COLUMN `sourceMetadata` JSON NULL;
ALTER TABLE `ClassSlot` ADD COLUMN `sourceMetadata` JSON NULL;
ALTER TABLE `Package` ADD COLUMN `sourceMetadata` JSON NULL;
ALTER TABLE `Purchase` ADD COLUMN `sourceMetadata` JSON NULL;
ALTER TABLE `Voucher` ADD COLUMN `sourceMetadata` JSON NULL;
ALTER TABLE `CustomerPackage` ADD COLUMN `sourceBalance` INTEGER NULL;
ALTER TABLE `Booking` ADD COLUMN `sourceMetadata` JSON NULL;

-- Historical attendance is first-class but has no fabricated QR token.
ALTER TABLE `CustomerAttendance`
  MODIFY `tokenId` CHAR(36) NULL,
  MODIFY `source` ENUM('QR', 'MIGRATION') NOT NULL DEFAULT 'QR';

-- Journal hierarchy and safe legacy metadata.
ALTER TABLE `JournalEntry`
  ADD COLUMN `parentId` CHAR(36) NULL,
  ADD COLUMN `sourceMetadata` JSON NULL;
CREATE INDEX `JournalEntry_parentId_idx` ON `JournalEntry`(`parentId`);
ALTER TABLE `JournalEntry`
  ADD CONSTRAINT `JournalEntry_parentId_fkey`
  FOREIGN KEY (`parentId`) REFERENCES `JournalEntry`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Duplicate v1 voucher codes retain their original code as an auditable alias.
CREATE TABLE `VoucherCodeAlias` (
  `id` CHAR(36) NOT NULL,
  `voucherId` CHAR(36) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `canonical` BOOLEAN NOT NULL DEFAULT false,
  `historical` BOOLEAN NOT NULL DEFAULT true,
  `sourceDeletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `VoucherCodeAlias_voucherId_code_key`(`voucherId`, `code`),
  INDEX `VoucherCodeAlias_code_idx`(`code`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `VoucherCodeAlias`
  ADD CONSTRAINT `VoucherCodeAlias_voucherId_fkey`
  FOREIGN KEY (`voucherId`) REFERENCES `Voucher`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- v1 voucher_customers contains both unused allocations and actual redemptions.
CREATE TABLE `CustomerVoucherEntitlement` (
  `id` CHAR(36) NOT NULL,
  `voucherId` CHAR(36) NOT NULL,
  `customerUserId` CHAR(36) NOT NULL,
  `purchaseId` CHAR(36) NULL,
  `sourceStatusCode` VARCHAR(64) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `expiresAt` DATETIME(3) NULL,
  `usedAt` DATETIME(3) NULL,
  `historical` BOOLEAN NOT NULL DEFAULT false,
  `sourceDeletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `CustomerVoucherEntitlement_customerUserId_active_expiresAt_idx`(`customerUserId`, `active`, `expiresAt`),
  INDEX `CustomerVoucherEntitlement_voucherId_active_expiresAt_idx`(`voucherId`, `active`, `expiresAt`),
  INDEX `CustomerVoucherEntitlement_purchaseId_idx`(`purchaseId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CustomerVoucherEntitlement`
  ADD CONSTRAINT `CustomerVoucherEntitlement_voucherId_fkey`
  FOREIGN KEY (`voucherId`) REFERENCES `Voucher`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `CustomerVoucherEntitlement_customerUserId_fkey`
  FOREIGN KEY (`customerUserId`) REFERENCES `User`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `CustomerVoucherEntitlement_purchaseId_fkey`
  FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
