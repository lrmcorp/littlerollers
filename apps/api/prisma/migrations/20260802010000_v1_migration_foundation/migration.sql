-- AlterTable
ALTER TABLE `User` ADD COLUMN `historical` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sourceDeletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Branch` ADD COLUMN `historical` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sourceDeletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `ClassType` ADD COLUMN `historical` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sourceDeletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `ClassSlot` ADD COLUMN `historical` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sourceDeletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `AuditLog` ADD COLUMN `historical` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sourceDeletedAt` DATETIME(3) NULL,
    ADD COLUMN `sourceId` VARCHAR(191) NULL,
    ADD COLUMN `sourceSystem` VARCHAR(32) NULL,
    ADD COLUMN `sourceTable` VARCHAR(64) NULL;

-- AlterTable
ALTER TABLE `Package` ADD COLUMN `historical` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sourceDeletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Purchase` ADD COLUMN `historical` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sourceDeletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Voucher` ADD COLUMN `historical` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sourceDeletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `CustomerPackage` ADD COLUMN `historical` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sourceDeletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `historical` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sourceDeletedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `CustomerClassEnrollment` (
    `id` CHAR(36) NOT NULL,
    `customerUserId` CHAR(36) NOT NULL,
    `classTypeId` CHAR(36) NOT NULL,
    `statusCode` VARCHAR(64) NOT NULL,
    `paidAt` DATETIME(3) NULL,
    `sessionCount` INTEGER NOT NULL DEFAULT 0,
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CustomerClassEnrollment_customerUserId_statusCode_idx`(`customerUserId`, `statusCode`),
    INDEX `CustomerClassEnrollment_classTypeId_statusCode_idx`(`classTypeId`, `statusCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MigrationBatch` (
    `id` CHAR(36) NOT NULL,
    `sourceSystem` VARCHAR(32) NOT NULL,
    `sourceSnapshotAt` DATETIME(3) NOT NULL,
    `sourceChecksum` CHAR(64) NOT NULL,
    `storageManifestChecksum` CHAR(64) NULL,
    `mappingVersion` VARCHAR(64) NOT NULL,
    `phase` VARCHAR(64) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'ROLLED_BACK') NOT NULL DEFAULT 'PENDING',
    `delta` BOOLEAN NOT NULL DEFAULT false,
    `parentBatchId` CHAR(36) NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `failureCode` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MigrationBatch_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `MigrationBatch_parentBatchId_createdAt_idx`(`parentBatchId`, `createdAt`),
    UNIQUE INDEX `MigrationBatch_sourceSystem_sourceChecksum_mappingVersion_ph_key`(`sourceSystem`, `sourceChecksum`, `mappingVersion`, `phase`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MigrationSourceKey` (
    `id` CHAR(36) NOT NULL,
    `batchId` CHAR(36) NOT NULL,
    `sourceSystem` VARCHAR(32) NOT NULL,
    `sourceTable` VARCHAR(64) NOT NULL,
    `sourceId` VARCHAR(191) NOT NULL,
    `targetType` VARCHAR(64) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `recordChecksum` CHAR(64) NOT NULL,
    `mappingVersion` VARCHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MigrationSourceKey_targetType_targetId_idx`(`targetType`, `targetId`),
    INDEX `MigrationSourceKey_batchId_sourceTable_idx`(`batchId`, `sourceTable`),
    UNIQUE INDEX `MigrationSourceKey_sourceSystem_sourceTable_sourceId_targetT_key`(`sourceSystem`, `sourceTable`, `sourceId`, `targetType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MigrationReject` (
    `id` CHAR(36) NOT NULL,
    `batchId` CHAR(36) NOT NULL,
    `sourceTable` VARCHAR(64) NOT NULL,
    `sourceId` VARCHAR(191) NOT NULL,
    `reasonCode` VARCHAR(64) NOT NULL,
    `fieldCode` VARCHAR(64) NULL,
    `recordChecksum` CHAR(64) NULL,
    `status` ENUM('OPEN', 'RESOLVED', 'WAIVED') NOT NULL DEFAULT 'OPEN',
    `resolutionId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,

    UNIQUE INDEX `MigrationReject_resolutionId_key`(`resolutionId`),
    INDEX `MigrationReject_status_reasonCode_createdAt_idx`(`status`, `reasonCode`, `createdAt`),
    UNIQUE INDEX `MigrationReject_batchId_sourceTable_sourceId_reasonCode_key`(`batchId`, `sourceTable`, `sourceId`, `reasonCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MigrationControlTotal` (
    `id` CHAR(36) NOT NULL,
    `batchId` CHAR(36) NOT NULL,
    `controlKey` VARCHAR(128) NOT NULL,
    `dimensionHash` CHAR(64) NOT NULL,
    `dimensions` JSON NOT NULL,
    `expectedValue` DECIMAL(30, 0) NOT NULL,
    `actualValue` DECIMAL(30, 0) NULL,
    `status` ENUM('PENDING', 'MATCH', 'MISMATCH') NOT NULL DEFAULT 'PENDING',
    `checkedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MigrationControlTotal_status_controlKey_idx`(`status`, `controlKey`),
    UNIQUE INDEX `MigrationControlTotal_batchId_controlKey_dimensionHash_key`(`batchId`, `controlKey`, `dimensionHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MigrationResolution` (
    `id` CHAR(36) NOT NULL,
    `batchId` CHAR(36) NOT NULL,
    `resolutionKey` VARCHAR(191) NOT NULL,
    `reasonCode` VARCHAR(64) NOT NULL,
    `proposal` JSON NULL,
    `decision` JSON NULL,
    `decisionRequestHash` CHAR(64) NULL,
    `status` ENUM('OPEN', 'APPROVED', 'REJECTED', 'APPLIED') NOT NULL DEFAULT 'OPEN',
    `decidedById` CHAR(36) NULL,
    `decisionReason` VARCHAR(500) NULL,
    `decidedAt` DATETIME(3) NULL,
    `appliedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MigrationResolution_status_reasonCode_createdAt_idx`(`status`, `reasonCode`, `createdAt`),
    UNIQUE INDEX `MigrationResolution_batchId_resolutionKey_key`(`batchId`, `resolutionKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProfile` (
    `userId` CHAR(36) NOT NULL,
    `address` TEXT NULL,
    `genderCode` VARCHAR(32) NULL,
    `countryCode` CHAR(2) NULL,
    `birthDate` DATE NULL,
    `nikEncrypted` TEXT NULL,
    `nikHash` CHAR(64) NULL,
    `barcode` VARCHAR(191) NULL,
    `historicalMetadata` JSON NULL,
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserProfile_nikHash_idx`(`nikHash`),
    INDEX `UserProfile_barcode_idx`(`barcode`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserContactAlias` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `kind` ENUM('PHONE', 'EMAIL') NOT NULL,
    `normalizedHash` CHAR(64) NOT NULL,
    `valueEncrypted` TEXT NOT NULL,
    `canonical` BOOLEAN NOT NULL DEFAULT false,
    `verifiedAt` DATETIME(3) NULL,
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserContactAlias_kind_normalizedHash_idx`(`kind`, `normalizedHash`),
    UNIQUE INDEX `UserContactAlias_userId_kind_normalizedHash_key`(`userId`, `kind`, `normalizedHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Studio` (
    `id` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Studio_branchId_active_idx`(`branchId`, `active`),
    UNIQUE INDEX `Studio_branchId_code_key`(`branchId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` CHAR(36) NOT NULL,
    `studioId` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `capacity` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Room_studioId_active_idx`(`studioId`, `active`),
    UNIQUE INDEX `Room_studioId_code_key`(`studioId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchOpeningHour` (
    `id` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `weekday` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `opensAtMinute` INTEGER NULL,
    `closesAtMinute` INTEGER NULL,
    `closed` BOOLEAN NOT NULL DEFAULT false,
    `effectiveFrom` DATE NOT NULL,
    `effectiveUntil` DATE NULL,
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,

    INDEX `BranchOpeningHour_branchId_effectiveFrom_effectiveUntil_idx`(`branchId`, `effectiveFrom`, `effectiveUntil`),
    UNIQUE INDEX `BranchOpeningHour_branchId_weekday_effectiveFrom_key`(`branchId`, `weekday`, `effectiveFrom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerRecurringSchedule` (
    `id` CHAR(36) NOT NULL,
    `customerUserId` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `classTypeId` CHAR(36) NULL,
    `weekday` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `startMinute` INTEGER NOT NULL,
    `timezone` VARCHAR(64) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CustomerRecurringSchedule_customerUserId_active_idx`(`customerUserId`, `active`),
    INDEX `CustomerRecurringSchedule_branchId_weekday_startMinute_idx`(`branchId`, `weekday`, `startMinute`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingFeedback` (
    `id` CHAR(36) NOT NULL,
    `bookingId` CHAR(36) NOT NULL,
    `customerUserId` CHAR(36) NOT NULL,
    `rating` INTEGER NULL,
    `feedback` TEXT NULL,
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,
    `submittedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BookingFeedback_bookingId_key`(`bookingId`),
    INDEX `BookingFeedback_customerUserId_submittedAt_idx`(`customerUserId`, `submittedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountingAccount` (
    `id` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NULL,
    `parentId` CHAR(36) NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `accountType` VARCHAR(64) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AccountingAccount_parentId_idx`(`parentId`),
    UNIQUE INDEX `AccountingAccount_branchId_code_key`(`branchId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JournalEntry` (
    `id` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NULL,
    `accountId` CHAR(36) NOT NULL,
    `purchaseId` CHAR(36) NULL,
    `actorUserId` CHAR(36) NULL,
    `referenceNumber` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `debitRp` INTEGER NOT NULL DEFAULT 0,
    `creditRp` INTEGER NOT NULL DEFAULT 0,
    `occurredAt` DATETIME(3) NOT NULL,
    `statusCode` VARCHAR(64) NOT NULL,
    `attachmentKey` VARCHAR(512) NULL,
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JournalEntry_branchId_occurredAt_idx`(`branchId`, `occurredAt`),
    INDEX `JournalEntry_accountId_occurredAt_idx`(`accountId`, `occurredAt`),
    INDEX `JournalEntry_purchaseId_idx`(`purchaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` CHAR(36) NOT NULL,
    `ownerUserId` CHAR(36) NULL,
    `branchId` CHAR(36) NULL,
    `entityType` VARCHAR(64) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `purposeCode` VARCHAR(64) NOT NULL,
    `objectKey` VARCHAR(512) NOT NULL,
    `checksum` CHAR(64) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `scanStatus` ENUM('PENDING', 'CLEAN', 'REJECTED', 'INFECTED', 'ERROR') NOT NULL DEFAULT 'PENDING',
    `visibility` ENUM('PRIVATE', 'AUTHORIZED', 'PUBLIC') NOT NULL DEFAULT 'AUTHORIZED',
    `historical` BOOLEAN NOT NULL DEFAULT false,
    `sourceDeletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MediaAsset_objectKey_key`(`objectKey`),
    INDEX `MediaAsset_entityType_entityId_purposeCode_idx`(`entityType`, `entityId`, `purposeCode`),
    INDEX `MediaAsset_checksum_idx`(`checksum`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `AuditLog_sourceSystem_sourceTable_sourceId_idx` ON `AuditLog`(`sourceSystem`, `sourceTable`, `sourceId`);

-- AddForeignKey
ALTER TABLE `CustomerClassEnrollment` ADD CONSTRAINT `CustomerClassEnrollment_customerUserId_fkey` FOREIGN KEY (`customerUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerClassEnrollment` ADD CONSTRAINT `CustomerClassEnrollment_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MigrationBatch` ADD CONSTRAINT `MigrationBatch_parentBatchId_fkey` FOREIGN KEY (`parentBatchId`) REFERENCES `MigrationBatch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MigrationSourceKey` ADD CONSTRAINT `MigrationSourceKey_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `MigrationBatch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MigrationReject` ADD CONSTRAINT `MigrationReject_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `MigrationBatch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MigrationReject` ADD CONSTRAINT `MigrationReject_resolutionId_fkey` FOREIGN KEY (`resolutionId`) REFERENCES `MigrationResolution`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MigrationControlTotal` ADD CONSTRAINT `MigrationControlTotal_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `MigrationBatch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MigrationResolution` ADD CONSTRAINT `MigrationResolution_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `MigrationBatch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserContactAlias` ADD CONSTRAINT `UserContactAlias_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Studio` ADD CONSTRAINT `Studio_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_studioId_fkey` FOREIGN KEY (`studioId`) REFERENCES `Studio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchOpeningHour` ADD CONSTRAINT `BranchOpeningHour_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerRecurringSchedule` ADD CONSTRAINT `CustomerRecurringSchedule_customerUserId_fkey` FOREIGN KEY (`customerUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerRecurringSchedule` ADD CONSTRAINT `CustomerRecurringSchedule_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerRecurringSchedule` ADD CONSTRAINT `CustomerRecurringSchedule_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingFeedback` ADD CONSTRAINT `BookingFeedback_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingFeedback` ADD CONSTRAINT `BookingFeedback_customerUserId_fkey` FOREIGN KEY (`customerUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountingAccount` ADD CONSTRAINT `AccountingAccount_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountingAccount` ADD CONSTRAINT `AccountingAccount_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `AccountingAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JournalEntry` ADD CONSTRAINT `JournalEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JournalEntry` ADD CONSTRAINT `JournalEntry_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `AccountingAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JournalEntry` ADD CONSTRAINT `JournalEntry_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JournalEntry` ADD CONSTRAINT `JournalEntry_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_ownerUserId_fkey` FOREIGN KEY (`ownerUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
