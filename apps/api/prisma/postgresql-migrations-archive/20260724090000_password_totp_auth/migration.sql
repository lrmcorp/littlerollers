ALTER TYPE "IdentityProvider" ADD VALUE IF NOT EXISTS 'EMAIL_PASSWORD';

CREATE TYPE "PasswordActionKind" AS ENUM ('ACTIVATION', 'RESET', 'SETUP');

ALTER TABLE "UserInvitation"
ADD COLUMN "emailHash" TEXT,
ADD COLUMN "displayName" TEXT;

CREATE INDEX "UserInvitation_emailHash_status_expiresAt_idx"
ON "UserInvitation"("emailHash", "status", "expiresAt");

CREATE UNIQUE INDEX "UserInvitation_pending_emailHash_key"
ON "UserInvitation"("emailHash")
WHERE "status" = 'PENDING' AND "emailHash" IS NOT NULL;

CREATE TABLE "PasswordCredential" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "emailHash" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "verifiedAt" TIMESTAMP(3) NOT NULL,
  "passwordChangedAt" TIMESTAMP(3) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PasswordCredential_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PasswordCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PasswordCredential_userId_key" ON "PasswordCredential"("userId");
CREATE UNIQUE INDEX "PasswordCredential_emailHash_key" ON "PasswordCredential"("emailHash");

CREATE TABLE "PasswordActionToken" (
  "id" UUID NOT NULL,
  "kind" "PasswordActionKind" NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "emailHash" TEXT NOT NULL,
  "userId" UUID,
  "invitationId" UUID,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordActionToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PasswordActionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "PasswordActionToken_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "UserInvitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PasswordActionToken_tokenHash_key" ON "PasswordActionToken"("tokenHash");
CREATE INDEX "PasswordActionToken_emailHash_kind_expiresAt_idx" ON "PasswordActionToken"("emailHash", "kind", "expiresAt");
CREATE INDEX "PasswordActionToken_userId_kind_expiresAt_idx" ON "PasswordActionToken"("userId", "kind", "expiresAt");

CREATE TABLE "TotpCredential" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "secretCiphertext" TEXT NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "lastUsedStep" BIGINT,
  "recoveryCodes" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TotpCredential_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TotpCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TotpCredential_userId_key" ON "TotpCredential"("userId");

UPDATE "UserInvitation"
SET "status" = 'REVOKED'
WHERE "status" = 'PENDING' AND "emailHash" IS NULL;
