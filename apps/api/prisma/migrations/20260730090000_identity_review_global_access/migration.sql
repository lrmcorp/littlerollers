ALTER TABLE `CapabilityDefinition`
  ADD COLUMN `globalOnly` BOOLEAN NOT NULL DEFAULT false AFTER `systemOnly`;

UPDATE `CapabilityDefinition`
SET `active` = false,
    `description` = 'Legacy capability dinonaktifkan; gunakan read dan decide terpisah.'
WHERE `key` = 'identity-verification:review';

INSERT INTO `CapabilityDefinition`
  (`key`, `label`, `description`, `category`, `sensitive`, `active`, `systemOnly`, `globalOnly`)
VALUES
  ('identity-verification:read', 'Lihat dokumen identitas', 'Melihat antrean, metadata aman, dan preview dokumen identitas.', 'IDENTITY', true, true, false, true),
  ('identity-verification:decide', 'Putuskan verifikasi identitas', 'Menyetujui atau menolak dokumen identitas.', 'IDENTITY', true, true, false, true)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `description` = VALUES(`description`),
  `category` = VALUES(`category`),
  `sensitive` = VALUES(`sensitive`),
  `active` = VALUES(`active`),
  `systemOnly` = VALUES(`systemOnly`),
  `globalOnly` = VALUES(`globalOnly`);

UPDATE `CapabilityDefinition`
SET `globalOnly` = true
WHERE `key` = 'identity-verification:delete';

INSERT IGNORE INTO `RoleCapability` (`roleId`, `capabilityKey`)
SELECT `id`, 'identity-verification:read'
FROM `RoleDefinition`
WHERE `systemRole` = 'SUPER_OWNER';

INSERT IGNORE INTO `RoleCapability` (`roleId`, `capabilityKey`)
SELECT `id`, 'identity-verification:decide'
FROM `RoleDefinition`
WHERE `systemRole` = 'SUPER_OWNER';

INSERT IGNORE INTO `RoleCapability` (`roleId`, `capabilityKey`)
SELECT `id`, 'identity-verification:delete'
FROM `RoleDefinition`
WHERE `systemRole` = 'SUPER_OWNER';

INSERT INTO `AuditLog`
  (`id`, `occurredAt`, `actorType`, `actorId`, `branchId`, `action`, `objectType`, `objectId`, `targetUserId`, `beforeMasked`, `afterMasked`, `correlationId`)
VALUES
  (
    UUID(),
    CURRENT_TIMESTAMP(3),
    'SYSTEM',
    NULL,
    NULL,
    'security.identity_review_policy_migrated',
    'CapabilityDefinition',
    'identity-verification:review',
    NULL,
    JSON_OBJECT(
      'legacyRoleGrantCount',
      (SELECT COUNT(*) FROM `RoleCapability` WHERE `capabilityKey` = 'identity-verification:review'),
      'legacyActiveOverrideCount',
      (SELECT COUNT(*) FROM `UserCapabilityOverride` WHERE `capabilityKey` = 'identity-verification:review' AND `revokedAt` IS NULL)
    ),
    JSON_OBJECT(
      'legacyCapabilityActive',
      false,
      'globalOnlyCapabilities',
      JSON_ARRAY('identity-verification:read', 'identity-verification:decide', 'identity-verification:delete')
    ),
    'migration:20260730090000_identity_review_global_access'
  );
