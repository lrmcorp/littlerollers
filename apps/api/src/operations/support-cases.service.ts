import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
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

export const inMemorySupportCases: SupportCaseItem[] = [];

@Injectable()
export class SupportCasesService {
  constructor(private readonly db: PrismaService) {}

  async list(principal: SessionPrincipal) {
    if (inMemorySupportCases.length === 0) {
      // Seed an initial sample case if database has customer and branch
      const customer = await this.db.user.findFirst({ where: { role: 'MEMBER' } });
      const branch = await this.db.cabang.findFirst();
      if (customer) {
        inMemorySupportCases.push({
          id: newId(),
          subject: 'Pertanyaan Jadwal & Reschedule Kelas',
          customerUserId: customer.id,
          customer: { id: customer.id, displayName: customer.displayName, email: customer.email },
          branchId: branch?.id ?? null,
          branch: branch ? { id: branch.id, name: branch.name } : null,
          priority: 'NORMAL',
          status: 'OPEN',
          tags: ['reschedule', 'general'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { notes: 1 },
          notes: [
            {
              id: newId(),
              content: 'Customer menanyakan ketentuan batas reschedule H-2 jam.',
              authorName: 'Customer Service',
              createdAt: new Date().toISOString(),
            },
          ],
        });
      }
    }

    return {
      items: inMemorySupportCases,
      summary: {
        total: inMemorySupportCases.length,
        open: inMemorySupportCases.filter((x) => x.status === 'OPEN').length,
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
    const customer = await this.db.user.findUnique({
      where: { id: body.customerUserId },
    });
    if (!customer) {
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const branch = body.branchId
      ? await this.db.cabang.findUnique({ where: { id: body.branchId } })
      : null;

    const item: SupportCaseItem = {
      id: newId(),
      subject: body.subject,
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

  async detail(id: string) {
    const item = inMemorySupportCases.find((x) => x.id === id);
    if (!item) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return item;
  }
}
