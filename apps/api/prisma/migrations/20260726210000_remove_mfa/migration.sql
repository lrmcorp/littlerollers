-- DailyDose v2 no longer uses multi-factor session assurance.
ALTER TABLE `TotpCredential` DROP FOREIGN KEY `TotpCredential_userId_fkey`;
DROP TABLE `TotpCredential`;

ALTER TABLE `UserSession` DROP COLUMN `assurance`;
ALTER TABLE `AuthChallenge` MODIFY `kind` ENUM('OTP', 'RECOVERY') NOT NULL;
