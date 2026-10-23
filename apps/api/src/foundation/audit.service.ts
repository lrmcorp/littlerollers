import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';

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
  reason?: string | null;
  /** Akun pengguna yang terkena aksi; membuat entri muncul di riwayat audit pengguna tersebut. */
  targetUserId?: string | null;
}

type Writer = Pick<Prisma.TransactionClient, 'auditLog'>;

/** Kunci yang tidak boleh masuk jejak audit walau pemanggil lupa menyamarkannya. */
const SENSITIVE_KEY = /password|passwd|secret|token|authorization|accountnumber|cardnumber|^(nik|ktp)$/iu;

/** Salin nilai JSON sambil membuang kunci sensitif dan memotong teks panjang. */
export function scrubAuditValue(value: unknown, depth = 0): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return value.length > 500 ? `${value.slice(0, 500)}…` : value;
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  if (depth >= 4) return '[dipangkas]';
  if (Array.isArray(value))
    return value.slice(0, 50).map((item) => scrubAuditValue(item, depth + 1) ?? null);
  if (typeof value === 'object') {
    const out: Record<string, Prisma.InputJsonValue | null> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY.test(key) && !/masked|changed/iu.test(key)) continue;
      out[key] = scrubAuditValue(item, depth + 1) ?? null;
    }
    return out;
  }
  return String(value);
}

/**
 * Mencatat jejak audit PERMANEN ke tabel `audit_log`.
 *
 * - Bila `tx` diberikan, baris ditulis di transaksi pemanggil sehingga ikut batal bila perubahan batal.
 * - Tanpa `tx`, baris ditulis sendiri. Kegagalan mencatat tidak pernah menggagalkan perubahan yang
 *   sedang berjalan; hanya dilaporkan di log galat.
 * - Nilai sebelum/sesudah dibersihkan (`scrubAuditValue`) sebagai lapis pengaman kedua.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly db: PrismaService) {}

  async catat(tx: Prisma.TransactionClient | null, data: DataAudit) {
    const before = scrubAuditValue(data.beforeMasked);
    const after = scrubAuditValue(data.afterMasked);
    await this.write(tx ?? this.db, {
      action: data.action,
      actorId: data.actorId,
      branchId: data.branchId,
      correlationId: data.correlationId,
      reason: data.reason,
      targetUserId: data.targetUserId,
      objectType: data.objectType,
      objectId: data.objectId,
      detail:
        before !== undefined || after !== undefined
          ? { ...(before !== undefined ? { before } : {}), ...(after !== undefined ? { after } : {}) }
          : undefined,
    });
  }

  /** Bentuk lama; tidak boleh melempar karena pemanggil tidak selalu menunggunya. */
  async record(data: {
    action: string;
    resourceType?: string;
    resourceId?: string;
    branchId?: string | null;
    actorUserId?: string;
    correlationId?: string;
    reason?: string | null;
    details?: Record<string, unknown>;
  }) {
    const details = scrubAuditValue(data.details);
    await this.write(this.db, {
      action: data.action,
      actorId: data.actorUserId,
      branchId: data.branchId,
      correlationId: data.correlationId,
      reason: data.reason,
      objectType: data.resourceType,
      objectId: data.resourceId,
      detail: details !== undefined ? { after: details } : undefined,
    });
  }

  private async write(
    writer: Writer,
    entry: {
      action: string;
      actorId?: string;
      branchId?: string | null;
      correlationId?: string;
      reason?: string | null;
      targetUserId?: string | null;
      objectType?: string;
      objectId?: string;
      detail?: Prisma.InputJsonValue;
    },
  ) {
    this.logger.log(
      `[AUDIT] ${entry.action} on ${entry.objectType ?? 'RESOURCE'}:${entry.objectId ?? 'NONE'} by ${entry.actorId ?? 'SYSTEM'}`,
    );
    try {
      await writer.auditLog.create({
        data: {
          id: randomUUID(),
          action: entry.action.slice(0, 80),
          actorId: entry.actorId?.slice(0, 36) ?? null,
          branchId: entry.branchId?.slice(0, 36) ?? null,
          correlationId: entry.correlationId?.slice(0, 64) ?? null,
          reason: entry.reason?.trim() || null,
          targetUserId: entry.targetUserId?.slice(0, 36) ?? null,
          objectType: entry.objectType?.slice(0, 40) ?? null,
          objectId: entry.objectId?.slice(0, 64) ?? null,
          detail: entry.detail,
        },
      });
    } catch (error) {
      this.logger.error(`Audit gagal dicatat (${entry.action}): ${(error as Error).message}`);
    }
  }
}
