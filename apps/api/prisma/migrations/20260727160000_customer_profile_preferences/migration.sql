ALTER TABLE `User`
  ADD COLUMN `email` VARCHAR(191) NULL,
  ADD COLUMN `preferredBranchId` CHAR(36) NULL,
  ADD UNIQUE INDEX `User_email_key` (`email`),
  ADD INDEX `User_preferredBranchId_idx` (`preferredBranchId`),
  ADD CONSTRAINT `User_preferredBranchId_fkey` FOREIGN KEY (`preferredBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Branch`
  ADD COLUMN `supportWhatsappE164` VARCHAR(191) NULL;

ALTER TABLE `IdentityDocumentViewAuthorization`
  DROP FOREIGN KEY `IdentityDocumentViewAuthorization_reviewerId_fkey`,
  DROP INDEX `IdentityDocumentViewAuthorization_reviewerId_expiresAt_idx`,
  CHANGE COLUMN `reviewerId` `viewerId` CHAR(36) NOT NULL,
  ADD COLUMN `purpose` ENUM('SELF_VIEW', 'REVIEW') NOT NULL DEFAULT 'REVIEW',
  ADD INDEX `IdentityDocumentViewAuthorization_viewerId_expiresAt_idx` (`viewerId`, `expiresAt`),
  ADD CONSTRAINT `IdentityDocumentViewAuthorization_viewerId_fkey` FOREIGN KEY (`viewerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
