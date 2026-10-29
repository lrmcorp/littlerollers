-- Little Rollers sessions run as 1-hour or 2-hour blocks. The length is sold
-- per package, snapshotted onto each purchase and customer package, and
-- recorded on every booking so attendance and history keep the length paid for.
ALTER TABLE `Package` ADD COLUMN `sessionDurationMinutes` INTEGER NOT NULL DEFAULT 60;
ALTER TABLE `Purchase` ADD COLUMN `sessionDurationMinutesSnapshot` INTEGER NOT NULL DEFAULT 60;
ALTER TABLE `CustomerPackage` ADD COLUMN `sessionDurationMinutesSnapshot` INTEGER NOT NULL DEFAULT 60;
ALTER TABLE `Booking` ADD COLUMN `sessionDurationMinutes` INTEGER NOT NULL DEFAULT 60;
