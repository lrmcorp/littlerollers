CREATE TYPE "ApplicationRole" AS ENUM ('CUSTOMER', 'INSTRUCTOR', 'ADMIN', 'MANAGER', 'OWNER', 'SUPER_OWNER', 'FINANCE', 'OPS');
CREATE TYPE "SessionChannel" AS ENUM ('WEB', 'MOBILE');
CREATE TYPE "AssuranceLevel" AS ENUM ('BASE', 'MFA');
CREATE TYPE "ChallengeKind" AS ENUM ('OTP', 'MFA', 'RECOVERY');
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'LOCKED');

CREATE TABLE "UserRole" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "role" "ApplicationRole" NOT NULL,
  "branchId" UUID,
  "activeFrom" TIMESTAMP(3) NOT NULL,
  "activeUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "UserRole_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "UserRole_userId_activeFrom_activeUntil_idx" ON "UserRole"("userId", "activeFrom", "activeUntil");
CREATE INDEX "UserRole_branchId_role_activeFrom_activeUntil_idx" ON "UserRole"("branchId", "role", "activeFrom", "activeUntil");

CREATE TABLE "UserSession" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "channel" "SessionChannel" NOT NULL,
  "tokenFamilyHash" TEXT NOT NULL,
  "accessTokenHash" TEXT NOT NULL,
  "refreshTokenHash" TEXT,
  "assurance" "AssuranceLevel" NOT NULL DEFAULT 'BASE',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "refreshExpiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "revocationReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "rotatedAt" TIMESTAMP(3),
  CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "UserSession_tokenFamilyHash_revokedAt_idx" ON "UserSession"("tokenFamilyHash", "revokedAt");
CREATE UNIQUE INDEX "UserSession_accessTokenHash_key" ON "UserSession"("accessTokenHash");
CREATE UNIQUE INDEX "UserSession_refreshTokenHash_key" ON "UserSession"("refreshTokenHash");
CREATE INDEX "UserSession_userId_expiresAt_revokedAt_idx" ON "UserSession"("userId", "expiresAt", "revokedAt");

CREATE TABLE "AuthChallenge" (
  "id" UUID NOT NULL,
  "userId" UUID,
  "kind" "ChallengeKind" NOT NULL,
  "purpose" TEXT NOT NULL,
  "subjectHash" TEXT NOT NULL,
  "proofHash" TEXT NOT NULL,
  "status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuthChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "AuthChallenge_kind_subjectHash_createdAt_idx" ON "AuthChallenge"("kind", "subjectHash", "createdAt");
CREATE INDEX "AuthChallenge_status_expiresAt_idx" ON "AuthChallenge"("status", "expiresAt");
