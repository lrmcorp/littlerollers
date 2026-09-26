import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';

export interface SupportCaseItem {
  id: string;
  subject: string;
  customerUserId: string;
  customer: { id: string; displayName: string; email?: string | null };
  branchId: string | null;
  branch: { id: string; name: string } | null;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  _count: { notes: number };
  notes: Array<{ id: string; content: string; authorName: string; createdAt: string }>;
}

// Penyimpanan sementara (hilang saat API restart). Halaman Bantuan diberi label Pratinjau di web
// sampai kasus dipindahkan ke tabel database.
export const inMemorySupportCases: SupportCaseItem[] = [];

@Injectable()
export class SupportCasesService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  /** Kasus berlabel cabang mengikuti cakupan cabang; kasus tanpa cabang hanya untuk `branch:all`. */
  private canSee(principal: SessionPrincipal, item: SupportCaseItem) {
    return item.branchId
      ? this.policy.hasCapability(principal, 'support:read', item.branchId)
      : this.policy.capabilityBranchScope(principal, 'support:read').all;
  }

  async list(principal: SessionPrincipal) {
    this.policy.requireCapability(principal.capabilities, 'support:read');
    const items = inMemorySupportCases.filter((item) => this.canSee(principal, item));
    return {
      items,
      summary: {
        total: items.length,
        open: items.filter((x) => x.status === 'OPEN').length,
      },
    };
  }

  async create(
    principal: SessionPrincipal,
    body: {
      customerUserId: string;
      branchId?: string | null;
      subject: string;
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      tags?: string[];
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'support:manage');
    const subject = body?.subject?.trim();
    if (!subject || subject.length > 200)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (body.branchId) {
      if (!this.policy.hasCapability(principal, 'support:manage', body.branchId))
        throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    } else if (!this.policy.capabilityBranchScope(principal, 'support:manage').all) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const customer = await this.db.user.findUnique({
      where: { id: body.customerUserId },
    });
    if (!customer) {
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const branch = body.branchId
      ? await this.db.cabang.findUnique({ where: { id: body.branchId } })
      : null;
    if (body.branchId && !branch) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const item: SupportCaseItem = {
      id: newId(),
      subject,
      customerUserId: customer.id,
      customer: { id: customer.id, displayName: customer.displayName, email: customer.email },
      branchId: branch?.id ?? null,
      branch: branch ? { id: branch.id, name: branch.name } : null,
      priority: body.priority ?? 'NORMAL',
      status: 'OPEN',
      tags: body.tags ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { notes: 0 },
      notes: [],
    };

    inMemorySupportCases.unshift(item);
    return item;
  }

  async detail(principal: SessionPrincipal, id: string) {
    this.policy.requireCapability(principal.capabilities, 'support:read');
    const item = inMemorySupportCases.find((x) => x.id === id);
    if (!item || !this.canSee(principal, item))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return item;
  }
}
