ALTER TABLE `NotificationOccurrence`
  MODIFY `channel` ENUM('IN_APP', 'EMAIL') NOT NULL DEFAULT 'EMAIL';

CREATE TABLE `NotificationTemplate` (
  `id` CHAR(36) NOT NULL, `templateKey` VARCHAR(96) NOT NULL,
  `channel` ENUM('IN_APP','EMAIL') NOT NULL, `version` INTEGER NOT NULL,
  `eventType` VARCHAR(128) NOT NULL, `audience` JSON NOT NULL,
  `subject` VARCHAR(200) NULL, `title` VARCHAR(200) NOT NULL, `body` TEXT NOT NULL,
  `status` ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `createdById` CHAR(36) NOT NULL, `publishedAt` DATETIME(3) NULL, `archivedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `NotificationTemplate_templateKey_channel_version_key` (`templateKey`,`channel`,`version`),
  INDEX `NotificationTemplate_eventType_status_idx` (`eventType`,`status`),
  INDEX `NotificationTemplate_channel_status_idx` (`channel`,`status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `NotificationTemplate_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PublicContentEntry` (
  `id` CHAR(36) NOT NULL, `contentKey` VARCHAR(96) NOT NULL, `branchId` CHAR(36) NULL,
  `scopeKey` VARCHAR(64) NOT NULL,
  `kind` VARCHAR(64) NOT NULL, `locale` VARCHAR(16) NOT NULL DEFAULT 'id-ID', `version` INTEGER NOT NULL,
  `payload` JSON NOT NULL, `status` ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `createdById` CHAR(36) NOT NULL, `publishedAt` DATETIME(3) NULL, `archivedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `PublicContentEntry_contentKey_scopeKey_locale_version_key` (`contentKey`,`scopeKey`,`locale`,`version`),
  INDEX `PublicContentEntry_branchId_kind_status_idx` (`branchId`,`kind`,`status`),
  INDEX `PublicContentEntry_contentKey_status_idx` (`contentKey`,`status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `PublicContentEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PublicContentEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SupportCase` (
  `id` CHAR(36) NOT NULL, `customerUserId` CHAR(36) NOT NULL, `branchId` CHAR(36) NULL,
  `assignedUserId` CHAR(36) NULL, `subject` VARCHAR(200) NOT NULL,
  `status` ENUM('OPEN','IN_PROGRESS','WAITING_CUSTOMER','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
  `priority` ENUM('LOW','NORMAL','HIGH','URGENT') NOT NULL DEFAULT 'NORMAL', `tags` JSON NOT NULL,
  `version` INTEGER NOT NULL DEFAULT 0, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL, `resolvedAt` DATETIME(3) NULL,
  INDEX `SupportCase_branchId_status_priority_updatedAt_idx` (`branchId`,`status`,`priority`,`updatedAt`),
  INDEX `SupportCase_customerUserId_updatedAt_idx` (`customerUserId`,`updatedAt`),
  INDEX `SupportCase_assignedUserId_status_idx` (`assignedUserId`,`status`), PRIMARY KEY (`id`),
  CONSTRAINT `SupportCase_customerUserId_fkey` FOREIGN KEY (`customerUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SupportCase_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SupportCase_assignedUserId_fkey` FOREIGN KEY (`assignedUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SupportCaseNote` (
  `id` CHAR(36) NOT NULL, `caseId` CHAR(36) NOT NULL, `authorId` CHAR(36) NOT NULL,
  `body` TEXT NOT NULL, `internal` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `SupportCaseNote_caseId_createdAt_idx` (`caseId`,`createdAt`),
  INDEX `SupportCaseNote_authorId_createdAt_idx` (`authorId`,`createdAt`), PRIMARY KEY (`id`),
  CONSTRAINT `SupportCaseNote_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `SupportCase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SupportCaseNote_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `CapabilityDefinition` (`key`,`label`,`description`,`category`,`sensitive`,`active`,`systemOnly`,`globalOnly`) VALUES
  ('notification:manage','Kelola notifikasi','Kelola template dan status pengiriman notifikasi.','NOTIFICATION',true,true,false,true),
  ('public-content:read','Lihat konten publik','Melihat draft dan versi konten publik.','CONTENT',false,true,false,false),
  ('public-content:manage','Kelola konten publik','Membuat, menerbitkan, dan mengarsipkan konten publik.','CONTENT',true,true,false,false),
  ('support:read','Lihat support case','Melihat support case sesuai scope cabang.','SUPPORT',true,true,false,false),
  ('support:manage','Kelola support case','Mengelola status, assignment, dan catatan internal support.','SUPPORT',true,true,false,false)
ON DUPLICATE KEY UPDATE `label`=VALUES(`label`),`description`=VALUES(`description`),`active`=true;

INSERT IGNORE INTO `RoleCapability` (`roleId`,`capabilityKey`)
SELECT role.`id`, capability.`key` FROM `RoleDefinition` role JOIN (
  SELECT 'notification:manage' `key` UNION ALL SELECT 'public-content:read' UNION ALL SELECT 'public-content:manage' UNION ALL SELECT 'support:read' UNION ALL SELECT 'support:manage'
) capability WHERE role.`systemRole`='SUPER_OWNER';

INSERT IGNORE INTO `RoleCapability` (`roleId`,`capabilityKey`)
SELECT role.`id`, capability.`key` FROM `RoleDefinition` role JOIN (
  SELECT 'support:read' `key` UNION ALL SELECT 'support:manage'
) capability WHERE role.`systemRole` IN ('ADMIN','MANAGER');
