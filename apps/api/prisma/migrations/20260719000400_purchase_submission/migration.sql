CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE "PackageStatus" AS ENUM ('ACTIVE','INACTIVE');
CREATE TYPE "PaymentProofUploadStatus" AS ENUM ('ISSUED','UPLOADED','FINALIZED','FAILED');
CREATE TYPE "PaymentProofScanStatus" AS ENUM ('PENDING','CLEAN','REJECTED','INFECTED','ERROR');
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING');

CREATE TABLE "Package" (
  "id" UUID NOT NULL, "branchId" UUID NOT NULL, "classTypeId" UUID NOT NULL,
  "businessKey" TEXT NOT NULL, "name" TEXT NOT NULL, "sessionCount" INTEGER NOT NULL,
  "durationDays" INTEGER NOT NULL, "priceRp" INTEGER NOT NULL, "effectiveFrom" DATE NOT NULL,
  "effectiveUntil" DATE, "status" "PackageStatus" NOT NULL DEFAULT 'ACTIVE', "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Package_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Package_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Package_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
ALTER TABLE "Package" ADD CONSTRAINT "Package_positive_values" CHECK ("sessionCount" >= 1 AND "durationDays" >= 1 AND "priceRp" >= 1);
ALTER TABLE "Package" ADD CONSTRAINT "Package_valid_period" CHECK ("effectiveUntil" IS NULL OR "effectiveUntil" > "effectiveFrom");
CREATE INDEX "Package_branchId_status_effectiveFrom_effectiveUntil_idx" ON "Package"("branchId","status","effectiveFrom","effectiveUntil");
CREATE INDEX "Package_classTypeId_businessKey_effectiveFrom_idx" ON "Package"("classTypeId","businessKey","effectiveFrom");
ALTER TABLE "Package" ADD CONSTRAINT "Package_no_overlap" EXCLUDE USING gist ("branchId" WITH =, "classTypeId" WITH =, "businessKey" WITH =, daterange("effectiveFrom", "effectiveUntil", '[)') WITH &&);

CREATE TABLE "PaymentProof" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "branchId" UUID NOT NULL, "packageId" UUID,
  "objectKey" TEXT NOT NULL, "checksum" TEXT NOT NULL, "fileName" TEXT NOT NULL, "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL, "uploadStatus" "PaymentProofUploadStatus" NOT NULL DEFAULT 'ISSUED',
  "scanStatus" "PaymentProofScanStatus" NOT NULL DEFAULT 'PENDING', "providerReferenceHash" TEXT,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "uploadedAt" TIMESTAMP(3), "finalizedAt" TIMESTAMP(3),
  "replacedById" UUID, "version" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id"), CONSTRAINT "PaymentProof_objectKey_key" UNIQUE ("objectKey"),
  CONSTRAINT "PaymentProof_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "PaymentProof_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "PaymentProof_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_replacedById_fkey" FOREIGN KEY ("replacedById") REFERENCES "PaymentProof"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_positive_size" CHECK ("sizeBytes" >= 1);
CREATE INDEX "PaymentProof_userId_branchId_scanStatus_idx" ON "PaymentProof"("userId","branchId","scanStatus");

CREATE TABLE "Purchase" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "branchId" UUID NOT NULL, "packageId" UUID NOT NULL,
  "paymentProofId" UUID NOT NULL, "packageNameSnapshot" TEXT NOT NULL, "priceRpSnapshot" INTEGER NOT NULL,
  "sessionCountSnapshot" INTEGER NOT NULL, "durationDaysSnapshot" INTEGER NOT NULL, "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
  "idempotencyKeyHash" TEXT NOT NULL, "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "version" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id"), CONSTRAINT "Purchase_paymentProofId_key" UNIQUE ("paymentProofId"), CONSTRAINT "Purchase_userId_idempotencyKeyHash_key" UNIQUE ("userId","idempotencyKeyHash"),
  CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Purchase_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Purchase_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Purchase_paymentProofId_fkey" FOREIGN KEY ("paymentProofId") REFERENCES "PaymentProof"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Purchase_userId_submittedAt_idx" ON "Purchase"("userId","submittedAt");
CREATE INDEX "Purchase_branchId_status_idx" ON "Purchase"("branchId","status");
