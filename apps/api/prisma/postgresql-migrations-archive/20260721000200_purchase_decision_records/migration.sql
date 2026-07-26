CREATE TYPE "LedgerEntryType" AS ENUM ('PURCHASE');

ALTER TABLE "Purchase" ADD COLUMN "decidedAt" TIMESTAMP(3), ADD COLUMN "decidedById" UUID, ADD COLUMN "decisionReasonCode" TEXT;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_decision_consistency" CHECK (("status" = 'PENDING' AND "decidedAt" IS NULL AND "decidedById" IS NULL AND "decisionReasonCode" IS NULL) OR ("status" IN ('APPROVED','REJECTED') AND "decidedAt" IS NOT NULL AND "decidedById" IS NOT NULL AND "decisionReasonCode" IS NOT NULL));

CREATE TABLE "CustomerPackage" (
  "id" UUID NOT NULL, "purchaseId" UUID NOT NULL, "customerUserId" UUID NOT NULL, "branchId" UUID NOT NULL, "packageId" UUID NOT NULL, "classTypeId" UUID NOT NULL,
  "activationDate" DATE NOT NULL, "expiryAt" TIMESTAMP(3) NOT NULL, "salePriceRp" INTEGER NOT NULL, "sessionCountSnapshot" INTEGER NOT NULL,
  "durationDaysSnapshot" INTEGER NOT NULL, "projectionRateRp" INTEGER NOT NULL, "version" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerPackage_pkey" PRIMARY KEY ("id"), CONSTRAINT "CustomerPackage_purchaseId_key" UNIQUE ("purchaseId"),
  CONSTRAINT "CustomerPackage_positive_snapshots" CHECK ("salePriceRp" >= 1 AND "sessionCountSnapshot" >= 1 AND "durationDaysSnapshot" >= 1 AND "projectionRateRp" >= 0),
  CONSTRAINT "CustomerPackage_valid_period" CHECK ("expiryAt" > "activationDate")
);
ALTER TABLE "CustomerPackage" ADD CONSTRAINT "CustomerPackage_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerPackage" ADD CONSTRAINT "CustomerPackage_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerPackage" ADD CONSTRAINT "CustomerPackage_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerPackage" ADD CONSTRAINT "CustomerPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerPackage" ADD CONSTRAINT "CustomerPackage_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "CustomerPackage_customerUserId_branchId_expiryAt_idx" ON "CustomerPackage"("customerUserId","branchId","expiryAt");

CREATE TABLE "LedgerEntry" (
  "id" UUID NOT NULL, "customerPackageId" UUID NOT NULL, "type" "LedgerEntryType" NOT NULL, "quantity" INTEGER NOT NULL,
  "referenceType" TEXT NOT NULL, "referenceId" TEXT NOT NULL, "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id"), CONSTRAINT "LedgerEntry_nonzero_quantity" CHECK ("quantity" <> 0),
  CONSTRAINT "LedgerEntry_type_referenceType_referenceId_key" UNIQUE ("type","referenceType","referenceId")
);
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_customerPackageId_fkey" FOREIGN KEY ("customerPackageId") REFERENCES "CustomerPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "LedgerEntry_customerPackageId_occurredAt_idx" ON "LedgerEntry"("customerPackageId","occurredAt");
