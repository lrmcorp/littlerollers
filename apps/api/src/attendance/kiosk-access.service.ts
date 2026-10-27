import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { createHash, createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../foundation/audit.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { RateLimitService } from '../identity/rate-limit.service';
import { ApiProblem } from '../identity/security';

/** Token tablet berlaku 30 hari; mengganti PIN langsung mencabut semua token lama. */
const TOKEN_TTL_SECONDS = 30 * 24 * 3600;
const UNLOCK_ATTEMPTS_PER_CLIENT = 6;
const UNLOCK_ATTEMPTS_PER_BRANCH = 30;
const UNLOCK_WINDOW_SECONDS = 900;

const secret = () => process.env.SESSION_SECRET || 'dailydose-kiosk-secret';
const hmac = (data: string) => createHmac('sha256', secret()).update(data).digest('hex');
const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

/**
 * Akses tablet kiosk presensi. Halaman kiosk memuat QR presensi instruktur, jadi tidak boleh terbuka untuk
 * umum: tablet membuka kunci sekali dengan PIN cabang (6 digit, dibuat staf), lalu memakai token berumur 30 hari.
 */
@Injectable()
export class KioskAccessService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly rateLimit: RateLimitService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  private async findBranch(branchCode: string) {
    const normalized = branchCode?.trim();
    if (!normalized) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const branch = await this.db.cabang.findFirst({
      where: { OR: [{ code: normalized.toUpperCase() }, { id: normalized }], active: true },
      select: { id: true, code: true, name: true, kioskPinHash: true },
    });
    if (!branch) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return branch;
  }

  private pinHash(branchId: string, pin: string) {
    return hmac(`kiosk-pin:${branchId}:${pin}`);
  }

  private tokenFor(branchId: string, pinHash: string, expiresAt: number) {
    return `${expiresAt}.${hmac(`kiosk-token:${branchId}:${expiresAt}:${pinHash}`)}`;
  }

  /** Tablet memasukkan PIN; bila benar, kembalikan token untuk dipakai pada permintaan berikutnya. */
  async unlock(branchCode: string, pin: unknown, clientKey: string, now = new Date()) {
    const branch = await this.findBranch(branchCode);
    const candidate = typeof pin === 'string' ? pin.trim() : '';
    if (!/^\d{6}$/.test(candidate))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
        { field: 'pin', issue: 'INVALID' },
      ]);
    // Dibatasi per tablet/alamat dan per cabang supaya 1 juta kemungkinan PIN tidak bisa ditebak.
    const client = createHash('sha256').update(`${branch.id}:${clientKey}`).digest('hex');
    await this.rateLimit.consume('kiosk-unlock', client, UNLOCK_ATTEMPTS_PER_CLIENT, UNLOCK_WINDOW_SECONDS);
    await this.rateLimit.consume('kiosk-unlock-branch', branch.id, UNLOCK_ATTEMPTS_PER_BRANCH, UNLOCK_WINDOW_SECONDS);

    if (!branch.kioskPinHash) throw new ApiProblem('KIOSK_NOT_CONFIGURED', HttpStatus.FORBIDDEN);
    if (!safeEqual(this.pinHash(branch.id, candidate), branch.kioskPinHash))
      throw new ApiProblem('KIOSK_PIN_INVALID', HttpStatus.FORBIDDEN);

    const expiresAt = Math.floor(now.getTime() / 1000) + TOKEN_TTL_SECONDS;
    return {
      token: this.tokenFor(branch.id, branch.kioskPinHash, expiresAt),
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    };
  }

  /** Pastikan token tablet sah untuk cabang ini; melempar `KIOSK_LOCKED` (401) bila tidak. */
  async requireAccess(branchCode: string, token: string | undefined, now = new Date()) {
    const branch = await this.findBranch(branchCode);
    const locked = () => new ApiProblem('KIOSK_LOCKED', HttpStatus.UNAUTHORIZED);
    const [expiresRaw, signature] = (token ?? '').split('.');
    const expiresAt = Number(expiresRaw);
    if (!branch.kioskPinHash || !signature || !Number.isInteger(expiresAt)) throw locked();
    if (expiresAt * 1000 <= now.getTime()) throw locked();
    const expected = this.tokenFor(branch.id, branch.kioskPinHash, expiresAt);
    if (!safeEqual(expected, `${expiresRaw}.${signature}`)) throw locked();
    return branch;
  }

  private requireBranchAccess(principal: SessionPrincipal, branchId: string) {
    this.policy.requireCapability(principal.capabilities, 'branch:manage');
    if (!this.policy.hasCapability(principal, 'branch:manage', branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  /** Cabang yang boleh diatur staf ini, beserta apakah PIN-nya sudah dibuat. PIN tidak pernah ditampilkan ulang. */
  async list(principal: SessionPrincipal) {
    this.policy.requireCapability(principal.capabilities, 'branch:manage');
    const scope = this.policy.capabilityBranchScope(principal, 'branch:manage');
    const branches = await this.db.cabang.findMany({
      where: { active: true, ...(scope.all ? {} : { id: { in: scope.included } }) },
      select: { id: true, code: true, name: true, kioskPinHash: true, kioskPinUpdatedAt: true },
      orderBy: { name: 'asc' },
    });
    return {
      items: branches.map((branch) => ({
        branchId: branch.id,
        code: branch.code,
        name: branch.name,
        configured: Boolean(branch.kioskPinHash),
        updatedAt: branch.kioskPinUpdatedAt?.toISOString() ?? null,
      })),
    };
  }

  /** Buat PIN baru (6 digit acak). Dikembalikan satu kali; PIN lama dan semua token tablet lama langsung tidak berlaku. */
  async rotatePin(principal: SessionPrincipal, branchId: string, correlationId: string) {
    this.requireBranchAccess(principal, branchId);
    const branch = await this.db.cabang.findUnique({ where: { id: branchId }, select: { id: true, code: true } });
    if (!branch) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const pin = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const updatedAt = new Date();
    await this.db.cabang.update({
      where: { id: branchId },
      data: { kioskPinHash: this.pinHash(branchId, pin), kioskPinUpdatedAt: updatedAt },
    });
    await this.audit?.catat(null, {
      actorId: principal.userId,
      branchId,
      correlationId,
      action: 'kiosk.pin_rotated',
      objectType: 'Branch',
      objectId: branchId,
      afterMasked: { code: branch.code },
    });
    return { branchId, code: branch.code, pin, updatedAt: updatedAt.toISOString() };
  }
}
