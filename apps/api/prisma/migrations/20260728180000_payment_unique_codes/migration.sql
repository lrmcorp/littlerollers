ALTER TABLE `Purchase`
  ADD COLUMN `paymentUniqueCode` INTEGER NULL,
  ADD COLUMN `payableAmountRpSnapshot` INTEGER NULL;

CREATE TABLE `PaymentUniqueCodeReservation` (
  `id` CHAR(36) NOT NULL,
  `paymentAccountId` CHAR(36) NOT NULL,
  `purchaseId` CHAR(36) NOT NULL,
  `code` INTEGER NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `PaymentUniqueCodeReservation_purchaseId_key`(`purchaseId`),
  UNIQUE INDEX `PaymentUniqueCodeReservation_paymentAccountId_code_key`(`paymentAccountId`, `code`),
  INDEX `PaymentUniqueCodeReservation_expiresAt_idx`(`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PaymentUniqueCodeReservation`
  ADD CONSTRAINT `PaymentUniqueCodeReservation_paymentAccountId_fkey`
  FOREIGN KEY (`paymentAccountId`) REFERENCES `PaymentAccount`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `PaymentUniqueCodeReservation`
  ADD CONSTRAINT `PaymentUniqueCodeReservation_purchaseId_fkey`
  FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
