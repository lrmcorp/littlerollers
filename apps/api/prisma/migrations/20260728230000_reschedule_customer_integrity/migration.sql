-- Prevent two active booking records for the same customer and class slot.
-- MySQL permits multiple NULL values in a unique index, so terminal booking
-- states do not block historical records for the same customer and slot.
ALTER TABLE `Booking`
    ADD COLUMN `_activeCustomerSlotKey` VARCHAR(73)
      GENERATED ALWAYS AS (
        IF(
          `status` IN ('BOOKED', 'RESCHEDULE_PENDING'),
          CONCAT(`customerUserId`, ':', `classSlotId`),
          NULL
        )
      ) VIRTUAL,
    ADD UNIQUE INDEX `Booking_activeCustomerSlot_key` (`_activeCustomerSlotKey`);
