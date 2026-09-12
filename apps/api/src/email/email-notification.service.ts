import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  deterministicKey,
  type EmailTemplateKey,
} from '@dailydose/notification-core';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';

type Database = PrismaService | Prisma.TransactionClient;

export interface NotificationOccurrence {
  id: string;
  occurrenceKey: string;
  eventType: string;
  templateKey: string;
  status: string;
  createdAt: Date;
}

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly config: RuntimeConfigService,
  ) {}

  async enqueue(
    input: {
      eventType: string;
      templateKey: EmailTemplateKey;
      recipient: string;
      variables: Record<string, string>;
      correlationId: string;
      occurrenceParts: Array<string | number | null | undefined>;
      sourceEventId?: string;
      userId?: string;
      branchId?: string;
      expiresAt?: Date;
    },
    _database: Database = this.db,
  ): Promise<NotificationOccurrence | null> {
    const email = this.config.value.email;
    if (!email.deliveryEnabled) return null;

    const recipient = email.recipientOverride || input.recipient.trim().toLowerCase();
    const occurrenceKey = deterministicKey(
      'email',
      input.eventType,
      input.templateKey,
      ...input.occurrenceParts,
    );

    this.logger.log(
      `[EMAIL QUEUED] template=${input.templateKey} to=${recipient} event=${input.eventType} key=${occurrenceKey}`,
    );

    return {
      id: crypto.randomUUID(),
      occurrenceKey,
      eventType: input.eventType,
      templateKey: input.templateKey,
      status: 'QUEUED',
      createdAt: new Date(),
    };
  }
}
