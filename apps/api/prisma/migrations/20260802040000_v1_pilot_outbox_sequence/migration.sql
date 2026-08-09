ALTER TABLE `MigrationPilotOutbox`
  ADD COLUMN `sequence` BIGINT NOT NULL AUTO_INCREMENT,
  ADD COLUMN `payloadChecksum` CHAR(64) NOT NULL,
  ADD UNIQUE INDEX `MigrationPilotOutbox_sequence_key` (`sequence`),
  ADD INDEX `MigrationPilotOutbox_branchId_status_sequence_idx` (`branchId`, `status`, `sequence`);
