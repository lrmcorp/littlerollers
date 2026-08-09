CREATE TABLE IF NOT EXISTS `migration_pilot_replay_receipts` (
  `event_key` CHAR(64) NOT NULL,
  `aggregate_type` VARCHAR(64) NOT NULL,
  `aggregate_id` VARCHAR(191) NOT NULL,
  `operation` VARCHAR(64) NOT NULL,
  `payload_checksum` CHAR(64) NOT NULL,
  `source_table` VARCHAR(64) NULL,
  `source_id` VARCHAR(191) NULL,
  `status` VARCHAR(16) NOT NULL,
  `attempts` INT UNSIGNED NOT NULL DEFAULT 1,
  `correlation_id` VARCHAR(191) NOT NULL,
  `applied_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`event_key`),
  KEY `migration_pilot_replay_receipts_status_updated_idx` (`status`, `updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
