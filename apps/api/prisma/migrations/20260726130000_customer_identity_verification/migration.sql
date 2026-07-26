ALTER TABLE `User`
  ADD COLUMN `phoneE164` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `User_phoneE164_key`(`phoneE164`);

CREATE TABLE `IdentityVerificationDocument` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `kind` ENUM('SELFIE', 'KTP_FRONT') NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'DELETED') NOT NULL DEFAULT 'PENDING',
  `objectKey` VARCHAR(191) NULL,
  `checksum` VARCHAR(191) NOT NULL,
  `fileName` VARCHAR(191) NOT NULL,
  `mimeType` VARCHAR(191) NOT NULL,
  `sizeBytes` INTEGER NOT NULL,
  `uploadStatus` ENUM('ISSUED', 'UPLOADED', 'FINALIZED', 'FAILED') NOT NULL DEFAULT 'ISSUED',
  `scanStatus` ENUM('PENDING', 'CLEAN', 'REJECTED', 'INFECTED', 'ERROR') NOT NULL DEFAULT 'PENDING',
  `providerReferenceHash` VARCHAR(191) NULL,
  `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `uploadedAt` DATETIME(3) NULL,
  `finalizedAt` DATETIME(3) NULL,
  `reviewedAt` DATETIME(3) NULL,
  `reviewedById` CHAR(36) NULL,
  `rejectionReasonCode` VARCHAR(191) NULL,
  `rejectionNote` TEXT NULL,
  `replacedById` CHAR(36) NULL,
  `deletedAt` DATETIME(3) NULL,
  `deletedById` CHAR(36) NULL,
  `deletionReason` TEXT NULL,
  `version` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `IdentityVerificationDocument_objectKey_key`(`objectKey`),
  INDEX `IdentityVerificationDocument_userId_kind_createdAt_idx`(`userId`, `kind`, `createdAt`),
  INDEX `IdentityVerificationDocument_status_kind_createdAt_idx`(`status`, `kind`, `createdAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `IdentityVerificationDocument_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `IdentityVerificationDocument_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `IdentityVerificationDocument_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `IdentityVerificationDocument_replacedById_fkey` FOREIGN KEY (`replacedById`) REFERENCES `IdentityVerificationDocument`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Existing customers predate document verification and remain compatible.
INSERT INTO `IdentityVerificationDocument`
(`id`, `userId`, `kind`, `status`, `objectKey`, `checksum`, `fileName`, `mimeType`, `sizeBytes`, `uploadStatus`, `scanStatus`, `finalizedAt`, `reviewedAt`, `version`, `createdAt`, `updatedAt`)
SELECT UUID(), ur.`userId`, kinds.`kind`, 'APPROVED', NULL, 'LEGACY_APPROVED', 'legacy-approved', 'application/x-legacy-verification', 1, 'FINALIZED', 'CLEAN', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3), 0, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM (SELECT DISTINCT `userId` FROM `UserRole` WHERE `role` = 'CUSTOMER') ur
CROSS JOIN (SELECT 'SELFIE' AS `kind` UNION ALL SELECT 'KTP_FRONT') kinds;
