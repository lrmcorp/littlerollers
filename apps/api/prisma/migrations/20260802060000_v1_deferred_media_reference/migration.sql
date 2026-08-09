CREATE TABLE `MigrationDeferredMediaReference` (
  `id` CHAR(36) NOT NULL,
  `batchId` CHAR(36) NOT NULL,
  `sourceSystem` VARCHAR(32) NOT NULL,
  `sourceTable` VARCHAR(64) NOT NULL,
  `sourceId` VARCHAR(191) NOT NULL,
  `sourceField` VARCHAR(64) NOT NULL,
  `mediaKind` VARCHAR(32) NOT NULL,
  `referenceEncrypted` TEXT NOT NULL,
  `referenceHash` CHAR(64) NOT NULL,
  `status` ENUM('DEFERRED') NOT NULL DEFAULT 'DEFERRED',
  `historical` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `DeferredMedia_source_key`
    (`sourceSystem`, `sourceTable`, `sourceId`, `sourceField`),
  INDEX `DeferredMedia_batch_status_kind_idx`
    (`batchId`, `status`, `mediaKind`),
  INDEX `DeferredMedia_reference_hash_idx` (`referenceHash`),
  CONSTRAINT `DeferredMedia_batch_fkey`
    FOREIGN KEY (`batchId`) REFERENCES `MigrationBatch` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
