ALTER TABLE `PasswordCredential`
  ADD COLUMN `mustChangePassword` BOOLEAN NOT NULL DEFAULT false AFTER `passwordChangedAt`;

INSERT INTO `CapabilityDefinition`
  (`key`, `label`, `description`, `category`, `sensitive`, `active`, `systemOnly`, `globalOnly`)
VALUES
  ('customer:read', 'Lihat customer', 'Melihat daftar dan profil terpadu customer.', 'CUSTOMER', true, true, false, true),
  ('customer:manage', 'Kelola profil customer', 'Mengubah profil dan Studio/Cabang pilihan customer.', 'CUSTOMER', true, true, false, true),
  ('customer:credential:initialize', 'Buat kredensial awal customer', 'Membuat customer dengan password awal wajib diganti.', 'CUSTOMER', true, true, false, true),
  ('customer:security:manage', 'Kelola keamanan customer', 'Mengaktifkan atau menonaktifkan akun customer.', 'CUSTOMER', true, true, false, true)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `description` = VALUES(`description`),
  `category` = VALUES(`category`),
  `sensitive` = VALUES(`sensitive`),
  `active` = VALUES(`active`),
  `systemOnly` = VALUES(`systemOnly`),
  `globalOnly` = VALUES(`globalOnly`);

INSERT IGNORE INTO `RoleCapability` (`roleId`, `capabilityKey`)
SELECT role.`id`, capability.`key`
FROM `RoleDefinition` role
JOIN (
  SELECT 'customer:read' AS `key`
  UNION ALL SELECT 'customer:manage'
  UNION ALL SELECT 'customer:credential:initialize'
  UNION ALL SELECT 'customer:security:manage'
) capability
WHERE role.`systemRole` = 'SUPER_OWNER';
