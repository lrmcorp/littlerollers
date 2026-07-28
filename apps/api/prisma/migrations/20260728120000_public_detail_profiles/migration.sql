CREATE TABLE `BranchPublicProfile` (
  `branchId` CHAR(36) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `area` VARCHAR(191) NOT NULL,
  `city` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NOT NULL,
  `latitude` DOUBLE NULL,
  `longitude` DOUBLE NULL,
  `openingHours` JSON NOT NULL,
  `description` TEXT NOT NULL,
  `arrivalInformation` TEXT NULL,
  `parkingInformation` TEXT NULL,
  `amenities` JSON NOT NULL,
  `heroImageKey` VARCHAR(191) NOT NULL,
  `galleryImageKeys` JSON NOT NULL,
  `version` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `BranchPublicProfile_slug_key`(`slug`),
  INDEX `BranchPublicProfile_city_area_idx`(`city`, `area`),
  PRIMARY KEY (`branchId`),
  CONSTRAINT `BranchPublicProfile_branchId_fkey`
    FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PublicClassProfile` (
  `code` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `summary` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `level` VARCHAR(191) NOT NULL,
  `durationMinutes` INTEGER NOT NULL,
  `equipment` JSON NOT NULL,
  `benefits` JSON NOT NULL,
  `heroImageKey` VARCHAR(191) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `version` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `PublicClassProfile_slug_key`(`slug`),
  PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PackagePublicProfile` (
  `packageId` CHAR(36) NOT NULL,
  `summary` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `highlights` JSON NOT NULL,
  `usageGuidance` TEXT NOT NULL,
  `terms` JSON NOT NULL,
  `version` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`packageId`),
  CONSTRAINT `PackagePublicProfile_packageId_fkey`
    FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
