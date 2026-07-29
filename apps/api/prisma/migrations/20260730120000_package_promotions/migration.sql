CREATE TABLE `PackagePromotion` (
  `id` CHAR(36) NOT NULL,
  `packageId` CHAR(36) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `label` VARCHAR(80) NOT NULL,
  `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `discountType` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
  `discountValue` INTEGER NOT NULL,
  `activeFrom` DATETIME(3) NOT NULL,
  `activeUntil` DATETIME(3) NOT NULL,
  `version` INTEGER NOT NULL DEFAULT 0,
  `createdById` CHAR(36) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `PackagePromotion_packageId_status_activeFrom_activeUntil_idx` (`packageId`, `status`, `activeFrom`, `activeUntil`),
  INDEX `PackagePromotion_status_activeFrom_activeUntil_idx` (`status`, `activeFrom`, `activeUntil`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Purchase`
  ADD COLUMN `packagePromotionId` CHAR(36) NULL,
  ADD COLUMN `packagePromotionNameSnapshot` VARCHAR(160) NULL,
  ADD COLUMN `packagePromotionDiscountTypeSnapshot` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NULL,
  ADD COLUMN `packagePromotionDiscountValueSnapshot` INTEGER NULL,
  ADD COLUMN `packagePromotionDiscountRpSnapshot` INTEGER NULL,
  ADD COLUMN `promotionalPriceRpSnapshot` INTEGER NULL;

CREATE INDEX `Purchase_packagePromotionId_submittedAt_idx`
  ON `Purchase`(`packagePromotionId`, `submittedAt`);

ALTER TABLE `PackagePromotion`
  ADD CONSTRAINT `PackagePromotion_packageId_fkey`
    FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `PackagePromotion_createdById_fkey`
    FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Purchase`
  ADD CONSTRAINT `Purchase_packagePromotionId_fkey`
    FOREIGN KEY (`packagePromotionId`) REFERENCES `PackagePromotion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
