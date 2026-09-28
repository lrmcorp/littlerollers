import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  WHATSAPP_CHANNEL,
  defaultText,
  renderTemplate,
} from './notification-template.registry';

/**
 * Menyusun teks pesan dari versi template yang diterbitkan. Kegagalan membaca template tidak boleh
 * menghentikan pengingat, sehingga selalu jatuh ke teks bawaan.
 */
@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);

  constructor(private readonly db: PrismaService) {}

  async whatsappText(
    templateKey: string,
    values: Record<string, string | number | undefined>,
  ): Promise<string> {
    try {
      const published = await this.db.notificationTemplate.findFirst({
        where: { templateKey, channel: WHATSAPP_CHANNEL, status: 'PUBLISHED' },
        orderBy: { version: 'desc' },
        select: { body: true },
      });
      if (published) return renderTemplate(published.body, values);
    } catch (error) {
      this.logger.warn(`Template ${templateKey} tidak terbaca, memakai teks bawaan: ${String(error)}`);
    }
    return defaultText(templateKey, values);
  }
}
