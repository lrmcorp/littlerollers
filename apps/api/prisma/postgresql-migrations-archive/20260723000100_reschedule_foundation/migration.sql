CREATE TYPE "RescheduleStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "RescheduleRequestReasonCode" AS ENUM ('CUSTOMER_SCHEDULE_CONFLICT', 'WRONG_CLASS_SELECTED', 'PERSONAL_UNAVAILABLE');
CREATE TYPE "RescheduleDecisionReasonCode" AS ENUM ('ELIGIBILITY_VERIFIED', 'TARGET_UNAVAILABLE', 'OUTSIDE_POLICY', 'OUT_OF_SCOPE');

CREATE TABLE "Reschedule" (
  "id" UUID NOT NULL,
  "branchId" UUID NOT NULL,
  "bookingId" UUID NOT NULL,
  "sourceClassSlotId" UUID NOT NULL,
  "targetClassSlotId" UUID NOT NULL,
  "requestedById" UUID NOT NULL,
  "decidedById" UUID,
  "requestReasonCode" "RescheduleRequestReasonCode" NOT NULL,
  "decisionReasonCode" "RescheduleDecisionReasonCode",
  "status" "RescheduleStatus" NOT NULL DEFAULT 'PENDING',
  "entitlementCutoffAt" TIMESTAMP(3) NOT NULL,
  "entitledAtRequest" BOOLEAN NOT NULL DEFAULT true,
  "decidedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 0,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Reschedule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Reschedule_distinct_slots_check" CHECK ("sourceClassSlotId" <> "targetClassSlotId"),
  CONSTRAINT "Reschedule_entitled_request_check" CHECK ("entitledAtRequest" = true)
);

CREATE INDEX "Reschedule_branchId_status_requestedAt_id_idx" ON "Reschedule"("branchId", "status", "requestedAt", "id");
CREATE INDEX "Reschedule_bookingId_requestedAt_idx" ON "Reschedule"("bookingId", "requestedAt");
CREATE UNIQUE INDEX "Reschedule_pending_booking_key" ON "Reschedule"("bookingId") WHERE "status" = 'PENDING';

ALTER TABLE "Reschedule" ADD CONSTRAINT "Reschedule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reschedule" ADD CONSTRAINT "Reschedule_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reschedule" ADD CONSTRAINT "Reschedule_sourceClassSlotId_fkey" FOREIGN KEY ("sourceClassSlotId") REFERENCES "ClassSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reschedule" ADD CONSTRAINT "Reschedule_targetClassSlotId_fkey" FOREIGN KEY ("targetClassSlotId") REFERENCES "ClassSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reschedule" ADD CONSTRAINT "Reschedule_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reschedule" ADD CONSTRAINT "Reschedule_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
