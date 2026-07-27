ALTER TABLE `IdentityVerificationDocument`
  MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'PENDING_DELETION', 'DELETE_FAILED', 'DELETED') NOT NULL DEFAULT 'PENDING';

CREATE TABLE `IdentityDocumentViewAuthorization` (
  `id` CHAR(36) NOT NULL,
  `documentId` CHAR(36) NOT NULL,
  `reviewerId` CHAR(36) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `consumedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `IdentityDocumentViewAuthorization_reviewerId_expiresAt_idx` (`reviewerId`, `expiresAt`),
  INDEX `IdentityDocumentViewAuthorization_documentId_expiresAt_idx` (`documentId`, `expiresAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `IdentityDocumentViewAuthorization_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `IdentityVerificationDocument`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `IdentityDocumentViewAuthorization_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `IdentityDocumentDeletionJob` (
  `id` CHAR(36) NOT NULL,
  `documentId` CHAR(36) NOT NULL,
  `requestedById` CHAR(36) NOT NULL,
  `objectKey` VARCHAR(191) NOT NULL,
  `status` ENUM('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED') NOT NULL DEFAULT 'QUEUED',
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `lastErrorCode` VARCHAR(191) NULL,
  `nextAttemptAt` DATETIME(3) NULL,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `IdentityDocumentDeletionJob_documentId_key` (`documentId`),
  INDEX `IdentityDocumentDeletionJob_status_nextAttemptAt_idx` (`status`, `nextAttemptAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `IdentityDocumentDeletionJob_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `IdentityVerificationDocument`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `IdentityDocumentDeletionJob_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
