ALTER TABLE `User`
  MODIFY COLUMN `status` ENUM('PENDING_ACTIVATION', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE `UserInvitation`
  ADD COLUMN `userId` CHAR(36) NULL,
  ADD UNIQUE INDEX `UserInvitation_userId_key`(`userId`),
  ADD CONSTRAINT `UserInvitation_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `AuditLog`
  ADD COLUMN `targetUserId` CHAR(36) NULL,
  ADD INDEX `AuditLog_targetUserId_occurredAt_idx`(`targetUserId`, `occurredAt`);
