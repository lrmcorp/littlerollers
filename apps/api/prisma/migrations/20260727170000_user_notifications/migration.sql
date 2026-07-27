CREATE TABLE `NotificationProjection` (
  `id` CHAR(36) NOT NULL,
  `sourceEventId` CHAR(36) NOT NULL,
  `status` ENUM('SUCCEEDED', 'SKIPPED', 'FAILED') NOT NULL,
  `errorCode` VARCHAR(191) NULL,
  `projectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `NotificationProjection_sourceEventId_key` (`sourceEventId`),
  INDEX `NotificationProjection_status_projectedAt_idx` (`status`, `projectedAt`),
  CONSTRAINT `NotificationProjection_sourceEventId_fkey` FOREIGN KEY (`sourceEventId`) REFERENCES `OutboxEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UserNotification` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NULL,
  `sourceEventId` CHAR(36) NULL,
  `eventKey` VARCHAR(191) NOT NULL,
  `category` ENUM('VERIFICATION', 'PAYMENT', 'PACKAGE', 'BOOKING', 'RESCHEDULE', 'CLASS', 'ATTENDANCE', 'ADJUSTMENT', 'OPERATIONS', 'APPROVAL', 'SYSTEM') NOT NULL,
  `tone` ENUM('SUCCESS', 'INFO', 'WARNING', 'DANGER') NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` VARCHAR(191) NOT NULL,
  `href` VARCHAR(191) NULL,
  `metadataMasked` JSON NULL,
  `readAt` DATETIME(3) NULL,
  `expiresAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UserNotification_userId_eventKey_key` (`userId`, `eventKey`),
  INDEX `UserNotification_userId_readAt_createdAt_idx` (`userId`, `readAt`, `createdAt`),
  INDEX `UserNotification_userId_expiresAt_idx` (`userId`, `expiresAt`),
  INDEX `UserNotification_branchId_createdAt_idx` (`branchId`, `createdAt`),
  CONSTRAINT `UserNotification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserNotification_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `UserNotification_sourceEventId_fkey` FOREIGN KEY (`sourceEventId`) REFERENCES `OutboxEvent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
