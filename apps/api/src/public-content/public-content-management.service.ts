import { HttpStatus, Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';

export interface PublicContentItem {
  id: string;
  contentKey: string;
  branchId: string | null;
  scopeKey: string;
  kind: string;
  locale: string;
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  payload: any;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  archivedAt: Date | null;
}

@Injectable()
export class PublicContentManagementService {
  private contentStore: PublicContentItem[] = [];

  constructor(private readonly policy: PolicyService) {}

  async list(
    principal: SessionPrincipal,
    input: { branchId?: string; kind?: string; status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' },
  ) {
    this.policy.requireCapability(principal.capabilities, 'public-content:read');
    if (
      input.branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(input.branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    return this.contentStore
      .filter((item) => {
        if (input.branchId && item.branchId !== input.branchId) return false;
        if (input.kind && item.kind !== input.kind) return false;
        if (input.status && item.status !== input.status) return false;
        return true;
      })
      .slice(0, 100);
  }

  async create(
    principal: SessionPrincipal,
    input: {
      contentKey: string;
      branchId?: string | null;
      kind: string;
      locale?: string;
      payload: unknown;
    },
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'public-content:manage');
    if (
      input.branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(input.branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const contentKey = input.contentKey?.trim().toUpperCase();
    const kind = input.kind?.trim().toUpperCase();
    const scopeKey = input.branchId || 'GLOBAL';
    if (!contentKey || !kind || !input.payload || typeof input.payload !== 'object')
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const existing = this.contentStore.filter(
      (c) => c.contentKey === contentKey && c.scopeKey === scopeKey,
    );
    const maxVersion = existing.reduce((max, c) => Math.max(max, c.version), 0);

    const item: PublicContentItem = {
      id: newId(),
      contentKey,
      branchId: input.branchId || null,
      scopeKey,
      kind,
      locale: input.locale || 'id-ID',
      version: maxVersion + 1,
      status: 'DRAFT',
      payload: input.payload,
      createdById: principal.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      archivedAt: null,
    };

    this.contentStore.unshift(item);
    return item;
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: 'PUBLISHED' | 'ARCHIVED',
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'public-content:manage');
    const current = this.contentStore.find((c) => c.id === id);
    if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (
      current.branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(current.branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (status === 'PUBLISHED' && current.status !== 'DRAFT')
      throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);

    if (status === 'PUBLISHED') {
      for (const item of this.contentStore) {
        if (
          item.contentKey === current.contentKey &&
          item.scopeKey === current.scopeKey &&
          item.locale === current.locale &&
          item.status === 'PUBLISHED' &&
          item.id !== current.id
        ) {
          item.status = 'ARCHIVED';
          item.archivedAt = new Date();
          item.updatedAt = new Date();
        }
      }
    }

    current.status = status;
    current.updatedAt = new Date();
    if (status === 'PUBLISHED') current.publishedAt = new Date();
    if (status === 'ARCHIVED') current.archivedAt = new Date();

    return current;
  }
}
