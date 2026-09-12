import { HttpStatus, Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';

export interface NotificationTemplateItem {
  id: string;
  templateKey: string;
  channel: string;
  version: number;
  eventType: string;
  audience: unknown;
  subject: string | null;
  title: string;
  body: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  archivedAt: Date | null;
}

@Injectable()
export class NotificationManagementService {
  private templates: NotificationTemplateItem[] = [];

  constructor(private readonly policy: PolicyService) {}

  private require(principal: SessionPrincipal) {
    this.policy.requireGlobalCapability(principal, 'notification:manage');
  }

  async overview(principal: SessionPrincipal, status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
    this.require(principal);

    const filtered = this.templates.filter((t) => (status ? t.status === status : true));

    return {
      templates: filtered,
      deliveries: [],
      metrics: {
        DELIVERED: 0,
        PENDING: 0,
        FAILED: 0,
      },
      deferredChannels: ['WHATSAPP'],
    };
  }

  async create(
    principal: SessionPrincipal,
    input: {
      templateKey: string;
      channel: string;
      eventType: string;
      audience: unknown;
      subject?: string;
      title: string;
      body: string;
    },
    _correlationId: string,
  ) {
    this.require(principal);
    const templateKey = input.templateKey?.trim().toUpperCase();
    if (
      !templateKey ||
      !/^[A-Z0-9_]{3,96}$/u.test(templateKey) ||
      !input.eventType?.trim() ||
      !input.title?.trim() ||
      !input.body?.trim()
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const existing = this.templates.filter(
      (t) => t.templateKey === templateKey && t.channel === input.channel,
    );
    const maxVersion = existing.reduce((max, t) => Math.max(max, t.version), 0);

    const created: NotificationTemplateItem = {
      id: newId(),
      templateKey,
      channel: input.channel,
      version: maxVersion + 1,
      eventType: input.eventType.trim(),
      audience: input.audience ?? {},
      subject: input.subject?.trim() || null,
      title: input.title.trim(),
      body: input.body.trim(),
      status: 'DRAFT',
      createdById: principal.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      archivedAt: null,
    };

    this.templates.unshift(created);
    return created;
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: 'PUBLISHED' | 'ARCHIVED',
    _correlationId: string,
  ) {
    this.require(principal);
    const current = this.templates.find((t) => t.id === id);
    if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (status === 'PUBLISHED' && current.status !== 'DRAFT')
      throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);

    if (status === 'PUBLISHED') {
      for (const item of this.templates) {
        if (
          item.templateKey === current.templateKey &&
          item.channel === current.channel &&
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
