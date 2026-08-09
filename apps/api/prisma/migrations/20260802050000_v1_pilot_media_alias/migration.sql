CREATE TABLE `MigrationPilotMediaAlias` (
  `id` CHAR(36) NOT NULL,
  `eventKey` VARCHAR(191) NOT NULL,
  `branchId` CHAR(36) NOT NULL,
  `targetType` VARCHAR(64) NOT NULL,
  `targetId` VARCHAR(191) NOT NULL,
  `mediaKind` VARCHAR(32) NOT NULL,
  `aliasReference` VARCHAR(191) NOT NULL,
  `checksum` CHAR(64) NOT NULL,
  `mimeType` VARCHAR(128) NOT NULL,
  `sizeBytes` INTEGER NOT NULL,
  `status` ENUM('PREPARED','ACTIVE','FAILED') NOT NULL DEFAULT 'PREPARED',
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `failureCode` VARCHAR(64) NULL,
  `activatedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `MigrationPilotMediaAlias_eventKey_key` (`eventKey`),
  UNIQUE INDEX `MigrationPilotMediaAlias_aliasReference_key` (`aliasReference`),
  INDEX `MigrationPilotMediaAlias_branchId_status_createdAt_idx` (`branchId`, `status`, `createdAt`),
  INDEX `MigrationPilotMediaAlias_targetType_targetId_idx` (`targetType`, `targetId`),
  CONSTRAINT `MigrationPilotMediaAlias_branchId_fkey`
    FOREIGN KEY (`branchId`) REFERENCES `Branch` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
