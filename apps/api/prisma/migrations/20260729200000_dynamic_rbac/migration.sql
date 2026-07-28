CREATE TABLE `CapabilityDefinition` (
  `key` VARCHAR(96) NOT NULL,
  `label` VARCHAR(160) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `sensitive` BOOLEAN NOT NULL DEFAULT false,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `systemOnly` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RoleDefinition` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `displayName` VARCHAR(160) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `scope` ENUM('GLOBAL', 'BRANCH') NOT NULL,
  `systemRole` ENUM('CUSTOMER', 'INSTRUCTOR', 'ADMIN', 'MANAGER', 'OWNER', 'SUPER_OWNER', 'FINANCE', 'OPS') NULL,
  `system` BOOLEAN NOT NULL DEFAULT false,
  `protected` BOOLEAN NOT NULL DEFAULT false,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `version` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `RoleDefinition_code_key` (`code`),
  UNIQUE INDEX `RoleDefinition_systemRole_key` (`systemRole`),
  INDEX `RoleDefinition_active_scope_code_idx` (`active`, `scope`, `code`),
  CONSTRAINT `RoleDefinition_system_consistency` CHECK (
    (`system` = true AND `systemRole` IS NOT NULL) OR
    (`system` = false AND `systemRole` IS NULL)
  )
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RoleCapability` (
  `roleId` CHAR(36) NOT NULL,
  `capabilityKey` VARCHAR(96) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`roleId`, `capabilityKey`),
  INDEX `RoleCapability_capabilityKey_idx` (`capabilityKey`),
  CONSTRAINT `RoleCapability_roleId_fkey`
    FOREIGN KEY (`roleId`) REFERENCES `RoleDefinition` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `RoleCapability_capabilityKey_fkey`
    FOREIGN KEY (`capabilityKey`) REFERENCES `CapabilityDefinition` (`key`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AccessRoleAssignment` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `roleId` CHAR(36) NOT NULL,
  `branchId` CHAR(36) NULL,
  `activeFrom` DATETIME(3) NOT NULL,
  `activeUntil` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `_activeKey` VARCHAR(191)
    GENERATED ALWAYS AS (
      CASE WHEN `activeUntil` IS NULL
        THEN CONCAT(`userId`, '|', `roleId`, '|', COALESCE(`branchId`, 'GLOBAL'))
        ELSE NULL
      END
    ) STORED,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `AccessRoleAssignment_one_active_key` (`_activeKey`),
  INDEX `AccessRoleAssignment_userId_activeFrom_activeUntil_idx` (`userId`, `activeFrom`, `activeUntil`),
  INDEX `AccessRoleAssignment_roleId_branchId_activeFrom_activeUntil_idx` (`roleId`, `branchId`, `activeFrom`, `activeUntil`),
  INDEX `AccessRoleAssignment_branchId_idx` (`branchId`),
  CONSTRAINT `AccessRoleAssignment_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `AccessRoleAssignment_roleId_fkey`
    FOREIGN KEY (`roleId`) REFERENCES `RoleDefinition` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `AccessRoleAssignment_branchId_fkey`
    FOREIGN KEY (`branchId`) REFERENCES `Branch` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UserCapabilityOverride` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `capabilityKey` VARCHAR(96) NOT NULL,
  `branchId` CHAR(36) NULL,
  `effect` ENUM('GRANT', 'DENY') NOT NULL,
  `reasonCode` VARCHAR(64) NOT NULL,
  `note` VARCHAR(500) NULL,
  `createdById` CHAR(36) NOT NULL,
  `revokedAt` DATETIME(3) NULL,
  `revokedById` CHAR(36) NULL,
  `revokeReason` VARCHAR(64) NULL,
  `version` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `_activeKey` VARCHAR(191)
    GENERATED ALWAYS AS (
      CASE WHEN `revokedAt` IS NULL
        THEN CONCAT(`userId`, '|', `capabilityKey`, '|', COALESCE(`branchId`, 'GLOBAL'))
        ELSE NULL
      END
    ) STORED,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UserCapabilityOverride_one_active_key` (`_activeKey`),
  INDEX `UserCapabilityOverride_userId_revokedAt_capabilityKey_idx` (`userId`, `revokedAt`, `capabilityKey`),
  INDEX `UserCapabilityOverride_branchId_capabilityKey_revokedAt_idx` (`branchId`, `capabilityKey`, `revokedAt`),
  INDEX `UserCapabilityOverride_createdById_idx` (`createdById`),
  INDEX `UserCapabilityOverride_revokedById_idx` (`revokedById`),
  CONSTRAINT `UserCapabilityOverride_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `UserCapabilityOverride_capabilityKey_fkey`
    FOREIGN KEY (`capabilityKey`) REFERENCES `CapabilityDefinition` (`key`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `UserCapabilityOverride_branchId_fkey`
    FOREIGN KEY (`branchId`) REFERENCES `Branch` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `UserCapabilityOverride_createdById_fkey`
    FOREIGN KEY (`createdById`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `UserCapabilityOverride_revokedById_fkey`
    FOREIGN KEY (`revokedById`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `UserCapabilityOverride_revoke_consistency` CHECK (
    (`revokedAt` IS NULL AND `revokedById` IS NULL AND `revokeReason` IS NULL) OR
    (`revokedAt` IS NOT NULL AND `revokedById` IS NOT NULL AND `revokeReason` IS NOT NULL)
  )
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `CapabilityDefinition`
  (`key`, `label`, `description`, `category`, `sensitive`, `active`, `systemOnly`)
VALUES
  ('assignment:manage', 'Kelola assignment', 'Membuat dan mengakhiri assignment.', 'ASSIGNMENT', true, true, false),
  ('assignment:read', 'Lihat assignment', 'Melihat assignment dalam scope.', 'ASSIGNMENT', false, true, false),
  ('attendance:manage', 'Kelola attendance', 'Mencatat dan memperbaiki attendance.', 'ATTENDANCE', true, true, false),
  ('attendance:read', 'Lihat attendance', 'Melihat attendance dalam scope.', 'ATTENDANCE', false, true, false),
  ('attendance:self', 'Attendance sendiri', 'Mengakses attendance yang ditugaskan.', 'ATTENDANCE', false, true, false),
  ('audit:read', 'Lihat audit', 'Membaca audit akses dan operasi.', 'AUDIT', true, true, false),
  ('availability:self:create', 'Buat availability sendiri', 'Membuat availability instruktur sendiri.', 'CLASS', false, true, false),
  ('availability:self:read', 'Lihat availability sendiri', 'Melihat availability instruktur sendiri.', 'CLASS', false, true, false),
  ('booking:create:assisted', 'Buat booking bantuan', 'Membuat booking untuk customer.', 'BOOKING', true, true, false),
  ('booking:read', 'Lihat booking', 'Melihat booking dalam scope.', 'BOOKING', false, true, false),
  ('booking:self:create', 'Buat booking sendiri', 'Customer membuat booking sendiri.', 'BOOKING', false, true, false),
  ('booking:self:read', 'Lihat booking sendiri', 'Customer melihat booking sendiri.', 'BOOKING', false, true, false),
  ('branch:all', 'Semua cabang', 'Mengakses resource seluruh cabang.', 'BRANCH', true, true, false),
  ('branch:manage', 'Kelola cabang', 'Mengelola operasi cabang.', 'BRANCH', true, true, false),
  ('branch:operate', 'Operasikan cabang', 'Menjalankan operasi harian cabang.', 'BRANCH', false, true, false),
  ('branch:own', 'Pengawasan cabang', 'Mengawasi cabang yang dimiliki.', 'BRANCH', false, true, false),
  ('class-slot:manage', 'Kelola jadwal kelas', 'Membuat, menerbitkan, dan membatalkan kelas.', 'CLASS', true, true, false),
  ('class-slot:read', 'Lihat jadwal kelas', 'Melihat jadwal kelas.', 'CLASS', false, true, false),
  ('class:assigned:read', 'Lihat kelas ditugaskan', 'Melihat kelas yang ditugaskan kepada instruktur.', 'CLASS', false, true, false),
  ('customer:self', 'Akses customer sendiri', 'Mengakses resource milik customer sendiri.', 'CUSTOMER', false, true, false),
  ('dashboard:read', 'Lihat dashboard', 'Melihat dashboard operasional.', 'DASHBOARD', false, true, false),
  ('finance:export', 'Export finance', 'Mengekspor laporan finance.', 'FINANCE', true, true, false),
  ('finance:manage', 'Kelola finance', 'Mengelola konfigurasi finance.', 'FINANCE', true, true, false),
  ('finance:read', 'Lihat finance', 'Melihat informasi finance.', 'FINANCE', false, true, false),
  ('finance:reconcile', 'Rekonsiliasi finance', 'Menjalankan rekonsiliasi finance.', 'FINANCE', true, true, false),
  ('identity-verification:delete', 'Hapus dokumen identitas', 'Menghapus dokumen identitas melalui workflow aman.', 'IDENTITY', true, true, false),
  ('identity-verification:review', 'Review identitas', 'Mereview dokumen identitas.', 'IDENTITY', true, true, false),
  ('ledger:adjust:decide', 'Putuskan adjustment sesi', 'Menyetujui atau menolak adjustment sesi.', 'LEDGER', true, true, false),
  ('ledger:adjust:read', 'Lihat adjustment sesi', 'Melihat antrean adjustment sesi.', 'LEDGER', false, true, false),
  ('ledger:adjust:request', 'Ajukan adjustment sesi', 'Mengajukan adjustment sesi.', 'LEDGER', true, true, false),
  ('ledger:read', 'Lihat ledger', 'Melihat saldo dan histori ledger.', 'LEDGER', false, true, false),
  ('master:manage', 'Kelola master data', 'Mengelola master data.', 'MASTER', true, true, false),
  ('master:read', 'Lihat master data', 'Melihat master data.', 'MASTER', false, true, false),
  ('operations:read', 'Lihat operations', 'Melihat job dan delivery operasional.', 'OPERATIONS', false, true, false),
  ('operations:recover', 'Recovery operations', 'Retry dan recovery job operasional.', 'OPERATIONS', true, true, false),
  ('package:read', 'Lihat paket', 'Melihat katalog dan paket customer.', 'PACKAGE', false, true, false),
  ('payment-account:manage', 'Kelola rekening pembayaran', 'Mengelola rekening tujuan pembayaran.', 'PAYMENT', true, true, false),
  ('payment-account:read', 'Lihat rekening pembayaran', 'Melihat rekening tujuan pembayaran.', 'PAYMENT', false, true, false),
  ('payment:decide', 'Putuskan pembayaran', 'Menyetujui atau menolak pembayaran.', 'PAYMENT', true, true, false),
  ('payment:review', 'Review pembayaran', 'Melihat antrean review pembayaran.', 'PAYMENT', true, true, false),
  ('purchase:decide', 'Putuskan purchase legacy', 'Alias kompatibilitas keputusan pembayaran.', 'PAYMENT', true, true, false),
  ('purchase:review', 'Review purchase legacy', 'Alias kompatibilitas review pembayaran.', 'PAYMENT', true, true, false),
  ('reschedule:decide', 'Putuskan reschedule', 'Menyetujui atau menolak reschedule.', 'RESCHEDULE', true, true, false),
  ('reschedule:read', 'Lihat reschedule', 'Melihat antrean reschedule.', 'RESCHEDULE', false, true, false),
  ('reschedule:self:read', 'Lihat reschedule sendiri', 'Customer melihat reschedule sendiri.', 'RESCHEDULE', false, true, false),
  ('reschedule:self:request', 'Ajukan reschedule sendiri', 'Customer mengajukan reschedule.', 'RESCHEDULE', false, true, false),
  ('role-permission:manage', 'Kelola role dan permission', 'Mengelola role, capability, dan override akses.', 'ACCESS', true, true, true),
  ('session:revoke', 'Cabut session', 'Mencabut session user.', 'SECURITY', true, true, false),
  ('user:admin', 'Administrasi user', 'Membuat dan mengubah akses user.', 'USER', true, true, false),
  ('user:read', 'Lihat user', 'Melihat user dalam scope.', 'USER', false, true, false);

INSERT INTO `RoleDefinition`
  (`id`, `code`, `displayName`, `description`, `scope`, `systemRole`, `system`, `protected`, `active`)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'CUSTOMER', 'Customer', 'Akses mandiri customer.', 'GLOBAL', 'CUSTOMER', true, true, true),
  ('10000000-0000-4000-8000-000000000002', 'INSTRUCTOR', 'Instructor', 'Akses instruktur per cabang.', 'BRANCH', 'INSTRUCTOR', true, true, true),
  ('10000000-0000-4000-8000-000000000003', 'ADMIN', 'Admin', 'Operasi harian cabang.', 'BRANCH', 'ADMIN', true, true, true),
  ('10000000-0000-4000-8000-000000000004', 'MANAGER', 'Manager', 'Keputusan operasional cabang.', 'BRANCH', 'MANAGER', true, true, true),
  ('10000000-0000-4000-8000-000000000005', 'OWNER', 'Owner', 'Pengawasan cabang.', 'BRANCH', 'OWNER', true, true, true),
  ('10000000-0000-4000-8000-000000000006', 'SUPER_OWNER', 'Super Owner', 'Kendali global seluruh sistem.', 'GLOBAL', 'SUPER_OWNER', true, true, true),
  ('10000000-0000-4000-8000-000000000007', 'FINANCE', 'Finance', 'Operasi finance global.', 'GLOBAL', 'FINANCE', true, true, true),
  ('10000000-0000-4000-8000-000000000008', 'OPS', 'Operations', 'Monitoring dan recovery operasional.', 'GLOBAL', 'OPS', true, true, true);

INSERT INTO `RoleCapability` (`roleId`, `capabilityKey`)
SELECT r.`id`, c.`key` FROM `RoleDefinition` r JOIN `CapabilityDefinition` c
WHERE
  (r.`systemRole` = 'CUSTOMER' AND c.`key` IN ('customer:self','package:read','ledger:read','class-slot:read','booking:self:read','booking:self:create','reschedule:self:read','reschedule:self:request'))
  OR (r.`systemRole` = 'INSTRUCTOR' AND c.`key` IN ('class:assigned:read','attendance:self','availability:self:read','availability:self:create','class-slot:read'))
  OR (r.`systemRole` = 'ADMIN' AND c.`key` IN ('branch:operate','user:read','payment:review','ledger:read','ledger:adjust:read','ledger:adjust:request','class-slot:read','class-slot:manage','booking:read','booking:create:assisted','reschedule:read','reschedule:decide','identity-verification:review','attendance:read','attendance:manage'))
  OR (r.`systemRole` = 'MANAGER' AND c.`key` IN ('branch:manage','user:read','ledger:read','ledger:adjust:read','ledger:adjust:decide','class-slot:read','class-slot:manage','booking:read','booking:create:assisted','attendance:read','attendance:manage'))
  OR (r.`systemRole` = 'OWNER' AND c.`key` IN ('branch:own','dashboard:read','user:read','audit:read','finance:read','ledger:read','class-slot:read','booking:read','reschedule:read','attendance:read'))
  OR (r.`systemRole` = 'SUPER_OWNER' AND c.`key` IN ('role-permission:manage','audit:read','user:read','user:admin','branch:all','session:revoke','assignment:read','assignment:manage','master:read','master:manage','payment-account:read','payment-account:manage','package:read','payment:review','payment:decide','finance:read','finance:manage','finance:reconcile','finance:export','purchase:review','purchase:decide','ledger:read','ledger:adjust:read','ledger:adjust:decide','class-slot:read','class-slot:manage','operations:read','operations:recover','booking:read','booking:create:assisted','attendance:read','attendance:manage','reschedule:read','reschedule:decide','identity-verification:review','identity-verification:delete'))
  OR (r.`systemRole` = 'FINANCE' AND c.`key` IN ('finance:read','finance:manage','finance:reconcile','finance:export','payment:review','payment:decide','package:read','ledger:read','ledger:adjust:read'))
  OR (r.`systemRole` = 'OPS' AND c.`key` IN ('operations:read','operations:recover'));
