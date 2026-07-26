CREATE TYPE "QuotaEvaluationJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'RETRYING', 'SUCCEEDED', 'FAILED');

CREATE TABLE "QuotaEvaluationJob" (
  "id" UUID NOT NULL,
  "classSlotId" UUID NOT NULL,
  "evaluationKey" TEXT NOT NULL,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "status" "QuotaEvaluationJobStatus" NOT NULL DEFAULT 'QUEUED',
  "leaseOwner" TEXT,
  "leaseExpiresAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL,
  "lastErrorCode" TEXT,
  "result" JSONB,
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuotaEvaluationJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "QuotaEvaluationJob_attempts_check" CHECK ("attempts" >= 0 AND "maxAttempts" >= 1),
  CONSTRAINT "QuotaEvaluationJob_classSlotId_fkey" FOREIGN KEY ("classSlotId") REFERENCES "ClassSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "QuotaEvaluationJob_classSlotId_key" ON "QuotaEvaluationJob"("classSlotId");
CREATE UNIQUE INDEX "QuotaEvaluationJob_evaluationKey_key" ON "QuotaEvaluationJob"("evaluationKey");
CREATE INDEX "QuotaEvaluationJob_status_dueAt_nextAttemptAt_idx" ON "QuotaEvaluationJob"("status", "dueAt", "nextAttemptAt");
CREATE INDEX "QuotaEvaluationJob_leaseExpiresAt_idx" ON "QuotaEvaluationJob"("leaseExpiresAt");

INSERT INTO "QuotaEvaluationJob" (
  "id", "classSlotId", "evaluationKey", "dueAt", "status", "maxAttempts", "nextAttemptAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  slot."id",
  'H24:' || slot."id",
  slot."startAt" - INTERVAL '24 hours',
  'QUEUED'::"QuotaEvaluationJobStatus",
  5,
  slot."startAt" - INTERVAL '24 hours',
  CURRENT_TIMESTAMP
FROM "ClassSlot" slot
WHERE slot."status" = 'PUBLISHED'
ON CONFLICT ("classSlotId") DO NOTHING;
