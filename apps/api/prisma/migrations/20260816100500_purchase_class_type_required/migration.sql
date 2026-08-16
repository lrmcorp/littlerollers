-- Purchase.classTypeId sudah dibackfill pada migration sebelumnya.
-- MySQL akan menolak ALTER ini bila masih ada row dengan classTypeId NULL.
ALTER TABLE `Purchase`
  MODIFY `classTypeId` CHAR(36) NOT NULL;
