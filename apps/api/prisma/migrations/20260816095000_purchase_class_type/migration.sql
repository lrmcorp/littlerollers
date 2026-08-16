-- Simpan jenis kelas yang dipilih customer pada saat transaksi.
-- Nullable sementara untuk kompatibilitas purchase lama sebelum backfill.
ALTER TABLE `Purchase`
  ADD COLUMN `classTypeId` CHAR(36) NULL;

CREATE INDEX `Purchase_classTypeId_idx`
  ON `Purchase`(`classTypeId`);

ALTER TABLE `Purchase`
  ADD CONSTRAINT `Purchase_classTypeId_fkey`
  FOREIGN KEY (`classTypeId`)
  REFERENCES `ClassType`(`id`)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
