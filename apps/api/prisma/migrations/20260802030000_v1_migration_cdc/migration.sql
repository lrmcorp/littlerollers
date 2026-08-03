CREATE TABLE `MigrationDeltaEvent` (
  `id` CHAR(36) NOT NULL,
  `batchId` CHAR(36) NULL,
  `eventKey` VARCHAR(191) NOT NULL,
  `sourceSystem` VARCHAR(32) NOT NULL,
  `sourceTable` VARCHAR(64) NOT NULL,
  `sourceId` VARCHAR(191) NOT NULL,
  `operation` ENUM('INSERT', 'UPDATE', 'SOFT_DELETE', 'DELETE') NOT NULL,
  `gtid` VARCHAR(191) NOT NULL,
  `transactionOrder` BIGINT NOT NULL,
  `eventOrder` INTEGER NOT NULL,
  `binlogFile` VARCHAR(191) NULL,
  `binlogPosition` BIGINT NULL,
  `sourceBranchId` VARCHAR(191) NULL,
  `branchId` CHAR(36) NULL,
  `beforeChecksum` CHAR(64) NULL,
  `afterChecksum` CHAR(64) NULL,
  `payloadCiphertext` LONGTEXT NOT NULL,
  `payloadIv` VARCHAR(32) NOT NULL,
  `payloadAuthTag` VARCHAR(32) NOT NULL,
  `payloadKeyVersion` VARCHAR(32) NOT NULL,
  `status` ENUM('CAPTURED', 'VERIFIED', 'APPLIED', 'BLOCKED', 'FAILED') NOT NULL DEFAULT 'CAPTURED',
  `correlationId` VARCHAR(191) NOT NULL,
  `sourceOccurredAt` DATETIME(3) NOT NULL,
  `capturedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `verifiedAt` DATETIME(3) NULL,
  `appliedAt` DATETIME(3) NULL,
  `failureCode` VARCHAR(64) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `MigrationDeltaEvent_eventKey_key`(`eventKey`),
  UNIQUE INDEX `MigrationDeltaEvent_sourceSystem_gtid_eventOrder_key`(`sourceSystem`, `gtid`, `eventOrder`),
  INDEX `MigrationDeltaEvent_status_transactionOrder_eventOrder_idx`(`status`, `transactionOrder`, `eventOrder`),
  INDEX `MigrationDeltaEvent_sourceTable_sourceId_transactionOrder_idx`(`sourceTable`, `sourceId`, `transactionOrder`),
  INDEX `MigrationDeltaEvent_branchId_status_transactionOrder_idx`(`branchId`, `status`, `transactionOrder`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MigrationGtidCheckpoint` (
  `id` CHAR(36) NOT NULL,
  `sourceSystem` VARCHAR(32) NOT NULL,
  `kind` ENUM('CAPTURE', 'VERIFY', 'APPLY', 'DRAIN') NOT NULL,
  `gtidSet` LONGTEXT NOT NULL,
  `lastGtid` VARCHAR(191) NULL,
  `transactionOrder` BIGINT NOT NULL DEFAULT 0,
  `binlogFile` VARCHAR(191) NULL,
  `binlogPosition` BIGINT NULL,
  `capturedThroughAt` DATETIME(3) NULL,
  `updatedBy` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `MigrationGtidCheckpoint_sourceSystem_kind_key`(`sourceSystem`, `kind`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MigrationBranchCutover` (
  `id` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NOT NULL,
  `sourceBranchId` VARCHAR(191) NOT NULL,
  `status` ENUM('V1_ACTIVE', 'FREEZING', 'DRAINING', 'V2_ACTIVE', 'ROLLING_BACK', 'ROLLED_BACK') NOT NULL DEFAULT 'V1_ACTIVE',
  `snapshotGtid` VARCHAR(191) NULL,
  `highWaterGtid` VARCHAR(191) NULL,
  `highWaterOrder` BIGINT NULL,
  `v1WritesFrozenAt` DATETIME(3) NULL,
  `deltaDrainedAt` DATETIME(3) NULL,
  `v2ActivatedAt` DATETIME(3) NULL,
  `rollbackStartedAt` DATETIME(3) NULL,
  `rollbackCompletedAt` DATETIME(3) NULL,
  `version` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `MigrationBranchCutover_branchId_key`(`branchId`),
  UNIQUE INDEX `MigrationBranchCutover_sourceBranchId_key`(`sourceBranchId`),
  INDEX `MigrationBranchCutover_status_updatedAt_idx`(`status`, `updatedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MigrationPilotOutbox` (
  `id` CHAR(36) NOT NULL,
  `eventKey` VARCHAR(191) NOT NULL,
  `branchId` CHAR(36) NOT NULL,
  `aggregateType` VARCHAR(64) NOT NULL,
  `aggregateId` VARCHAR(191) NOT NULL,
  `operation` VARCHAR(64) NOT NULL,
  `payloadCiphertext` LONGTEXT NOT NULL,
  `payloadIv` VARCHAR(32) NOT NULL,
  `payloadAuthTag` VARCHAR(32) NOT NULL,
  `payloadKeyVersion` VARCHAR(32) NOT NULL,
  `status` ENUM('PENDING', 'APPLIED_TO_V1', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `failureCode` VARCHAR(64) NULL,
  `correlationId` VARCHAR(191) NOT NULL,
  `occurredAt` DATETIME(3) NOT NULL,
  `appliedToV1At` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `MigrationPilotOutbox_eventKey_key`(`eventKey`),
  INDEX `MigrationPilotOutbox_branchId_status_occurredAt_idx`(`branchId`, `status`, `occurredAt`),
  INDEX `MigrationPilotOutbox_aggregateType_aggregateId_occurredAt_idx`(`aggregateType`, `aggregateId`, `occurredAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `MigrationDeltaEvent`
  ADD CONSTRAINT `MigrationDeltaEvent_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `MigrationBatch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `MigrationDeltaEvent_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `MigrationBranchCutover`
  ADD CONSTRAINT `MigrationBranchCutover_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `MigrationPilotOutbox`
  ADD CONSTRAINT `MigrationPilotOutbox_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
