import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';

type DataAudit = Omit<Prisma.AuditLogUncheckedCreateInput, 'id' | 'occurredAt'>;

@Injectable()
export class AuditService {
  /**
   * Mencatat aktivitas audit di dalam transaksi yang sedang berjalan.
   *
   * Transaction diberikan oleh service pemanggil agar audit tersimpan
   * secara atomik bersama perubahan bisnis yang sedang dilakukan.
   */
  catat(tx: Prisma.TransactionClient, data: DataAudit) {
    return tx.auditLog.create({
      data: {
        id: randomUUID(),
        ...data,
      },
    });
  }
}
