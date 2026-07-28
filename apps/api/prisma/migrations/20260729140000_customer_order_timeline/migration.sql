ALTER TABLE `Purchase`
  ADD COLUMN `timelineComplete` BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE `PurchaseTimelineEvent` (
  `id` CHAR(36) NOT NULL,
  `purchaseId` CHAR(36) NOT NULL,
  `eventType` ENUM(
    'ORDER_CREATED',
    'PAYMENT_DEADLINE_SET',
    'PROOF_SUBMITTED',
    'PROOF_SCAN_COMPLETED',
    'ACTION_REQUIRED',
    'PAYMENT_APPROVED',
    'PAYMENT_REJECTED',
    'ORDER_EXPIRED',
    'PACKAGE_ACTIVATED'
  ) NOT NULL,
  `reasonCode` VARCHAR(64) NULL,
  `sourceKey` VARCHAR(191) NOT NULL,
  `derived` BOOLEAN NOT NULL DEFAULT true,
  `occurredAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `PurchaseTimelineEvent_sourceKey_key` (`sourceKey`),
  INDEX `PurchaseTimelineEvent_purchaseId_occurredAt_id_idx` (`purchaseId`, `occurredAt`, `id`),
  CONSTRAINT `PurchaseTimelineEvent_purchaseId_fkey`
    FOREIGN KEY (`purchaseId`) REFERENCES `Purchase` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `PurchaseTimelineEvent`
  (`id`, `purchaseId`, `eventType`, `sourceKey`, `derived`, `occurredAt`)
SELECT UUID(), p.`id`, 'ORDER_CREATED', CONCAT(p.`id`, ':legacy:created'), true, p.`submittedAt`
FROM `Purchase` p;

INSERT INTO `PurchaseTimelineEvent`
  (`id`, `purchaseId`, `eventType`, `sourceKey`, `derived`, `occurredAt`)
SELECT UUID(), p.`id`, 'PAYMENT_DEADLINE_SET', CONCAT(p.`id`, ':legacy:deadline'), true, p.`submittedAt`
FROM `Purchase` p
WHERE p.`paymentExpiresAt` IS NOT NULL;

INSERT INTO `PurchaseTimelineEvent`
  (`id`, `purchaseId`, `eventType`, `sourceKey`, `derived`, `occurredAt`)
SELECT UUID(), p.`id`, 'PROOF_SUBMITTED', CONCAT(p.`id`, ':legacy:proof-submitted'), true,
  COALESCE(pp.`uploadedAt`, pp.`finalizedAt`, p.`submittedAt`)
FROM `Purchase` p
INNER JOIN `PaymentProof` pp ON pp.`id` = p.`paymentProofId`;

INSERT INTO `PurchaseTimelineEvent`
  (`id`, `purchaseId`, `eventType`, `sourceKey`, `derived`, `occurredAt`)
SELECT UUID(), p.`id`, 'PROOF_SCAN_COMPLETED', CONCAT(p.`id`, ':legacy:proof-finalized'), true,
  pp.`finalizedAt`
FROM `Purchase` p
INNER JOIN `PaymentProof` pp ON pp.`id` = p.`paymentProofId`
WHERE pp.`finalizedAt` IS NOT NULL;

INSERT INTO `PurchaseTimelineEvent`
  (`id`, `purchaseId`, `eventType`, `reasonCode`, `sourceKey`, `derived`, `occurredAt`)
SELECT UUID(), p.`id`,
  CASE
    WHEN p.`status` = 'APPROVED' THEN 'PAYMENT_APPROVED'
    WHEN p.`status` = 'ACTION_REQUIRED' THEN 'ACTION_REQUIRED'
    ELSE 'PAYMENT_REJECTED'
  END,
  p.`decisionReasonCode`,
  CONCAT(p.`id`, ':legacy:decision'),
  true,
  p.`decidedAt`
FROM `Purchase` p
WHERE p.`status` IN ('APPROVED', 'ACTION_REQUIRED', 'REJECTED')
  AND p.`decidedAt` IS NOT NULL;

INSERT INTO `PurchaseTimelineEvent`
  (`id`, `purchaseId`, `eventType`, `sourceKey`, `derived`, `occurredAt`)
SELECT UUID(), p.`id`, 'ORDER_EXPIRED', CONCAT(p.`id`, ':legacy:expired'), true, p.`paymentExpiresAt`
FROM `Purchase` p
WHERE p.`status` = 'EXPIRED' AND p.`paymentExpiresAt` IS NOT NULL;

INSERT INTO `PurchaseTimelineEvent`
  (`id`, `purchaseId`, `eventType`, `sourceKey`, `derived`, `occurredAt`)
SELECT UUID(), p.`id`, 'PACKAGE_ACTIVATED', CONCAT(p.`id`, ':legacy:activated'), true, cp.`createdAt`
FROM `Purchase` p
INNER JOIN `CustomerPackage` cp ON cp.`purchaseId` = p.`id`;
