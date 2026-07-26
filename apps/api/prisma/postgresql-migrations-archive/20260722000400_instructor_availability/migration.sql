CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE "InstructorAvailability" (
  "id" UUID NOT NULL,
  "instructorUserId" UUID NOT NULL,
  "branchId" UUID NOT NULL,
  "sourceAssignmentId" UUID NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "timezone" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InstructorAvailability_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InstructorAvailability_range_check" CHECK ("startAt" < "endAt"),
  CONSTRAINT "InstructorAvailability_instructorUserId_fkey" FOREIGN KEY ("instructorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "InstructorAvailability_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "InstructorAvailability_sourceAssignmentId_fkey" FOREIGN KEY ("sourceAssignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "InstructorAvailability_instructorUserId_startAt_id_idx" ON "InstructorAvailability"("instructorUserId", "startAt", "id");
CREATE INDEX "InstructorAvailability_branchId_startAt_endAt_idx" ON "InstructorAvailability"("branchId", "startAt", "endAt");
ALTER TABLE "InstructorAvailability" ADD CONSTRAINT "InstructorAvailability_no_overlap" EXCLUDE USING gist (
  "instructorUserId" WITH =,
  tsrange("startAt", "endAt", '[)') WITH &&
);
