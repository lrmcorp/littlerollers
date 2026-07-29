ALTER TABLE `Booking`
  ADD COLUMN `cancellationReasonCode` ENUM(
    'PERSONAL_UNAVAILABLE',
    'CUSTOMER_SCHEDULE_CONFLICT',
    'WRONG_CLASS_SELECTED',
    'OTHER'
  ) NULL,
  ADD COLUMN `cancelledAt` DATETIME(3) NULL,
  ADD COLUMN `cancelledById` CHAR(36) NULL;

CREATE INDEX `Booking_cancelledById_idx` ON `Booking`(`cancelledById`);

ALTER TABLE `Booking`
  ADD CONSTRAINT `Booking_cancelledById_fkey`
  FOREIGN KEY (`cancelledById`) REFERENCES `User`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO `CapabilityDefinition`
  (`key`, `label`, `description`, `category`, `sensitive`, `active`, `systemOnly`, `globalOnly`)
VALUES
  (
    'booking:self:cancel',
    'Batalkan booking sendiri',
    'Customer membatalkan booking sendiri sebelum cutoff.',
    'BOOKING',
    false,
    true,
    false,
    false
  );

INSERT INTO `RoleCapability` (`roleId`, `capabilityKey`)
SELECT `id`, 'booking:self:cancel'
FROM `RoleDefinition`
WHERE `systemRole` = 'CUSTOMER';
