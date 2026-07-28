CREATE TABLE `PaymentProofViewAuthorization` (
  `id` CHAR(36) NOT NULL,
  `proofId` CHAR(36) NOT NULL,
  `viewerId` CHAR(36) NOT NULL,
  `purpose` VARCHAR(24) NOT NULL DEFAULT 'REVIEW',
  `expiresAt` DATETIME(3) NOT NULL,
  `consumedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `PaymentProofViewAuthorization_viewerId_expiresAt_idx` (`viewerId`, `expiresAt`),
  INDEX `PaymentProofViewAuthorization_proofId_expiresAt_idx` (`proofId`, `expiresAt`),
  CONSTRAINT `PaymentProofViewAuthorization_proofId_fkey` FOREIGN KEY (`proofId`) REFERENCES `PaymentProof` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PaymentProofViewAuthorization_viewerId_fkey` FOREIGN KEY (`viewerId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
