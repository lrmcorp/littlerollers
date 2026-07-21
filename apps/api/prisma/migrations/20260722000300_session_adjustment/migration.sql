CREATE TYPE "SessionAdjustmentStatus" AS ENUM ('PENDING', 'POSTED', 'REJECTED');
CREATE TYPE "SessionAdjustmentReasonCode" AS ENUM ('MIGRATION_CORRECTION', 'ATTENDANCE_CORRECTION', 'PACKAGE_COMPENSATION', 'SUPPORT_RECONCILIATION');
CREATE TYPE "SessionAdjustmentDecisionCode" AS ENUM ('CORRECTION_VERIFIED', 'INVALID_EVIDENCE', 'DUPLICATE_REQUEST', 'OUT_OF_SCOPE');

CREATE TABLE "SessionAdjustment" (
  "id" UUID NOT NULL,
  "customerPackageId" UUID NOT NULL,
  "quantity" INTEGER NOT NULL,
  "reasonCode" "SessionAdjustmentReasonCode" NOT NULL,
  "requestedById" UUID NOT NULL,
  "decidedById" UUID,
  "decisionCode" "SessionAdjustmentDecisionCode",
  "status" "SessionAdjustmentStatus" NOT NULL DEFAULT 'PENDING',
  "decidedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SessionAdjustment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SessionAdjustment_quantity_check" CHECK ("quantity" <> 0),
  CONSTRAINT "SessionAdjustment_decision_check" CHECK (
    ("status" = 'PENDING' AND "decidedById" IS NULL AND "decisionCode" IS NULL AND "decidedAt" IS NULL) OR
    ("status" <> 'PENDING' AND "decidedById" IS NOT NULL AND "decisionCode" IS NOT NULL AND "decidedAt" IS NOT NULL)
  )
);
CREATE INDEX "SessionAdjustment_customerPackageId_createdAt_idx" ON "SessionAdjustment"("customerPackageId", "createdAt");
CREATE INDEX "SessionAdjustment_status_createdAt_idx" ON "SessionAdjustment"("status", "createdAt");
CREATE UNIQUE INDEX "SessionAdjustment_one_pending_per_package" ON "SessionAdjustment"("customerPackageId") WHERE "status" = 'PENDING';
ALTER TABLE "SessionAdjustment" ADD CONSTRAINT "SessionAdjustment_customerPackageId_fkey" FOREIGN KEY ("customerPackageId") REFERENCES "CustomerPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SessionAdjustment" ADD CONSTRAINT "SessionAdjustment_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SessionAdjustment" ADD CONSTRAINT "SessionAdjustment_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LedgerEntry" ADD COLUMN "sessionAdjustmentId" UUID;
CREATE UNIQUE INDEX "LedgerEntry_sessionAdjustmentId_key" ON "LedgerEntry"("sessionAdjustmentId");
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_sessionAdjustmentId_fkey" FOREIGN KEY ("sessionAdjustmentId") REFERENCES "SessionAdjustment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
