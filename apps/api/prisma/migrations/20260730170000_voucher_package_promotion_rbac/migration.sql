INSERT INTO `CapabilityDefinition`
  (`key`, `label`, `description`, `category`, `sensitive`, `active`, `systemOnly`, `globalOnly`)
VALUES
  (
    'voucher:read',
    'Lihat voucher',
    'Melihat konfigurasi dan penggunaan voucher dalam scope yang diizinkan.',
    'VOUCHER',
    false,
    true,
    false,
    false
  ),
  (
    'voucher:manage',
    'Kelola voucher',
    'Membuat dan mengubah lifecycle voucher dalam scope yang diizinkan.',
    'VOUCHER',
    true,
    true,
    false,
    false
  ),
  (
    'voucher:redeem',
    'Gunakan voucher',
    'Memvalidasi dan menggunakan voucher pada checkout customer.',
    'VOUCHER',
    false,
    true,
    false,
    false
  ),
  (
    'package-promotion:read',
    'Lihat promo paket',
    'Melihat promo harga paket dalam scope yang diizinkan.',
    'PACKAGE',
    false,
    true,
    false,
    false
  ),
  (
    'package-promotion:manage',
    'Kelola promo paket',
    'Membuat dan mengubah lifecycle promo harga paket dalam scope yang diizinkan.',
    'PACKAGE',
    true,
    true,
    false,
    false
  )
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `description` = VALUES(`description`),
  `category` = VALUES(`category`),
  `sensitive` = VALUES(`sensitive`),
  `active` = VALUES(`active`),
  `systemOnly` = VALUES(`systemOnly`),
  `globalOnly` = VALUES(`globalOnly`);

INSERT IGNORE INTO `RoleCapability` (`roleId`, `capabilityKey`)
SELECT `id`, 'voucher:redeem'
FROM `RoleDefinition`
WHERE `systemRole` = 'CUSTOMER';

INSERT IGNORE INTO `RoleCapability` (`roleId`, `capabilityKey`)
SELECT `id`, capability.`key`
FROM `RoleDefinition`
JOIN (
  SELECT 'voucher:read' AS `key`
  UNION ALL SELECT 'package-promotion:read'
) capability
WHERE `systemRole` = 'OWNER';

INSERT IGNORE INTO `RoleCapability` (`roleId`, `capabilityKey`)
SELECT `id`, 'voucher:read'
FROM `RoleDefinition`
WHERE `systemRole` = 'FINANCE';

INSERT IGNORE INTO `RoleCapability` (`roleId`, `capabilityKey`)
SELECT `id`, capability.`key`
FROM `RoleDefinition`
JOIN (
  SELECT 'voucher:read' AS `key`
  UNION ALL SELECT 'voucher:manage'
  UNION ALL SELECT 'package-promotion:read'
  UNION ALL SELECT 'package-promotion:manage'
) capability
WHERE `systemRole` = 'SUPER_OWNER';
