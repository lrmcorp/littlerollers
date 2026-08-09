ALTER TABLE `OtherCost`
  ADD COLUMN `categoryCode` VARCHAR(64) NULL,
  ADD COLUMN `occurredOn` DATE NULL,
  ADD COLUMN `reason` VARCHAR(500) NULL;

UPDATE `OtherCost`
SET
  `categoryCode` = 'LEGACY_UNCLASSIFIED',
  `occurredOn` = DATE(`createdAt`),
  `reason` = `description`
WHERE `categoryCode` IS NULL OR `occurredOn` IS NULL OR `reason` IS NULL;

ALTER TABLE `OtherCost`
  MODIFY `categoryCode` VARCHAR(64) NOT NULL DEFAULT 'LEGACY_UNCLASSIFIED',
  MODIFY `occurredOn` DATE NOT NULL,
  MODIFY `reason` VARCHAR(500) NOT NULL,
  ADD INDEX `OtherCost_branchId_occurredOn_status_idx` (`branchId`, `occurredOn`, `status`);

CREATE TABLE `InstructorHourLog` (
  `id` CHAR(36) NOT NULL,
  `classSlotId` CHAR(36) NOT NULL,
  `instructorUserId` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NOT NULL,
  `classTypeId` CHAR(36) NOT NULL,
  `effectiveConfigurationId` CHAR(36) NOT NULL,
  `matchedUnits` INTEGER NOT NULL DEFAULT 1,
  `feeRpSnapshot` INTEGER NOT NULL,
  `amountRp` INTEGER NOT NULL,
  `period` CHAR(7) NOT NULL,
  `occurredAt` DATETIME(3) NOT NULL,
  `historical` BOOLEAN NOT NULL DEFAULT false,
  `sourceDeletedAt` DATETIME(3) NULL,
  `sourceMetadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `InstructorHourLog_classSlotId_key` (`classSlotId`),
  INDEX `InstructorHourLog_branchId_period_occurredAt_idx` (`branchId`, `period`, `occurredAt`),
  INDEX `InstructorHourLog_instructorUserId_occurredAt_idx` (`instructorUserId`, `occurredAt`),
  INDEX `InstructorHourLog_classTypeId_occurredAt_idx` (`classTypeId`, `occurredAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `InstructorHourLog_classSlotId_fkey` FOREIGN KEY (`classSlotId`) REFERENCES `ClassSlot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `InstructorHourLog_instructorUserId_fkey` FOREIGN KEY (`instructorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `InstructorHourLog_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `InstructorHourLog_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `InstructorHourLog_effectiveConfigurationId_fkey` FOREIGN KEY (`effectiveConfigurationId`) REFERENCES `EffectiveConfiguration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FinanceCloseSnapshot` (
  `id` CHAR(36) NOT NULL,
  `financePeriodId` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NOT NULL,
  `period` CHAR(7) NOT NULL,
  `grossSalesRp` INTEGER NOT NULL,
  `packagePromotionDiscountRp` INTEGER NOT NULL,
  `voucherDiscountRp` INTEGER NOT NULL,
  `revenueRp` INTEGER NOT NULL,
  `projectionRp` INTEGER NOT NULL,
  `instructorRealtimeRp` INTEGER NOT NULL,
  `otherCostRp` INTEGER NOT NULL,
  `correctionRp` INTEGER NOT NULL,
  `profitRp` INTEGER NOT NULL,
  `sourceCutoffAt` DATETIME(3) NOT NULL,
  `sourceVersion` VARCHAR(64) NOT NULL,
  `controlHash` CHAR(64) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `FinanceCloseSnapshot_financePeriodId_key` (`financePeriodId`),
  UNIQUE INDEX `FinanceCloseSnapshot_branchId_period_key` (`branchId`, `period`),
  INDEX `FinanceCloseSnapshot_sourceCutoffAt_idx` (`sourceCutoffAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `FinanceCloseSnapshot_financePeriodId_fkey` FOREIGN KEY (`financePeriodId`) REFERENCES `FinancePeriod`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FinanceCloseSnapshot_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `FinanceCorrection`
  ADD COLUMN `postingJournalId` CHAR(36) NULL,
  ADD UNIQUE INDEX `FinanceCorrection_postingJournalId_key`(`postingJournalId`),
  ADD CONSTRAINT `FinanceCorrection_postingJournalId_fkey`
    FOREIGN KEY (`postingJournalId`) REFERENCES `JournalEntry`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
