CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

CREATE TABLE "UserInvitation" (
  "id" UUID NOT NULL,
  "invitedById" UUID NOT NULL,
  "identityProvider" "IdentityProvider" NOT NULL DEFAULT 'GOOGLE',
  "subjectHash" TEXT NOT NULL,
  "roles" JSONB NOT NULL,
  "branchIds" JSONB NOT NULL,
  "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "UserInvitation_identityProvider_subjectHash_status_expiresAt_idx" ON "UserInvitation"("identityProvider", "subjectHash", "status", "expiresAt");
CREATE INDEX "UserInvitation_invitedById_createdAt_idx" ON "UserInvitation"("invitedById", "createdAt");
CREATE UNIQUE INDEX "UserInvitation_pending_subject_key" ON "UserInvitation"("identityProvider", "subjectHash") WHERE "status" = 'PENDING';

CREATE TABLE "RateLimitCounter" (
  "id" UUID NOT NULL,
  "scope" TEXT NOT NULL,
  "subjectHash" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 1,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitCounter_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RateLimitCounter_scope_subjectHash_windowStart_key" ON "RateLimitCounter"("scope", "subjectHash", "windowStart");
CREATE INDEX "RateLimitCounter_expiresAt_idx" ON "RateLimitCounter"("expiresAt");
