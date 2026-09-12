import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

export interface DataAudit {
  actorType?: string;
  actorId?: string;
  branchId?: string | null;
  action: string;
  objectType: string;
  objectId: string;
  beforeMasked?: Prisma.InputJsonValue;
  afterMasked?: Prisma.InputJsonValue;
  correlationId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  /**
   * Mencatat aktivitas audit secara non-blocking / log stream
   * tanpa membebani database dengan tabel audit raksasa.
   */
  async catat(_tx: Prisma.TransactionClient | null, data: DataAudit) {
    this.logger.log(
      `[AUDIT] ${data.action} on ${data.objectType}:${data.objectId} by ${data.actorId ?? 'SYSTEM'} (branch: ${data.branchId ?? 'GLOBAL'})`,
    );
    return Promise.resolve();
  }

  async record(data: {
    action: string;
    resourceType?: string;
    resourceId?: string;
    branchId?: string | null;
    actorUserId?: string;
    correlationId?: string;
    details?: Record<string, unknown>;
  }) {
    this.logger.log(
      `[AUDIT] ${data.action} on ${data.resourceType ?? 'RESOURCE'}:${data.resourceId ?? 'NONE'} by ${data.actorUserId ?? 'SYSTEM'}`,
    );
    return Promise.resolve();
  }
}
