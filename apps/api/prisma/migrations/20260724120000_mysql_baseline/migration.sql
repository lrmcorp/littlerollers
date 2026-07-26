-- CreateTable
CREATE TABLE `User` (
    `id` CHAR(36) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Identity` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `provider` ENUM('GOOGLE', 'WHATSAPP_PHONE', 'EMAIL_PASSWORD') NOT NULL,
    `subjectHash` VARCHAR(191) NOT NULL,
    `verifiedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Identity_userId_idx`(`userId`),
    UNIQUE INDEX `Identity_provider_subjectHash_key`(`provider`, `subjectHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Branch_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassType` (
    `id` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ClassType_branchId_active_idx`(`branchId`, `active`),
    UNIQUE INDEX `ClassType_branchId_code_key`(`branchId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assignment` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `type` ENUM('OWNER', 'INSTRUCTOR') NOT NULL,
    `activeFrom` DATE NOT NULL,
    `activeUntil` DATE NULL,
    `version` INTEGER NOT NULL DEFAULT 0,

    INDEX `Assignment_userId_activeFrom_activeUntil_idx`(`userId`, `activeFrom`, `activeUntil`),
    INDEX `Assignment_branchId_type_activeFrom_activeUntil_idx`(`branchId`, `type`, `activeFrom`, `activeUntil`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstructorAvailability` (
    `id` CHAR(36) NOT NULL,
    `instructorUserId` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `sourceAssignmentId` CHAR(36) NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InstructorAvailability_instructorUserId_startAt_id_idx`(`instructorUserId`, `startAt`, `id`),
    INDEX `InstructorAvailability_branchId_startAt_endAt_idx`(`branchId`, `startAt`, `endAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassSlot` (
    `id` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `classTypeId` CHAR(36) NOT NULL,
    `instructorUserId` CHAR(36) NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,
    `minimumQuota` INTEGER NOT NULL,
    `capacity` INTEGER NOT NULL,
    `bookedCount` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PUBLISHED', 'CONFIRMED', 'AUTO_CANCELLED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `cancellationReasonCode` ENUM('STUDIO_UNAVAILABLE', 'INSTRUCTOR_UNAVAILABLE', 'SAFETY_ISSUE', 'OTHER_REVIEW_REQUIRED') NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ClassSlot_branchId_startAt_id_idx`(`branchId`, `startAt`, `id`),
    INDEX `ClassSlot_instructorUserId_startAt_endAt_idx`(`instructorUserId`, `startAt`, `endAt`),
    INDEX `ClassSlot_status_startAt_idx`(`status`, `startAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuotaEvaluationJob` (
    `id` CHAR(36) NOT NULL,
    `classSlotId` CHAR(36) NOT NULL,
    `evaluationKey` VARCHAR(191) NOT NULL,
    `dueAt` DATETIME(3) NOT NULL,
    `status` ENUM('QUEUED', 'RUNNING', 'RETRYING', 'SUCCEEDED', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `leaseOwner` VARCHAR(191) NULL,
    `leaseExpiresAt` DATETIME(3) NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL,
    `nextAttemptAt` DATETIME(3) NOT NULL,
    `lastErrorCode` VARCHAR(191) NULL,
    `result` JSON NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QuotaEvaluationJob_classSlotId_key`(`classSlotId`),
    UNIQUE INDEX `QuotaEvaluationJob_evaluationKey_key`(`evaluationKey`),
    INDEX `QuotaEvaluationJob_status_dueAt_nextAttemptAt_idx`(`status`, `dueAt`, `nextAttemptAt`),
    INDEX `QuotaEvaluationJob_leaseExpiresAt_idx`(`leaseExpiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRole` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `role` ENUM('CUSTOMER', 'INSTRUCTOR', 'ADMIN', 'MANAGER', 'OWNER', 'SUPER_OWNER', 'FINANCE', 'OPS') NOT NULL,
    `branchId` CHAR(36) NULL,
    `activeFrom` DATETIME(3) NOT NULL,
    `activeUntil` DATETIME(3) NULL,
    `sourceAssignmentId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserRole_sourceAssignmentId_key`(`sourceAssignmentId`),
    INDEX `UserRole_userId_activeFrom_activeUntil_idx`(`userId`, `activeFrom`, `activeUntil`),
    INDEX `UserRole_branchId_role_activeFrom_activeUntil_idx`(`branchId`, `role`, `activeFrom`, `activeUntil`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSession` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `channel` ENUM('WEB', 'MOBILE') NOT NULL,
    `tokenFamilyHash` VARCHAR(191) NOT NULL,
    `accessTokenHash` VARCHAR(191) NOT NULL,
    `refreshTokenHash` VARCHAR(191) NULL,
    `assurance` ENUM('BASE', 'MFA') NOT NULL DEFAULT 'BASE',
    `expiresAt` DATETIME(3) NOT NULL,
    `refreshExpiresAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `revocationReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rotatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `UserSession_accessTokenHash_key`(`accessTokenHash`),
    UNIQUE INDEX `UserSession_refreshTokenHash_key`(`refreshTokenHash`),
    INDEX `UserSession_userId_expiresAt_revokedAt_idx`(`userId`, `expiresAt`, `revokedAt`),
    INDEX `UserSession_tokenFamilyHash_revokedAt_idx`(`tokenFamilyHash`, `revokedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthChallenge` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NULL,
    `kind` ENUM('OTP', 'MFA', 'RECOVERY') NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `subjectHash` VARCHAR(191) NOT NULL,
    `proofHash` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'EXPIRED', 'LOCKED') NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuthChallenge_kind_subjectHash_createdAt_idx`(`kind`, `subjectHash`, `createdAt`),
    INDEX `AuthChallenge_status_expiresAt_idx`(`status`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserInvitation` (
    `id` CHAR(36) NOT NULL,
    `invitedById` CHAR(36) NOT NULL,
    `identityProvider` ENUM('GOOGLE', 'WHATSAPP_PHONE', 'EMAIL_PASSWORD') NOT NULL DEFAULT 'GOOGLE',
    `subjectHash` VARCHAR(191) NOT NULL,
    `emailHash` VARCHAR(191) NULL,
    `displayName` VARCHAR(191) NULL,
    `roles` JSON NOT NULL,
    `branchIds` JSON NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
    `expiresAt` DATETIME(3) NOT NULL,
    `acceptedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserInvitation_identityProvider_subjectHash_status_expiresAt_idx`(`identityProvider`, `subjectHash`, `status`, `expiresAt`),
    INDEX `UserInvitation_emailHash_status_expiresAt_idx`(`emailHash`, `status`, `expiresAt`),
    INDEX `UserInvitation_invitedById_createdAt_idx`(`invitedById`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordCredential` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `emailHash` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `verifiedAt` DATETIME(3) NOT NULL,
    `passwordChangedAt` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PasswordCredential_userId_key`(`userId`),
    UNIQUE INDEX `PasswordCredential_emailHash_key`(`emailHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordActionToken` (
    `id` CHAR(36) NOT NULL,
    `kind` ENUM('ACTIVATION', 'RESET', 'SETUP') NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `emailHash` VARCHAR(191) NOT NULL,
    `userId` CHAR(36) NULL,
    `invitationId` CHAR(36) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `consumedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordActionToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordActionToken_emailHash_kind_expiresAt_idx`(`emailHash`, `kind`, `expiresAt`),
    INDEX `PasswordActionToken_userId_kind_expiresAt_idx`(`userId`, `kind`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TotpCredential` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `secretCiphertext` VARCHAR(191) NOT NULL,
    `verifiedAt` DATETIME(3) NULL,
    `lastUsedStep` BIGINT NULL,
    `recoveryCodes` JSON NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TotpCredential_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateLimitCounter` (
    `id` CHAR(36) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `subjectHash` VARCHAR(191) NOT NULL,
    `windowStart` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 1,
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `RateLimitCounter_expiresAt_idx`(`expiresAt`),
    UNIQUE INDEX `RateLimitCounter_scope_subjectHash_windowStart_key`(`scope`, `subjectHash`, `windowStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` CHAR(36) NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actorType` VARCHAR(191) NOT NULL,
    `actorId` CHAR(36) NULL,
    `branchId` CHAR(36) NULL,
    `action` VARCHAR(191) NOT NULL,
    `objectType` VARCHAR(191) NOT NULL,
    `objectId` VARCHAR(191) NOT NULL,
    `beforeMasked` JSON NULL,
    `afterMasked` JSON NULL,
    `correlationId` VARCHAR(191) NOT NULL,

    INDEX `AuditLog_branchId_occurredAt_idx`(`branchId`, `occurredAt`),
    INDEX `AuditLog_objectType_objectId_occurredAt_idx`(`objectType`, `objectId`, `occurredAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IdempotencyRecord` (
    `id` CHAR(36) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `keyHash` VARCHAR(191) NOT NULL,
    `requestHash` VARCHAR(191) NOT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'IN_PROGRESS',
    `responseStatus` INTEGER NULL,
    `responseBody` JSON NULL,
    `responseHeaders` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `leaseExpiresAt` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `IdempotencyRecord_expiresAt_idx`(`expiresAt`),
    INDEX `IdempotencyRecord_status_leaseExpiresAt_idx`(`status`, `leaseExpiresAt`),
    UNIQUE INDEX `IdempotencyRecord_scope_keyHash_key`(`scope`, `keyHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OutboxEvent` (
    `id` CHAR(36) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `aggregateType` VARCHAR(191) NOT NULL,
    `aggregateId` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `correlationId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PUBLISHED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `publishedAt` DATETIME(3) NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,

    INDEX `OutboxEvent_status_occurredAt_idx`(`status`, `occurredAt`),
    INDEX `OutboxEvent_aggregateType_aggregateId_idx`(`aggregateType`, `aggregateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `classTypeId` CHAR(36) NOT NULL,
    `businessKey` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sessionCount` INTEGER NOT NULL,
    `durationDays` INTEGER NOT NULL,
    `priceRp` INTEGER NOT NULL,
    `effectiveFrom` DATE NOT NULL,
    `effectiveUntil` DATE NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Package_branchId_status_effectiveFrom_effectiveUntil_idx`(`branchId`, `status`, `effectiveFrom`, `effectiveUntil`),
    INDEX `Package_classTypeId_businessKey_effectiveFrom_idx`(`classTypeId`, `businessKey`, `effectiveFrom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentProof` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `packageId` CHAR(36) NULL,
    `objectKey` VARCHAR(191) NOT NULL,
    `checksum` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `uploadStatus` ENUM('ISSUED', 'UPLOADED', 'FINALIZED', 'FAILED') NOT NULL DEFAULT 'ISSUED',
    `scanStatus` ENUM('PENDING', 'CLEAN', 'REJECTED', 'INFECTED', 'ERROR') NOT NULL DEFAULT 'PENDING',
    `providerReferenceHash` VARCHAR(191) NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uploadedAt` DATETIME(3) NULL,
    `finalizedAt` DATETIME(3) NULL,
    `replacedById` CHAR(36) NULL,
    `version` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `PaymentProof_objectKey_key`(`objectKey`),
    INDEX `PaymentProof_userId_branchId_scanStatus_idx`(`userId`, `branchId`, `scanStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Purchase` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `packageId` CHAR(36) NOT NULL,
    `paymentProofId` CHAR(36) NOT NULL,
    `packageNameSnapshot` VARCHAR(191) NOT NULL,
    `priceRpSnapshot` INTEGER NOT NULL,
    `sessionCountSnapshot` INTEGER NOT NULL,
    `durationDaysSnapshot` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `idempotencyKeyHash` VARCHAR(191) NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `decidedAt` DATETIME(3) NULL,
    `decidedById` CHAR(36) NULL,
    `decisionReasonCode` VARCHAR(191) NULL,
    `version` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Purchase_paymentProofId_key`(`paymentProofId`),
    INDEX `Purchase_userId_submittedAt_idx`(`userId`, `submittedAt`),
    INDEX `Purchase_branchId_status_idx`(`branchId`, `status`),
    UNIQUE INDEX `Purchase_userId_idempotencyKeyHash_key`(`userId`, `idempotencyKeyHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerPackage` (
    `id` CHAR(36) NOT NULL,
    `purchaseId` CHAR(36) NOT NULL,
    `customerUserId` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `packageId` CHAR(36) NOT NULL,
    `classTypeId` CHAR(36) NOT NULL,
    `activationDate` DATE NOT NULL,
    `expiryAt` DATETIME(3) NOT NULL,
    `salePriceRp` INTEGER NOT NULL,
    `sessionCountSnapshot` INTEGER NOT NULL,
    `durationDaysSnapshot` INTEGER NOT NULL,
    `projectionRateRp` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CustomerPackage_purchaseId_key`(`purchaseId`),
    INDEX `CustomerPackage_customerUserId_branchId_expiryAt_idx`(`customerUserId`, `branchId`, `expiryAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SessionReservation` (
    `id` CHAR(36) NOT NULL,
    `customerPackageId` CHAR(36) NOT NULL,
    `classSlotId` CHAR(36) NULL,
    `referenceHash` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('ACTIVE', 'RELEASED', 'CONSUMED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `releasedAt` DATETIME(3) NULL,
    `consumedAt` DATETIME(3) NULL,

    INDEX `SessionReservation_customerPackageId_status_createdAt_idx`(`customerPackageId`, `status`, `createdAt`),
    INDEX `SessionReservation_classSlotId_status_idx`(`classSlotId`, `status`),
    UNIQUE INDEX `SessionReservation_customerPackageId_referenceHash_key`(`customerPackageId`, `referenceHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `classSlotId` CHAR(36) NOT NULL,
    `customerUserId` CHAR(36) NOT NULL,
    `customerPackageId` CHAR(36) NOT NULL,
    `reservationId` CHAR(36) NOT NULL,
    `createdById` CHAR(36) NOT NULL,
    `source` ENUM('SELF', 'ADMIN_ASSISTED') NOT NULL,
    `status` ENUM('BOOKED', 'RESCHEDULE_PENDING', 'CANCELLED', 'ATTENDED', 'NO_SHOW') NOT NULL DEFAULT 'BOOKED',
    `reservedQuantity` INTEGER NOT NULL DEFAULT 1,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Booking_reservationId_key`(`reservationId`),
    INDEX `Booking_branchId_createdAt_id_idx`(`branchId`, `createdAt`, `id`),
    INDEX `Booking_customerUserId_createdAt_id_idx`(`customerUserId`, `createdAt`, `id`),
    INDEX `Booking_classSlotId_status_idx`(`classSlotId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reschedule` (
    `id` CHAR(36) NOT NULL,
    `branchId` CHAR(36) NOT NULL,
    `bookingId` CHAR(36) NOT NULL,
    `sourceClassSlotId` CHAR(36) NOT NULL,
    `targetClassSlotId` CHAR(36) NOT NULL,
    `requestedById` CHAR(36) NOT NULL,
    `decidedById` CHAR(36) NULL,
    `requestReasonCode` ENUM('CUSTOMER_SCHEDULE_CONFLICT', 'WRONG_CLASS_SELECTED', 'PERSONAL_UNAVAILABLE') NOT NULL,
    `decisionReasonCode` ENUM('ELIGIBILITY_VERIFIED', 'TARGET_UNAVAILABLE', 'OUTSIDE_POLICY', 'OUT_OF_SCOPE') NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `entitlementCutoffAt` DATETIME(3) NOT NULL,
    `entitledAtRequest` BOOLEAN NOT NULL DEFAULT true,
    `decidedAt` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Reschedule_branchId_status_requestedAt_id_idx`(`branchId`, `status`, `requestedAt`, `id`),
    INDEX `Reschedule_bookingId_requestedAt_idx`(`bookingId`, `requestedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LedgerEntry` (
    `id` CHAR(36) NOT NULL,
    `customerPackageId` CHAR(36) NOT NULL,
    `type` ENUM('PURCHASE', 'MIGRATION_OPENING', 'ATTEND', 'REVERSAL', 'ADJUST_MANUAL') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `referenceType` VARCHAR(191) NOT NULL,
    `referenceId` VARCHAR(191) NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sessionAdjustmentId` CHAR(36) NULL,

    UNIQUE INDEX `LedgerEntry_sessionAdjustmentId_key`(`sessionAdjustmentId`),
    INDEX `LedgerEntry_customerPackageId_occurredAt_idx`(`customerPackageId`, `occurredAt`),
    UNIQUE INDEX `LedgerEntry_type_referenceType_referenceId_key`(`type`, `referenceType`, `referenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SessionAdjustment` (
    `id` CHAR(36) NOT NULL,
    `customerPackageId` CHAR(36) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `reasonCode` ENUM('MIGRATION_CORRECTION', 'ATTENDANCE_CORRECTION', 'PACKAGE_COMPENSATION', 'SUPPORT_RECONCILIATION') NOT NULL,
    `requestedById` CHAR(36) NOT NULL,
    `decidedById` CHAR(36) NULL,
    `decisionCode` ENUM('CORRECTION_VERIFIED', 'INVALID_EVIDENCE', 'DUPLICATE_REQUEST', 'OUT_OF_SCOPE') NULL,
    `status` ENUM('PENDING', 'POSTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `decidedAt` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SessionAdjustment_customerPackageId_createdAt_idx`(`customerPackageId`, `createdAt`),
    INDEX `SessionAdjustment_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EffectiveConfiguration` (
    `id` CHAR(36) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `businessKey` VARCHAR(191) NOT NULL,
    `branchId` CHAR(36) NULL,
    `classTypeId` CHAR(36) NULL,
    `value` JSON NOT NULL,
    `effectiveFrom` DATE NOT NULL,
    `effectiveUntil` DATE NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `approvedEvidence` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EffectiveConfiguration_kind_businessKey_effectiveFrom_effect_idx`(`kind`, `businessKey`, `effectiveFrom`, `effectiveUntil`),
    INDEX `EffectiveConfiguration_branchId_kind_effectiveFrom_idx`(`branchId`, `kind`, `effectiveFrom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Identity` ADD CONSTRAINT `Identity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassType` ADD CONSTRAINT `ClassType_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorAvailability` ADD CONSTRAINT `InstructorAvailability_instructorUserId_fkey` FOREIGN KEY (`instructorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorAvailability` ADD CONSTRAINT `InstructorAvailability_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorAvailability` ADD CONSTRAINT `InstructorAvailability_sourceAssignmentId_fkey` FOREIGN KEY (`sourceAssignmentId`) REFERENCES `Assignment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassSlot` ADD CONSTRAINT `ClassSlot_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassSlot` ADD CONSTRAINT `ClassSlot_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassSlot` ADD CONSTRAINT `ClassSlot_instructorUserId_fkey` FOREIGN KEY (`instructorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuotaEvaluationJob` ADD CONSTRAINT `QuotaEvaluationJob_classSlotId_fkey` FOREIGN KEY (`classSlotId`) REFERENCES `ClassSlot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_sourceAssignmentId_fkey` FOREIGN KEY (`sourceAssignmentId`) REFERENCES `Assignment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuthChallenge` ADD CONSTRAINT `AuthChallenge_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserInvitation` ADD CONSTRAINT `UserInvitation_invitedById_fkey` FOREIGN KEY (`invitedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordCredential` ADD CONSTRAINT `PasswordCredential_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordActionToken` ADD CONSTRAINT `PasswordActionToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordActionToken` ADD CONSTRAINT `PasswordActionToken_invitationId_fkey` FOREIGN KEY (`invitationId`) REFERENCES `UserInvitation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TotpCredential` ADD CONSTRAINT `TotpCredential_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentProof` ADD CONSTRAINT `PaymentProof_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentProof` ADD CONSTRAINT `PaymentProof_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentProof` ADD CONSTRAINT `PaymentProof_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentProof` ADD CONSTRAINT `PaymentProof_replacedById_fkey` FOREIGN KEY (`replacedById`) REFERENCES `PaymentProof`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_paymentProofId_fkey` FOREIGN KEY (`paymentProofId`) REFERENCES `PaymentProof`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerPackage` ADD CONSTRAINT `CustomerPackage_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerPackage` ADD CONSTRAINT `CustomerPackage_customerUserId_fkey` FOREIGN KEY (`customerUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerPackage` ADD CONSTRAINT `CustomerPackage_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerPackage` ADD CONSTRAINT `CustomerPackage_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerPackage` ADD CONSTRAINT `CustomerPackage_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionReservation` ADD CONSTRAINT `SessionReservation_customerPackageId_fkey` FOREIGN KEY (`customerPackageId`) REFERENCES `CustomerPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionReservation` ADD CONSTRAINT `SessionReservation_classSlotId_fkey` FOREIGN KEY (`classSlotId`) REFERENCES `ClassSlot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_classSlotId_fkey` FOREIGN KEY (`classSlotId`) REFERENCES `ClassSlot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_customerUserId_fkey` FOREIGN KEY (`customerUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_customerPackageId_fkey` FOREIGN KEY (`customerPackageId`) REFERENCES `CustomerPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `SessionReservation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reschedule` ADD CONSTRAINT `Reschedule_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reschedule` ADD CONSTRAINT `Reschedule_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reschedule` ADD CONSTRAINT `Reschedule_sourceClassSlotId_fkey` FOREIGN KEY (`sourceClassSlotId`) REFERENCES `ClassSlot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reschedule` ADD CONSTRAINT `Reschedule_targetClassSlotId_fkey` FOREIGN KEY (`targetClassSlotId`) REFERENCES `ClassSlot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reschedule` ADD CONSTRAINT `Reschedule_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reschedule` ADD CONSTRAINT `Reschedule_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LedgerEntry` ADD CONSTRAINT `LedgerEntry_customerPackageId_fkey` FOREIGN KEY (`customerPackageId`) REFERENCES `CustomerPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LedgerEntry` ADD CONSTRAINT `LedgerEntry_sessionAdjustmentId_fkey` FOREIGN KEY (`sessionAdjustmentId`) REFERENCES `SessionAdjustment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionAdjustment` ADD CONSTRAINT `SessionAdjustment_customerPackageId_fkey` FOREIGN KEY (`customerPackageId`) REFERENCES `CustomerPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionAdjustment` ADD CONSTRAINT `SessionAdjustment_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionAdjustment` ADD CONSTRAINT `SessionAdjustment_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EffectiveConfiguration` ADD CONSTRAINT `EffectiveConfiguration_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EffectiveConfiguration` ADD CONSTRAINT `EffectiveConfiguration_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve the database invariants that were previously enforced by PostgreSQL
-- check constraints and partial unique indexes.
ALTER TABLE `Assignment`
    ADD CONSTRAINT `Assignment_effective_range`
    CHECK (`activeUntil` IS NULL OR `activeUntil` > `activeFrom`);

ALTER TABLE `InstructorAvailability`
    ADD CONSTRAINT `InstructorAvailability_range_check`
    CHECK (`startAt` < `endAt`);

ALTER TABLE `ClassSlot`
    ADD CONSTRAINT `ClassSlot_range_check`
    CHECK (`startAt` < `endAt`),
    ADD CONSTRAINT `ClassSlot_capacity_check`
    CHECK (`capacity` >= `minimumQuota` AND `minimumQuota` >= 1 AND `bookedCount` >= 0 AND `bookedCount` <= `capacity`);

ALTER TABLE `QuotaEvaluationJob`
    ADD CONSTRAINT `QuotaEvaluationJob_attempts_check`
    CHECK (`attempts` >= 0 AND `maxAttempts` >= 1);

ALTER TABLE `Package`
    ADD CONSTRAINT `Package_positive_values`
    CHECK (`sessionCount` >= 1 AND `durationDays` >= 1 AND `priceRp` >= 1),
    ADD CONSTRAINT `Package_valid_period`
    CHECK (`effectiveUntil` IS NULL OR `effectiveUntil` > `effectiveFrom`);

ALTER TABLE `PaymentProof`
    ADD CONSTRAINT `PaymentProof_positive_size`
    CHECK (`sizeBytes` >= 1);

ALTER TABLE `CustomerPackage`
    ADD CONSTRAINT `CustomerPackage_positive_snapshots`
    CHECK (`salePriceRp` >= 1 AND `sessionCountSnapshot` >= 1 AND `durationDaysSnapshot` >= 1 AND `projectionRateRp` >= 0),
    ADD CONSTRAINT `CustomerPackage_valid_period`
    CHECK (`expiryAt` > `activationDate`);

ALTER TABLE `SessionReservation`
    ADD CONSTRAINT `SessionReservation_positive_quantity`
    CHECK (`quantity` >= 1),
    ADD CONSTRAINT `SessionReservation_state_consistency`
    CHECK (
      (`status` = 'ACTIVE' AND `releasedAt` IS NULL AND `consumedAt` IS NULL)
      OR (`status` = 'RELEASED' AND `releasedAt` IS NOT NULL AND `consumedAt` IS NULL)
      OR (`status` = 'CONSUMED' AND `consumedAt` IS NOT NULL AND `releasedAt` IS NULL)
    );

ALTER TABLE `Booking`
    ADD CONSTRAINT `Booking_reservedQuantity_check`
    CHECK (`reservedQuantity` = 1);

ALTER TABLE `Reschedule`
    ADD CONSTRAINT `Reschedule_entitled_request_check`
    CHECK (`entitledAtRequest` = true);

ALTER TABLE `LedgerEntry`
    ADD CONSTRAINT `LedgerEntry_nonzero_quantity`
    CHECK (`quantity` <> 0);

ALTER TABLE `SessionAdjustment`
    ADD CONSTRAINT `SessionAdjustment_quantity_check`
    CHECK (`quantity` <> 0);

ALTER TABLE `EffectiveConfiguration`
    ADD CONSTRAINT `EffectiveConfiguration_effective_range`
    CHECK (`effectiveUntil` IS NULL OR `effectiveUntil` > `effectiveFrom`);

-- MySQL unique indexes allow multiple NULL values. Generated nullable keys
-- preserve pending invitation uniqueness without widening the Prisma model.
ALTER TABLE `UserInvitation`
    ADD COLUMN `_pendingProvider` VARCHAR(32)
      GENERATED ALWAYS AS (IF(`status` = 'PENDING', `identityProvider`, NULL)) STORED,
    ADD COLUMN `_pendingSubjectHash` VARCHAR(191)
      GENERATED ALWAYS AS (IF(`status` = 'PENDING', `subjectHash`, NULL)) STORED,
    ADD UNIQUE INDEX `UserInvitation_pending_subject_key` (`_pendingProvider`, `_pendingSubjectHash`);
