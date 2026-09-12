import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { ApiProblem } from './security';

export interface IdentityReviewFilters {
  q?: string;
  status?: string;
  kind?: string;
  scanStatus?: string;
  from?: string;
  until?: string;
  cursor?: string;
  limit?: number;
  customerUserId?: string;
}

@Injectable()
export class IdentityReviewQueryService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  async list(principal: SessionPrincipal, _filters: IdentityReviewFilters = {}) {
    this.policy.requireGlobalCapability(principal, 'identity-verification:read');
    return {
      items: [],
      summary: { total: 0, pending: 0, approved: 0, rejected: 0 },
      page: { hasMore: false, nextCursor: null },
    };
  }

  async getByUser(principal: SessionPrincipal, userId: string) {
    this.policy.requireGlobalCapability(principal, 'identity-verification:read');
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    return {
      customer: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        phoneE164: user.phone,
        status: user.status,
        preferredBranchId: user.preferredBranchId,
      },
      documents: [],
      verificationStatus: 'APPROVED' as const,
    };
  }
}
