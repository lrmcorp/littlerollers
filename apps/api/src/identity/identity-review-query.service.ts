import { HttpStatus, Injectable } from '@nestjs/common';
import {
  type IdentityDocumentKind,
  type IdentityVerificationStatus,
  type PaymentProofScanStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { ApiProblem } from './security';

const STATUSES = new Set<IdentityVerificationStatus>([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'PENDING_DELETION',
  'DELETE_FAILED',
  'DELETED',
]);
const KINDS = new Set<IdentityDocumentKind>(['SELFIE', 'KTP_FRONT']);
const SCAN_STATUSES = new Set<PaymentProofScanStatus>([
  'PENDING',
  'CLEAN',
  'REJECTED',
  'INFECTED',
  'ERROR',
]);

export interface IdentityReviewFilters {
  q?: string;
  status?: string;
  kind?: string;
  scanStatus?: string;
  from?: string;
  until?: string;
  cursor?: string;
  limit?: number;
}

@Injectable()
export class IdentityReviewQueryService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  async list(principal: SessionPrincipal, filters: IdentityReviewFilters = {}) {
    this.policy.requireCapability(principal.capabilities, 'identity-verification:review');
    const status = filters.status as IdentityVerificationStatus | undefined;
    const kind = filters.kind as IdentityDocumentKind | undefined;
    const scanStatus = filters.scanStatus as PaymentProofScanStatus | undefined;
    const limit = filters.limit ?? 20;
    const q = filters.q?.trim();
    if (
      (status && !STATUSES.has(status)) ||
      (kind && !KINDS.has(kind)) ||
      (scanStatus && !SCAN_STATUSES.has(scanStatus)) ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50 ||
      (q?.length ?? 0) > 160
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const from = parseDate(filters.from);
    const until = parseDate(filters.until);
    if (from && until && from > until)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const baseWhere: Prisma.IdentityVerificationDocumentWhereInput = {
      replacedById: null,
      ...(kind ? { kind } : {}),
      ...(scanStatus ? { scanStatus } : {}),
      ...(from || until
        ? { createdAt: { ...(from ? { gte: from } : {}), ...(until ? { lte: until } : {}) } }
        : {}),
      ...(q
        ? {
            OR: [
              { id: q },
              { userId: q },
              { user: { displayName: { contains: q } } },
              { user: { phoneE164: { contains: q } } },
            ],
          }
        : {}),
    };
    const cursor = decodeCursor(filters.cursor);
    const having: Prisma.IdentityVerificationDocumentScalarWhereWithAggregatesInput | undefined =
      cursor
        ? {
            OR: [
              { createdAt: { _min: { gt: cursor.createdAt } } },
              {
                AND: [
                  { createdAt: { _min: { equals: cursor.createdAt } } },
                  { userId: { gt: cursor.userId } },
                ],
              },
            ],
          }
        : undefined;
    const caseWhere: Prisma.IdentityVerificationDocumentWhereInput = {
      ...baseWhere,
      ...(status ? { status } : {}),
    };
    const [
      grouped,
      allGroups,
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      deletionIssues,
    ] = await Promise.all([
      this.db.identityVerificationDocument.groupBy({
        by: ['userId'],
        where: caseWhere,
        _min: { createdAt: true },
        orderBy: [{ _min: { createdAt: 'asc' } }, { userId: 'asc' }],
        ...(having ? { having } : {}),
        take: limit + 1,
      }),
      this.db.identityVerificationDocument.groupBy({ by: ['userId'], where: baseWhere }),
      this.db.identityVerificationDocument.count({ where: baseWhere }),
      this.db.identityVerificationDocument.count({ where: { ...baseWhere, status: 'PENDING' } }),
      this.db.identityVerificationDocument.count({ where: { ...baseWhere, status: 'APPROVED' } }),
      this.db.identityVerificationDocument.count({ where: { ...baseWhere, status: 'REJECTED' } }),
      this.db.identityVerificationDocument.count({
        where: { ...baseWhere, status: { in: ['PENDING_DELETION', 'DELETE_FAILED'] } },
      }),
    ]);
    const hasMore = grouped.length > limit;
    const pageGroups = grouped.slice(0, limit);
    const userIds = pageGroups.map(({ userId }) => userId);
    const documents = userIds.length
      ? await this.db.identityVerificationDocument.findMany({
          where: { replacedById: null, userId: { in: userIds } },
          include: {
            user: {
              select: { id: true, displayName: true, phoneE164: true, status: true },
            },
          },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        })
      : [];
    const byUser = new Map<string, typeof documents>();
    for (const document of documents) {
      const current = byUser.get(document.userId) ?? [];
      current.push(document);
      byUser.set(document.userId, current);
    }
    const items = pageGroups.map((group) => {
      const current = byUser.get(group.userId) ?? [];
      const user = current[0]?.user;
      const activeByKind = [...new Map(current.map((item) => [item.kind, item])).values()];
      const verificationStatus = ['SELFIE', 'KTP_FRONT'].every((documentKind) =>
        activeByKind.some(
          (document) => document.kind === documentKind && document.status === 'APPROVED',
        ),
      )
        ? 'APPROVED'
        : activeByKind.some((document) => document.status === 'REJECTED')
          ? 'ACTION_REQUIRED'
          : 'PENDING';
      return {
        id: group.userId,
        user: {
          id: group.userId,
          displayName: user?.displayName ?? 'Customer',
          phoneMasked: maskPhone(user?.phoneE164),
          status: user?.status ?? 'ACTIVE',
        },
        verificationStatus,
        oldestAt: group._min.createdAt?.toISOString() ?? null,
        documents: activeByKind.map(documentView),
      };
    });
    const last = pageGroups.at(-1);
    return {
      items,
      summary: {
        totalCustomers: allGroups.length,
        totalDocuments,
        pendingDocuments,
        approvedDocuments,
        rejectedDocuments,
        deletionIssues,
      },
      page: {
        hasMore,
        nextCursor:
          hasMore && last?._min.createdAt ? encodeCursor(last._min.createdAt, last.userId) : null,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}

function parseDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  return date;
}

function encodeCursor(createdAt: Date, userId: string) {
  return Buffer.from(JSON.stringify([createdAt.toISOString(), userId])).toString('base64url');
}

function decodeCursor(value?: string) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as unknown;
    if (
      !Array.isArray(parsed) ||
      parsed.length !== 2 ||
      typeof parsed[0] !== 'string' ||
      typeof parsed[1] !== 'string'
    )
      throw new Error('invalid cursor');
    const createdAt = new Date(parsed[0]);
    if (Number.isNaN(createdAt.getTime()) || !parsed[1]) throw new Error('invalid cursor');
    return { createdAt, userId: parsed[1] };
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

function maskPhone(value: string | null | undefined) {
  if (!value) return null;
  return `${value.slice(0, Math.min(4, value.length))}${'*'.repeat(Math.max(2, value.length - 8))}${value.slice(-4)}`;
}

function documentView(document: {
  id: string;
  kind: IdentityDocumentKind;
  status: string;
  uploadStatus: string;
  scanStatus: string;
  mimeType: string;
  sizeBytes: number;
  rejectionReasonCode: string | null;
  rejectionNote: string | null;
  reviewedAt: Date | null;
  deletedAt: Date | null;
  issuedAt: Date;
  uploadedAt: Date | null;
  finalizedAt: Date | null;
  createdAt: Date;
  version: number;
}) {
  return {
    id: document.id,
    kind: document.kind,
    status: document.status,
    uploadStatus: document.uploadStatus,
    scanStatus: document.scanStatus,
    fileName: document.kind === 'SELFIE' ? 'selfie' : 'ktp-front',
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    rejectionReasonCode: document.rejectionReasonCode,
    rejectionNote: document.rejectionNote,
    reviewedAt: document.reviewedAt?.toISOString() ?? null,
    deletedAt: document.deletedAt?.toISOString() ?? null,
    issuedAt: document.issuedAt.toISOString(),
    uploadedAt: document.uploadedAt?.toISOString() ?? null,
    finalizedAt: document.finalizedAt?.toISOString() ?? null,
    createdAt: document.createdAt.toISOString(),
    version: document.version,
  };
}
