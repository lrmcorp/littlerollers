import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma, type PublicContent } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../foundation/audit.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, ENTITY_ID_REGEX } from '../identity/security';
import { FAQ_CONTENT_KEY, FAQ_KIND, validateFaq } from './faq.validation';
import { HERO_CONTENT_KEY, HERO_KIND, validateHeroCarousel } from './hero-carousel.validation';

export type ManagedContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

const GLOBAL_SCOPE = 'GLOBAL';
const DEFAULT_LOCALE = 'id-ID';

/** Jenis konten yang benar-benar dibaca situs publik. Konten tanpa pembaca tidak boleh disimpan. */
const SUPPORTED_KINDS: Record<string, { contentKey: string; validate(payload: unknown): unknown }> = {
  [HERO_KIND]: { contentKey: HERO_CONTENT_KEY, validate: validateHeroCarousel },
  [FAQ_KIND]: { contentKey: FAQ_CONTENT_KEY, validate: validateFaq },
};

const invalid = (field: string, issue = 'INVALID') =>
  new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [{ field, issue }]);

@Injectable()
export class PublicContentManagementService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  /** Jejak audit permanen; isi konten tidak disalin (bisa besar), cukup identitas dan versinya. */
  private async record(
    principal: SessionPrincipal,
    correlationId: string,
    action: string,
    row: { id: string; contentKey: string; kind: string; version: number; status: string },
    before?: { status: string },
  ) {
    await this.audit?.catat(null, {
      actorId: principal.userId,
      correlationId,
      action,
      objectType: 'PublicContent',
      objectId: row.id,
      beforeMasked: before,
      afterMasked: {
        contentKey: row.contentKey,
        kind: row.kind,
        version: row.version,
        status: row.status,
      },
    });
  }

  private view(row: PublicContent) {
    return {
      id: row.id,
      contentKey: row.contentKey,
      branchId: row.branchId,
      scopeKey: row.scopeKey,
      kind: row.kind,
      locale: row.locale,
      version: row.version,
      status: row.status,
      payload: row.payload,
      createdById: row.createdById,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      publishedAt: row.publishedAt?.toISOString() ?? null,
      archivedAt: row.archivedAt?.toISOString() ?? null,
    };
  }

  /** Konten global memengaruhi seluruh situs, jadi hanya pemegang `branch:all` yang boleh mengubahnya. */
  private assertManage(principal: SessionPrincipal, branchId: string | null) {
    this.policy.requireCapability(principal.capabilities, 'public-content:manage');
    const allowed = branchId
      ? this.policy.hasCapability(principal, 'public-content:manage', branchId)
      : this.policy.capabilityBranchScope(principal, 'public-content:manage').all;
    if (!allowed) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  private async load(id: string) {
    if (!ENTITY_ID_REGEX.test(id)) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const row = await this.db.publicContent.findUnique({ where: { id } });
    if (!row) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return row;
  }

  async list(
    principal: SessionPrincipal,
    input: { branchId?: string; kind?: string; status?: ManagedContentStatus },
  ) {
    this.policy.requireCapability(principal.capabilities, 'public-content:read');
    if (input.status && !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(input.status))
      throw invalid('status');
    const scope = this.policy.capabilityBranchScope(principal, 'public-content:read');
    const rows = await this.db.publicContent.findMany({
      where: {
        AND: [
          input.kind ? { kind: input.kind.toUpperCase() } : {},
          input.status ? { status: input.status } : {},
          input.branchId ? { branchId: input.branchId } : {},
          // Konten global hanya terlihat pemegang cakupan semua cabang; konten cabang mengikuti cakupan.
          scope.all ? {} : { branchId: { in: scope.included } },
        ],
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: 100,
    });
    return rows.map((row) => this.view(row));
  }

  async create(
    principal: SessionPrincipal,
    input: {
      contentKey?: string;
      branchId?: string | null;
      kind: string;
      locale?: string;
      payload: unknown;
    },
    _correlationId: string,
  ) {
    const kind = input.kind?.trim().toUpperCase();
    const supported = SUPPORTED_KINDS[kind];
    if (!supported) throw invalid('kind', 'UNSUPPORTED');
    const contentKey = (input.contentKey?.trim() || supported.contentKey).toUpperCase();
    if (contentKey !== supported.contentKey) throw invalid('contentKey', 'UNSUPPORTED');
    if (input.branchId) throw invalid('branchId', 'GLOBAL_ONLY');
    this.assertManage(principal, null);
    const locale = input.locale?.trim() || DEFAULT_LOCALE;
    if (locale.length > 10) throw invalid('locale');
    const payload = supported.validate(input.payload) as Prisma.InputJsonValue;

    const draft = await this.nextDraft(principal.userId, { contentKey, kind, locale, payload });
    await this.record(principal, _correlationId, 'public_content.draft_created', draft);
    return draft;
  }

  private async nextDraft(
    createdById: string,
    data: { contentKey: string; kind: string; locale: string; payload: Prisma.InputJsonValue },
  ) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const latest = await this.db.publicContent.aggregate({
        where: { contentKey: data.contentKey, scopeKey: GLOBAL_SCOPE, locale: data.locale },
        _max: { version: true },
      });
      try {
        const created = await this.db.publicContent.create({
          data: {
            ...data,
            scopeKey: GLOBAL_SCOPE,
            branchId: null,
            version: (latest._max.version ?? 0) + 1,
            status: 'DRAFT',
            createdById,
          },
        });
        return this.view(created);
      } catch (error) {
        // Dua draf dibuat bersamaan mendapat nomor versi yang sama; ulangi dengan nomor berikutnya.
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'))
          throw error;
      }
    }
    throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
  }

  /** Ubah isi draf. Konten yang sudah terbit atau diarsipkan tidak diubah; buat draf baru dari salinannya. */
  async updateDraft(
    principal: SessionPrincipal,
    id: string,
    input: { payload: unknown },
    _correlationId: string,
  ) {
    const current = await this.load(id);
    this.assertManage(principal, current.branchId);
    const supported = SUPPORTED_KINDS[current.kind];
    if (!supported) throw invalid('kind', 'UNSUPPORTED');
    const payload = supported.validate(input?.payload) as Prisma.InputJsonValue;

    const claimed = await this.db.publicContent.updateMany({
      where: { id, status: 'DRAFT' },
      data: { payload },
    });
    if (claimed.count !== 1) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
    const updated = this.view(await this.load(id));
    await this.record(principal, _correlationId, 'public_content.draft_updated', updated);
    return updated;
  }

  /** Salin konten (status apa pun) menjadi draf versi berikutnya. */
  async duplicate(principal: SessionPrincipal, id: string, _correlationId: string) {
    const current = await this.load(id);
    this.assertManage(principal, current.branchId);
    const draft = await this.nextDraft(principal.userId, {
      contentKey: current.contentKey,
      kind: current.kind,
      locale: current.locale,
      payload: current.payload as Prisma.InputJsonValue,
    });
    await this.record(principal, _correlationId, 'public_content.duplicated', draft, {
      status: current.status,
    });
    return draft;
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: 'PUBLISHED' | 'ARCHIVED',
    _correlationId: string,
  ) {
    if (status !== 'PUBLISHED' && status !== 'ARCHIVED') throw invalid('status');
    const current = await this.load(id);
    this.assertManage(principal, current.branchId);
    const now = new Date();

    if (status === 'PUBLISHED') {
      await this.db.$transaction(async (tx) => {
        const claimed = await tx.publicContent.updateMany({
          where: { id, status: 'DRAFT' },
          data: { status: 'PUBLISHED', publishedAt: now },
        });
        if (claimed.count !== 1) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
        await tx.publicContent.updateMany({
          where: {
            contentKey: current.contentKey,
            scopeKey: current.scopeKey,
            locale: current.locale,
            status: 'PUBLISHED',
            id: { not: id },
          },
          data: { status: 'ARCHIVED', archivedAt: now },
        });
      });
    } else {
      const claimed = await this.db.publicContent.updateMany({
        where: { id, status: { not: 'ARCHIVED' } },
        data: { status: 'ARCHIVED', archivedAt: now },
      });
      if (claimed.count !== 1) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
    }
    const result = this.view(await this.load(id));
    await this.record(
      principal,
      _correlationId,
      status === 'PUBLISHED' ? 'public_content.published' : 'public_content.archived',
      result,
      { status: current.status },
    );
    return result;
  }
}
