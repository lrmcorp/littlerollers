-- Backfill jenis kelas Purchase secara deterministik.
--
-- Priority 1: CustomerPackage adalah sumber paling kuat untuk transaksi yang
--             sudah menghasilkan entitlement.
-- Priority 2: Continuation ClassSlot jika transaksi terkait dengan slot tertentu.
-- Priority 3: PackageClassTypeScope HANYA jika paket memiliki tepat 1 jenis kelas
--             yang aktif dan tidak ambigu.
-- Priority 4: Jika masih ambigu / tidak terdefinisi, biarkan NULL agar migration
--             berikutnya gagal secara aman (fail-fast) dan tidak menebak data historis.

-- Priority 1: Backfill dari CustomerPackage
UPDATE `Purchase` p
INNER JOIN `CustomerPackage` cp
  ON cp.`purchaseId` = p.`id`
SET p.`classTypeId` = cp.`classTypeId`
WHERE p.`classTypeId` IS NULL;

-- Priority 2: Backfill dari continuation ClassSlot
UPDATE `Purchase` p
INNER JOIN `ClassSlot` cs
  ON cs.`id` = p.`continuationClassSlotId`
SET p.`classTypeId` = cs.`classTypeId`
WHERE p.`classTypeId` IS NULL
  AND p.`continuationClassSlotId` IS NOT NULL;

-- Priority 3: Backfill dari PackageClassTypeScope (hanya paket single-class yang unambiguous)
UPDATE `Purchase` p
INNER JOIN (
  SELECT `packageId`, MAX(`classTypeId`) AS `classTypeId`
  FROM `PackageClassTypeScope`
  WHERE `active` = 1 AND `sourceDeletedAt` IS NULL
  GROUP BY `packageId`
  HAVING COUNT(DISTINCT `classTypeId`) = 1
) unambiguous_scope
  ON unambiguous_scope.`packageId` = p.`packageId`
SET p.`classTypeId` = unambiguous_scope.`classTypeId`
WHERE p.`classTypeId` IS NULL;

