-- Backfill jenis kelas Purchase lama.
--
-- 1. CustomerPackage adalah sumber paling kuat untuk transaksi yang
--    sudah menghasilkan entitlement.
-- 2. Untuk transaksi yang belum memiliki CustomerPackage, gunakan
--    Package.classTypeId sebagai compatibility projection lama.
--
-- Kolom tetap nullable pada fase transisi ini.

UPDATE `Purchase` p
INNER JOIN `CustomerPackage` cp
  ON cp.`purchaseId` = p.`id`
SET p.`classTypeId` = cp.`classTypeId`
WHERE p.`classTypeId` IS NULL;

UPDATE `Purchase` p
INNER JOIN `Package` pkg
  ON pkg.`id` = p.`packageId`
SET p.`classTypeId` = pkg.`classTypeId`
WHERE p.`classTypeId` IS NULL;
