-- Mapping 2.0.0: preserve v1 business semantics before Rehearsal 1.

ALTER TABLE `Identity` MODIFY `verifiedAt` DATETIME(3) NULL;
ALTER TABLE `PasswordCredential` MODIFY `verifiedAt` DATETIME(3) NULL;

ALTER TABLE `BranchPublicProfile`
  ADD COLUMN `operationalEmail` VARCHAR(191) NULL,
  ADD COLUMN `mapUrl` VARCHAR(1024) NULL;

ALTER TABLE `Studio`
  ADD COLUMN `equipmentText` TEXT NULL,
  ADD COLUMN `contactPhoneE164` VARCHAR(32) NULL;

ALTER TABLE `ClassType`
  DROP INDEX `ClassType_branchId_code_key`,
  MODIFY `branchId` CHAR(36) NULL,
  ADD COLUMN `description` TEXT NULL,
  ADD COLUMN `modality` ENUM('GROUP','PRIVATE','HYBRID','UNKNOWN_LEGACY') NOT NULL DEFAULT 'UNKNOWN_LEGACY',
  ADD COLUMN `equipment` JSON NULL,
  ADD COLUMN `defaultDurationMinutes` INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN `defaultMinimumQuota` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `defaultCapacity` INTEGER NOT NULL DEFAULT 1;

-- Existing non-production fixtures may contain branch-cloned codes. Preserve them
-- with an explicit legacy suffix; migration targets start empty and are unaffected.
UPDATE `ClassType` AS `ct`
JOIN (
  SELECT `code` FROM `ClassType` GROUP BY `code` HAVING COUNT(*) > 1
) AS `duplicateCode` ON `duplicateCode`.`code` = `ct`.`code`
SET `ct`.`code` = CONCAT(LEFT(`ct`.`code`, 150), '-legacy-', LEFT(`ct`.`id`, 8));
CREATE UNIQUE INDEX `ClassType_code_key` ON `ClassType`(`code`);

CREATE TABLE `ClassTypeBranchScope` (
  `id` CHAR(36) NOT NULL,
  `classTypeId` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `historical` BOOLEAN NOT NULL DEFAULT false,
  `sourceDeletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ClassTypeBranchScope_classTypeId_branchId_key` (`classTypeId`, `branchId`),
  INDEX `ClassTypeBranchScope_branchId_active_idx` (`branchId`, `active`),
  CONSTRAINT `ClassTypeBranchScope_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ClassTypeBranchScope_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ClassTypeBranchConfiguration` (
  `id` CHAR(36) NOT NULL,
  `classTypeId` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NOT NULL,
  `minimumQuota` INTEGER NULL,
  `capacity` INTEGER NULL,
  `honorRp` INTEGER NULL,
  `feeRp` INTEGER NULL,
  `effectiveFrom` DATE NOT NULL,
  `effectiveUntil` DATE NULL,
  `historical` BOOLEAN NOT NULL DEFAULT false,
  `sourceDeletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `CTBranchConfig_type_branch_from_key` (`classTypeId`, `branchId`, `effectiveFrom`),
  INDEX `CTBranchConfig_branch_from_until_idx` (`branchId`, `effectiveFrom`, `effectiveUntil`),
  CONSTRAINT `ClassTypeBranchConfiguration_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ClassTypeBranchConfiguration_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `ClassTypeBranchScope` (`id`,`classTypeId`,`branchId`,`active`,`historical`,`createdAt`,`updatedAt`)
SELECT UUID(), `id`, `branchId`, `active`, `historical`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `ClassType` WHERE `branchId` IS NOT NULL;

ALTER TABLE `ClassSlot`
  ADD COLUMN `studioId` CHAR(36) NULL,
  ADD COLUMN `roomId` CHAR(36) NULL;

INSERT INTO `Studio` (`id`,`branchId`,`code`,`name`,`active`,`historical`,`createdAt`,`updatedAt`)
SELECT UUID(), `b`.`id`, 'migration-default', 'Area Studio Migrasi', true, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `Branch` AS `b`
WHERE NOT EXISTS (SELECT 1 FROM `Studio` AS `s` WHERE `s`.`branchId` = `b`.`id`);

UPDATE `ClassSlot` AS `slot`
SET `slot`.`studioId` = (
  SELECT `s`.`id` FROM `Studio` AS `s`
  WHERE `s`.`branchId` = `slot`.`branchId`
  ORDER BY `s`.`active` DESC, `s`.`createdAt` ASC, `s`.`id` ASC LIMIT 1
);

ALTER TABLE `ClassSlot`
  MODIFY `studioId` CHAR(36) NOT NULL,
  ADD INDEX `ClassSlot_studioId_startAt_id_idx` (`studioId`, `startAt`, `id`),
  ADD INDEX `ClassSlot_roomId_startAt_id_idx` (`roomId`, `startAt`, `id`),
  ADD CONSTRAINT `ClassSlot_studioId_fkey` FOREIGN KEY (`studioId`) REFERENCES `Studio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `ClassSlot_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `PackageRevision` (
  `id` CHAR(36) NOT NULL,
  `packageId` CHAR(36) NOT NULL,
  `revisionNumber` INTEGER NOT NULL,
  `sessionCount` INTEGER NOT NULL,
  `durationDays` INTEGER NOT NULL,
  `priceRp` INTEGER NOT NULL,
  `promoteCode` VARCHAR(64) NULL,
  `discountRp` INTEGER NULL,
  `manyTimesAllowed` BOOLEAN NOT NULL DEFAULT false,
  `visible` BOOLEAN NOT NULL DEFAULT true,
  `effectiveFrom` DATE NOT NULL,
  `effectiveUntil` DATE NULL,
  `historical` BOOLEAN NOT NULL DEFAULT false,
  `sourceDeletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `PackageRevision_packageId_revisionNumber_key` (`packageId`, `revisionNumber`),
  INDEX `PackageRevision_packageId_effectiveFrom_effectiveUntil_idx` (`packageId`, `effectiveFrom`, `effectiveUntil`),
  CONSTRAINT `PackageRevision_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PackageBranchScope` (
  `id` CHAR(36) NOT NULL,
  `packageId` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `historical` BOOLEAN NOT NULL DEFAULT false,
  `sourceDeletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `PackageBranchScope_packageId_branchId_key` (`packageId`, `branchId`),
  INDEX `PackageBranchScope_branchId_active_idx` (`branchId`, `active`),
  CONSTRAINT `PackageBranchScope_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PackageBranchScope_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PackageClassTypeScope` (
  `id` CHAR(36) NOT NULL,
  `packageId` CHAR(36) NOT NULL,
  `classTypeId` CHAR(36) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `historical` BOOLEAN NOT NULL DEFAULT false,
  `sourceDeletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `PackageClassTypeScope_packageId_classTypeId_key` (`packageId`, `classTypeId`),
  INDEX `PackageClassTypeScope_classTypeId_active_idx` (`classTypeId`, `active`),
  CONSTRAINT `PackageClassTypeScope_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PackageClassTypeScope_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `PackageRevision` (`id`,`packageId`,`revisionNumber`,`sessionCount`,`durationDays`,`priceRp`,`visible`,`effectiveFrom`,`effectiveUntil`,`historical`,`sourceDeletedAt`,`createdAt`,`updatedAt`)
SELECT UUID(), `id`, 1, `sessionCount`, `durationDays`, `priceRp`, true, `effectiveFrom`, `effectiveUntil`, `historical`, `sourceDeletedAt`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `Package`;

INSERT INTO `PackageBranchScope` (`id`,`packageId`,`branchId`,`active`,`historical`,`sourceDeletedAt`,`createdAt`,`updatedAt`)
SELECT UUID(), `id`, `branchId`, (`status` = 'ACTIVE'), `historical`, `sourceDeletedAt`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `Package` WHERE `branchId` IS NOT NULL;

INSERT INTO `PackageClassTypeScope` (`id`,`packageId`,`classTypeId`,`active`,`historical`,`sourceDeletedAt`,`createdAt`,`updatedAt`)
SELECT UUID(), `id`, `classTypeId`, (`status` = 'ACTIVE'), `historical`, `sourceDeletedAt`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `Package` WHERE `classTypeId` IS NOT NULL;

ALTER TABLE `Purchase`
  ADD COLUMN `catalogAmountRpSnapshot` INTEGER NULL,
  ADD COLUMN `discountAmountRpSnapshot` INTEGER NULL,
  ADD COLUMN `finalAmountBeforeUniqueCodeRpSnapshot` INTEGER NULL,
  ADD COLUMN `amountPaidRpSnapshot` INTEGER NULL,
  ADD COLUMN `paymentMethodCode` VARCHAR(64) NULL,
  ADD COLUMN `sourceStatusCode` VARCHAR(64) NULL,
  ADD COLUMN `sourceActiveFlag` BOOLEAN NULL,
  ADD COLUMN `snapshotCompleteness` ENUM('COMPLETE_BREAKDOWN','LEGACY_FINAL_AMOUNT_ONLY') NOT NULL DEFAULT 'COMPLETE_BREAKDOWN';

ALTER TABLE `Voucher`
  ADD COLUMN `legacyEntitlementDurationDays` INTEGER NULL;

ALTER TABLE `VoucherRedemption`
  ADD COLUMN `snapshotCompleteness` ENUM('COMPLETE_BREAKDOWN','LEGACY_FINAL_AMOUNT_ONLY') NOT NULL DEFAULT 'COMPLETE_BREAKDOWN';

CREATE TABLE `BookingAttendanceOutcome` (
  `id` CHAR(36) NOT NULL,
  `bookingId` CHAR(36) NOT NULL,
  `outcome` ENUM('ATTENDED','EXCUSED','NO_SHOW','UNKNOWN_HISTORICAL') NOT NULL,
  `sourceStatusCode` VARCHAR(64) NULL,
  `note` TEXT NULL,
  `occurredAt` DATETIME(3) NULL,
  `historical` BOOLEAN NOT NULL DEFAULT false,
  `sourceDeletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `BookingAttendanceOutcome_bookingId_key` (`bookingId`),
  INDEX `BookingAttendanceOutcome_outcome_occurredAt_idx` (`outcome`, `occurredAt`),
  CONSTRAINT `BookingAttendanceOutcome_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CustomerRecurringSchedule`
  MODIFY `branchId` CHAR(36) NULL,
  ADD COLUMN `note` TEXT NULL;

CREATE TABLE `LegacyFinancialEntry` (
  `id` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NULL,
  `purchaseId` CHAR(36) NULL,
  `actorUserId` CHAR(36) NULL,
  `parentId` CHAR(36) NULL,
  `type` ENUM('INCOME','EXPENSE') NOT NULL,
  `amountRp` INTEGER NOT NULL,
  `occurredAt` DATETIME(3) NOT NULL,
  `description` TEXT NULL,
  `sourceTypeCode` VARCHAR(64) NOT NULL,
  `historical` BOOLEAN NOT NULL DEFAULT false,
  `sourceDeletedAt` DATETIME(3) NULL,
  `sourceMetadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `LegacyFinancialEntry_branchId_occurredAt_idx` (`branchId`, `occurredAt`),
  INDEX `LegacyFinancialEntry_purchaseId_idx` (`purchaseId`),
  INDEX `LegacyFinancialEntry_parentId_idx` (`parentId`),
  INDEX `LegacyFinancialEntry_type_occurredAt_idx` (`type`, `occurredAt`),
  CONSTRAINT `LegacyFinancialEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `LegacyFinancialEntry_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `LegacyFinancialEntry_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `LegacyFinancialEntry_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `LegacyFinancialEntry`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MigrationLegacyPayload` (
  `id` CHAR(36) NOT NULL,
  `kind` ENUM('ACTIVITY_LOG','NOTIFICATION') NOT NULL,
  `auditLogId` CHAR(36) NULL,
  `userNotificationId` CHAR(36) NULL,
  `payloadEncrypted` LONGTEXT NOT NULL,
  `payloadChecksum` CHAR(64) NOT NULL,
  `encryptionVersion` VARCHAR(32) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `MigrationLegacyPayload_auditLogId_key` (`auditLogId`),
  UNIQUE INDEX `MigrationLegacyPayload_userNotificationId_key` (`userNotificationId`),
  INDEX `MigrationLegacyPayload_kind_createdAt_idx` (`kind`, `createdAt`),
  CONSTRAINT `MigrationLegacyPayload_auditLogId_fkey` FOREIGN KEY (`auditLogId`) REFERENCES `AuditLog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MigrationLegacyPayload_userNotificationId_fkey` FOREIGN KEY (`userNotificationId`) REFERENCES `UserNotification`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
