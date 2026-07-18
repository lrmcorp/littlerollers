CREATE TYPE "IdempotencyStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

ALTER TABLE "IdempotencyRecord"
  ADD COLUMN "status" "IdempotencyStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  ADD COLUMN "responseHeaders" JSONB,
  ADD COLUMN "completedAt" TIMESTAMP(3),
  ADD COLUMN "leaseExpiresAt" TIMESTAMP(3);

UPDATE "IdempotencyRecord"
SET "leaseExpiresAt" = "createdAt"
WHERE "leaseExpiresAt" IS NULL;

ALTER TABLE "IdempotencyRecord"
  ALTER COLUMN "leaseExpiresAt" SET NOT NULL;

CREATE INDEX "IdempotencyRecord_status_leaseExpiresAt_idx"
  ON "IdempotencyRecord"("status", "leaseExpiresAt");
