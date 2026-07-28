import { Injectable } from '@nestjs/common';
import { Prisma, type NotificationOccurrence } from '@prisma/client';
import {
  deterministicKey,
  encryptEnvelope,
  hashEmail,
  maskEmail,
  type EmailTemplateKey,
} from '@dailydose/notification-core';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';

type Database = PrismaService | Prisma.TransactionClient;

@Injectable()
export class EmailNotificationService {
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
    database: Database = this.db,
  ): Promise<NotificationOccurrence | null> {
    const email = this.config.value.email;
    if (!email.encryptionKey) {
      if (!email.deliveryEnabled) return null;
      throw new Error('CONFIGURATION_MISSING:NOTIFICATION_ENCRYPTION_KEY');
    }
    const recipient = email.recipientOverride || input.recipient.trim().toLowerCase();
    const occurrenceKey = deterministicKey(
      'email',
      input.eventType,
      input.templateKey,
      ...input.occurrenceParts,
    );
    return database.notificationOccurrence.upsert({
      where: { occurrenceKey },
      create: {
        id: crypto.randomUUID(),
        occurrenceKey,
        sourceEventId: input.sourceEventId,
        userId: input.userId,
        branchId: input.branchId,
        eventType: input.eventType,
        templateKey: input.templateKey,
        templateVersion: 1,
        recipientHash: hashEmail(recipient),
        recipientMasked: maskEmail(recipient),
        envelopeEncrypted: encryptEnvelope(
          { to: recipient, variables: input.variables },
          email.encryptionKey,
        ),
        maxAttempts: email.maxAttempts,
        correlationId: input.correlationId,
        expiresAt: input.expiresAt,
      },
      update: {},
    });
  }
}
