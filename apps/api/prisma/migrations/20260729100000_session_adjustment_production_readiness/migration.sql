ALTER TABLE `SessionAdjustment`
  ADD COLUMN `ledgerBalanceAtRequest` INTEGER NULL,
  ADD COLUMN `reservedAtRequest` INTEGER NULL,
  ADD COLUMN `_pendingCustomerPackageId` CHAR(36)
    GENERATED ALWAYS AS (IF(`status` = 'PENDING', `customerPackageId`, NULL)) VIRTUAL,
  ADD UNIQUE INDEX `SessionAdjustment_one_pending_per_package` (`_pendingCustomerPackageId`),
  ADD CONSTRAINT `SessionAdjustment_snapshot_nonnegative`
    CHECK (
      (`ledgerBalanceAtRequest` IS NULL AND `reservedAtRequest` IS NULL) OR
      (`ledgerBalanceAtRequest` IS NOT NULL AND `reservedAtRequest` IS NOT NULL AND
       `ledgerBalanceAtRequest` >= 0 AND `reservedAtRequest` >= 0 AND
       `reservedAtRequest` <= `ledgerBalanceAtRequest`)
    ),
  ADD CONSTRAINT `SessionAdjustment_decision_consistency`
    CHECK (
      (`status` = 'PENDING' AND `decidedById` IS NULL AND `decisionCode` IS NULL AND `decidedAt` IS NULL) OR
      (`status` IN ('POSTED', 'REJECTED') AND `decidedById` IS NOT NULL AND
       `decisionCode` IS NOT NULL AND `decidedAt` IS NOT NULL)
    );
