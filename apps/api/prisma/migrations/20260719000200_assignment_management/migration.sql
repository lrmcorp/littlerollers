CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Assignment" DROP CONSTRAINT IF EXISTS "Assignment_effective_range";
ALTER TABLE "Assignment"
  ADD CONSTRAINT "Assignment_effective_range"
  CHECK ("activeUntil" IS NULL OR "activeUntil" > "activeFrom");

ALTER TABLE "UserRole" ADD COLUMN "sourceAssignmentId" UUID;
CREATE UNIQUE INDEX "UserRole_sourceAssignmentId_key" ON "UserRole"("sourceAssignmentId");
ALTER TABLE "UserRole"
  ADD CONSTRAINT "UserRole_sourceAssignmentId_fkey"
  FOREIGN KEY ("sourceAssignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Assignment"
  ADD CONSTRAINT "Assignment_no_overlap"
  EXCLUDE USING gist (
    "userId" WITH =,
    "branchId" WITH =,
    "type" WITH =,
    daterange("activeFrom", "activeUntil", '[)') WITH &&
  );

INSERT INTO "UserRole" (
  "id", "userId", "role", "branchId", "activeFrom", "activeUntil", "sourceAssignmentId", "createdAt"
)
SELECT
  gen_random_uuid(),
  assignment."userId",
  assignment."type"::text::"ApplicationRole",
  assignment."branchId",
  assignment."activeFrom"::timestamp AT TIME ZONE branch."timezone",
  CASE
    WHEN assignment."activeUntil" IS NULL THEN NULL
    ELSE assignment."activeUntil"::timestamp AT TIME ZONE branch."timezone"
  END,
  assignment."id",
  CURRENT_TIMESTAMP
FROM "Assignment" assignment
JOIN "Branch" branch ON branch."id" = assignment."branchId"
WHERE NOT EXISTS (
  SELECT 1 FROM "UserRole" role WHERE role."sourceAssignmentId" = assignment."id"
);
