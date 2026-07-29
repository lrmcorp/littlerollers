ALTER TABLE `Purchase`
  ADD COLUMN `voucherId` CHAR(36) NULL,
  ADD COLUMN `voucherCodeSnapshot` VARCHAR(64) NULL,
  ADD COLUMN `voucherDiscountTypeSnapshot` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NULL,
  ADD COLUMN `voucherDiscountValueSnapshot` INT NULL,
  ADD COLUMN `voucherDiscountRpSnapshot` INT NULL,
  ADD COLUMN `priceAfterDiscountRpSnapshot` INT NULL;

CREATE TABLE `Voucher` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'EXHAUSTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `discountType` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
  `discountValue` INT NOT NULL,
  `maxDiscountRp` INT NULL,
  `minimumPurchaseRp` INT NOT NULL DEFAULT 0,
  `activeFrom` DATETIME(3) NOT NULL,
  `activeUntil` DATETIME(3) NULL,
  `totalUsageLimit` INT NULL,
  `perCustomerUsageLimit` INT NULL,
  `branchId` CHAR(36) NULL,
  `classTypeId` CHAR(36) NULL,
  `version` INT NOT NULL DEFAULT 0,
  `createdById` CHAR(36) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Voucher_code_key` (`code`),
  INDEX `Voucher_status_activeFrom_activeUntil_idx` (`status`, `activeFrom`, `activeUntil`),
  INDEX `Voucher_branchId_status_idx` (`branchId`, `status`),
  INDEX `Voucher_classTypeId_status_idx` (`classTypeId`, `status`),
  CONSTRAINT `Voucher_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Voucher_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Voucher_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `VoucherPackageScope` (
  `id` CHAR(36) NOT NULL,
  `voucherId` CHAR(36) NOT NULL,
  `packageId` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `VoucherPackageScope_voucherId_packageId_key` (`voucherId`, `packageId`),
  INDEX `VoucherPackageScope_packageId_idx` (`packageId`),
  CONSTRAINT `VoucherPackageScope_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `Voucher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `VoucherPackageScope_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `VoucherRedemption` (
  `id` CHAR(36) NOT NULL,
  `voucherId` CHAR(36) NOT NULL,
  `purchaseId` CHAR(36) NOT NULL,
  `customerUserId` CHAR(36) NOT NULL,
  `discountRp` INT NOT NULL,
  `redeemedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `releasedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `VoucherRedemption_purchaseId_key` (`purchaseId`),
  UNIQUE INDEX `VoucherRedemption_voucherId_customerUserId_purchaseId_key` (`voucherId`, `customerUserId`, `purchaseId`),
  INDEX `VoucherRedemption_voucherId_redeemedAt_idx` (`voucherId`, `redeemedAt`),
  INDEX `VoucherRedemption_customerUserId_voucherId_redeemedAt_idx` (`customerUserId`, `voucherId`, `redeemedAt`),
  CONSTRAINT `VoucherRedemption_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `Voucher` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `VoucherRedemption_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `VoucherRedemption_customerUserId_fkey` FOREIGN KEY (`customerUserId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Purchase`
  ADD INDEX `Purchase_voucherId_idx` (`voucherId`),
  ADD CONSTRAINT `Purchase_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `Voucher` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
