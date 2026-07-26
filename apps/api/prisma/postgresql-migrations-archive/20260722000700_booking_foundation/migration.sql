CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'RESCHEDULE_PENDING', 'CANCELLED', 'ATTENDED', 'NO_SHOW');
CREATE TYPE "BookingSource" AS ENUM ('SELF', 'ADMIN_ASSISTED');

CREATE TABLE "Booking" (
  "id" UUID NOT NULL,
  "branchId" UUID NOT NULL,
  "classSlotId" UUID NOT NULL,
  "customerUserId" UUID NOT NULL,
  "customerPackageId" UUID NOT NULL,
  "reservationId" UUID NOT NULL,
  "createdById" UUID NOT NULL,
  "source" "BookingSource" NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
  "reservedQuantity" INTEGER NOT NULL DEFAULT 1,
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Booking_reservedQuantity_check" CHECK ("reservedQuantity" = 1)
);

CREATE UNIQUE INDEX "Booking_reservationId_key" ON "Booking"("reservationId");
CREATE INDEX "Booking_branchId_createdAt_id_idx" ON "Booking"("branchId", "createdAt", "id");
CREATE INDEX "Booking_customerUserId_createdAt_id_idx" ON "Booking"("customerUserId", "createdAt", "id");
CREATE INDEX "Booking_classSlotId_status_idx" ON "Booking"("classSlotId", "status");
CREATE UNIQUE INDEX "Booking_active_customer_slot_key"
  ON "Booking"("customerUserId", "classSlotId")
  WHERE "status" IN ('BOOKED', 'RESCHEDULE_PENDING');

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_classSlotId_fkey" FOREIGN KEY ("classSlotId") REFERENCES "ClassSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerPackageId_fkey" FOREIGN KEY ("customerPackageId") REFERENCES "CustomerPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "SessionReservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
