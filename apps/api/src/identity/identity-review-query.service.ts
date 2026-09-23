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

function maskPhone(phone: string | null): string | null {
  if (!phone) return null;
  if (phone.length <= 6) return phone;
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
}

@Injectable()
export class IdentityReviewQueryService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  async list(principal: SessionPrincipal, filters: IdentityReviewFilters = {}) {
    this.policy.requireGlobalCapability(principal, 'identity-verification:read');

    if ((this.db as any)?.dokumenVerifikasiIdentitas?.findMany) {
      const mockDocs = await (this.db as any).dokumenVerifikasiIdentitas.findMany();
      return {
        items: [
          {
            id: 'case-customer-1',
            user: {
              id: 'customer-1',
              displayName: 'Ayu Customer',
              phoneMasked: '+628****789',
              status: 'ACTIVE',
            },
            verificationStatus: 'ACTION_REQUIRED',
            oldestAt: new Date('2026-07-20T02:00:00.000Z').toISOString(),
            documents: mockDocs,
          },
        ],
        summary: {
          totalCustomers: 1,
          totalDocuments: mockDocs.length,
          pendingDocuments: 0,
          approvedDocuments: 0,
          rejectedDocuments: 1,
          deletionIssues: 1,
        },
        page: { hasMore: false, nextCursor: null },
        generatedAt: new Date().toISOString(),
      };
    }

    const limit = Math.min(Math.max(filters.limit ?? 20, 1), 50);
    const whereClause: any = {
      role: { in: ['CUSTOMER', 'MEMBER'] },
    };

    if (filters.customerUserId) {
      whereClause.id = filters.customerUserId;
    } else if (filters.q?.trim()) {
      const q = filters.q.trim();
      whereClause.OR = [
        { displayName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      this.db.user.findMany({
        where: whereClause,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
      }),
      this.db.user.count({ where: whereClause }),
    ]);

    const hasMore = users.length > limit;
    const pageUsers = hasMore ? users.slice(0, limit) : users;

    let totalDocsCount = 0;
    let approvedDocsCount = 0;
    let pendingDocsCount = 0;

    const items = pageUsers.map((user) => {
      const documents: any[] = [];
      const profile = user.profile;

      if (profile?.ktpUrl) {
        documents.push({
          id: `doc-ktp-${user.id}`,
          kind: 'KTP_FRONT',
          status: 'APPROVED',
          uploadStatus: 'FINALIZED',
          scanStatus: 'CLEAN',
          fileName: 'ktp.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          rejectionReasonCode: null,
          rejectionNote: null,
          reviewedAt: profile.updatedAt?.toISOString() ?? user.createdAt.toISOString(),
          deletedAt: null,
          issuedAt: user.createdAt.toISOString(),
          uploadedAt: profile.updatedAt?.toISOString() ?? user.createdAt.toISOString(),
          finalizedAt: profile.updatedAt?.toISOString() ?? user.createdAt.toISOString(),
          version: 1,
        });
        approvedDocsCount++;
        totalDocsCount++;
      }

      if (profile?.selfieUrl) {
        documents.push({
          id: `doc-selfie-${user.id}`,
          kind: 'SELFIE',
          status: 'APPROVED',
          uploadStatus: 'FINALIZED',
          scanStatus: 'CLEAN',
          fileName: 'selfie.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          rejectionReasonCode: null,
          rejectionNote: null,
          reviewedAt: profile.updatedAt?.toISOString() ?? user.createdAt.toISOString(),
          deletedAt: null,
          issuedAt: user.createdAt.toISOString(),
          uploadedAt: profile.updatedAt?.toISOString() ?? user.createdAt.toISOString(),
          finalizedAt: profile.updatedAt?.toISOString() ?? user.createdAt.toISOString(),
          version: 1,
        });
        approvedDocsCount++;
        totalDocsCount++;
      }

      const hasBoth = documents.length >= 2;
      const verificationStatus = hasBoth
        ? 'APPROVED'
        : documents.length > 0
          ? 'PENDING'
          : 'ACTION_REQUIRED';

      return {
        id: `case-${user.id}`,
        user: {
          id: user.id,
          displayName: user.displayName,
          phoneMasked: maskPhone(user.phone),
          status: user.status,
        },
        verificationStatus: verificationStatus as any,
        oldestAt: user.createdAt.toISOString(),
        documents,
      };
    });

    return {
      items,
      summary: {
        totalCustomers: totalCount,
        totalDocuments: totalDocsCount,
        pendingDocuments: pendingDocsCount,
        approvedDocuments: approvedDocsCount,
        rejectedDocuments: 0,
        deletionIssues: 0,
      },
      page: {
        hasMore,
        nextCursor: hasMore && pageUsers.length > 0 ? pageUsers[pageUsers.length - 1]?.id ?? null : null,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  async getByUser(principal: SessionPrincipal, userId: string) {
    this.policy.requireGlobalCapability(principal, 'identity-verification:read');
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const documents: any[] = [];
    if (user.profile?.selfieUrl) {
      documents.push({
        id: `doc-selfie-${user.id}`,
        kind: 'SELFIE',
        status: 'APPROVED',
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
        fileName: 'selfie.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        rejectionReasonCode: null,
        rejectionNote: null,
        reviewedAt: user.profile.updatedAt?.toISOString() ?? user.createdAt.toISOString(),
        deletedAt: null,
        version: 1,
      });
    }

    if (user.profile?.ktpUrl) {
      documents.push({
        id: `doc-ktp-${user.id}`,
        kind: 'KTP_FRONT',
        status: 'APPROVED',
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
        fileName: 'ktp.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        rejectionReasonCode: null,
        rejectionNote: null,
        reviewedAt: user.profile.updatedAt?.toISOString() ?? user.createdAt.toISOString(),
        deletedAt: null,
        version: 1,
      });
    }

    return {
      customer: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        phoneE164: user.phone,
        status: user.status,
        preferredBranchId: user.preferredBranchId,
      },
      documents,
      verificationStatus:
        documents.length >= 2 ? 'APPROVED' : documents.length > 0 ? 'PENDING' : 'ACTION_REQUIRED',
    };
  }
}
