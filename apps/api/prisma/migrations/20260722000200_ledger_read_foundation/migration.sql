CREATE TYPE "CustomerPackageStatus" AS ENUM ('ACTIVE','INACTIVE');
CREATE TYPE "SessionReservationStatus" AS ENUM ('ACTIVE','RELEASED','CONSUMED');

ALTER TABLE "CustomerPackage" ADD COLUMN "status" "CustomerPackageStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE TABLE "SessionReservation" (
  "id" UUID NOT NULL,
  "customerPackageId" UUID NOT NULL,
  "referenceHash" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "status" "SessionReservationStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt" TIMESTAMP(3),
  "consumedAt" TIMESTAMP(3),
  CONSTRAINT "SessionReservation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SessionReservation_positive_quantity" CHECK ("quantity" >= 1),
  CONSTRAINT "SessionReservation_state_consistency" CHECK (
    ("status" = 'ACTIVE' AND "releasedAt" IS NULL AND "consumedAt" IS NULL)
    OR ("status" = 'RELEASED' AND "releasedAt" IS NOT NULL AND "consumedAt" IS NULL)
    OR ("status" = 'CONSUMED' AND "consumedAt" IS NOT NULL AND "releasedAt" IS NULL)
  ),
  CONSTRAINT "SessionReservation_customerPackageId_referenceHash_key" UNIQUE ("customerPackageId","referenceHash")
);
ALTER TABLE "SessionReservation" ADD CONSTRAINT "SessionReservation_customerPackageId_fkey" FOREIGN KEY ("customerPackageId") REFERENCES "CustomerPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "SessionReservation_customerPackageId_status_createdAt_idx" ON "SessionReservation"("customerPackageId","status","createdAt");
