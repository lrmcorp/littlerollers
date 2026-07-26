CREATE TYPE "ClassSlotStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CONFIRMED', 'AUTO_CANCELLED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "ClassSlotCancellationReasonCode" AS ENUM ('STUDIO_UNAVAILABLE', 'INSTRUCTOR_UNAVAILABLE', 'SAFETY_ISSUE', 'OTHER_REVIEW_REQUIRED');

CREATE TABLE "ClassSlot" (
  "id" UUID NOT NULL,
  "branchId" UUID NOT NULL,
  "classTypeId" UUID NOT NULL,
  "instructorUserId" UUID,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "timezone" TEXT NOT NULL,
  "minimumQuota" INTEGER NOT NULL,
  "capacity" INTEGER NOT NULL,
  "bookedCount" INTEGER NOT NULL DEFAULT 0,
  "status" "ClassSlotStatus" NOT NULL DEFAULT 'DRAFT',
  "cancellationReasonCode" "ClassSlotCancellationReasonCode",
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClassSlot_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClassSlot_range_check" CHECK ("startAt" < "endAt"),
  CONSTRAINT "ClassSlot_capacity_check" CHECK ("capacity" >= "minimumQuota" AND "minimumQuota" >= 1 AND "bookedCount" >= 0 AND "bookedCount" <= "capacity"),
  CONSTRAINT "ClassSlot_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClassSlot_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClassSlot_instructorUserId_fkey" FOREIGN KEY ("instructorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "ClassSlot_branchId_startAt_id_idx" ON "ClassSlot"("branchId", "startAt", "id");
CREATE INDEX "ClassSlot_instructorUserId_startAt_endAt_idx" ON "ClassSlot"("instructorUserId", "startAt", "endAt");
CREATE INDEX "ClassSlot_status_startAt_idx" ON "ClassSlot"("status", "startAt");
ALTER TABLE "ClassSlot" ADD CONSTRAINT "ClassSlot_instructor_no_overlap" EXCLUDE USING gist (
  "instructorUserId" WITH =,
  tsrange("startAt", "endAt", '[)') WITH &&
) WHERE ("instructorUserId" IS NOT NULL AND "status" IN ('DRAFT', 'PUBLISHED', 'CONFIRMED'));

ALTER TABLE "SessionReservation" ADD COLUMN "classSlotId" UUID;
ALTER TABLE "SessionReservation" ADD CONSTRAINT "SessionReservation_classSlotId_fkey" FOREIGN KEY ("classSlotId") REFERENCES "ClassSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "SessionReservation_classSlotId_status_idx" ON "SessionReservation"("classSlotId", "status");
