CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Branch" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Branch" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "ClassType" (
  "id" UUID NOT NULL,
  "branchId" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClassType_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClassType_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ClassType_branchId_code_key" ON "ClassType"("branchId", "code");
CREATE INDEX "ClassType_branchId_active_idx" ON "ClassType"("branchId", "active");

ALTER TABLE "EffectiveConfiguration" ADD COLUMN "classTypeId" UUID;
ALTER TABLE "EffectiveConfiguration" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EffectiveConfiguration" DROP CONSTRAINT "EffectiveConfiguration_effective_range";
ALTER TABLE "EffectiveConfiguration"
  ALTER COLUMN "effectiveFrom" TYPE DATE USING "effectiveFrom"::date,
  ALTER COLUMN "effectiveUntil" TYPE DATE USING "effectiveUntil"::date;
ALTER TABLE "EffectiveConfiguration"
  ADD CONSTRAINT "EffectiveConfiguration_classTypeId_fkey"
  FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EffectiveConfiguration"
  ADD CONSTRAINT "EffectiveConfiguration_effective_range"
  CHECK ("effectiveUntil" IS NULL OR "effectiveUntil" > "effectiveFrom");
ALTER TABLE "EffectiveConfiguration"
  ADD CONSTRAINT "EffectiveConfiguration_no_overlap"
  EXCLUDE USING gist (
    "kind" WITH =,
    "businessKey" WITH =,
    daterange("effectiveFrom", "effectiveUntil", '[)') WITH &&
  );
CREATE INDEX "EffectiveConfiguration_classTypeId_kind_idx" ON "EffectiveConfiguration"("classTypeId", "kind");
