import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { LEGACY_ROLE_ALIASES, type LegacyRoleAlias } from './role-aliases';

/**
 * Mengubah baris `user.role` yang masih memakai nama lama (SUPERADMIN, COACH, MEMBER) ke nama kanonik saat API
 * menyala. Idempotent dan hanya menyentuh kolom `role`; aman dijalankan di setiap boot dan di database mana pun.
 */
@Injectable()
export class RoleAliasMigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoleAliasMigrationService.name);

  constructor(private readonly db: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.normalize();
    } catch (error) {
      this.logger.warn(`Normalisasi peran lama dilewati: ${(error as Error).message}`);
    }
  }

  /** Mengembalikan jumlah baris yang diubah per nama lama. */
  async normalize(): Promise<Record<string, number>> {
    const changed: Record<string, number> = {};
    for (const alias of Object.keys(LEGACY_ROLE_ALIASES) as LegacyRoleAlias[]) {
      const { count } = await this.db.user.updateMany({
        where: { role: alias },
        data: { role: LEGACY_ROLE_ALIASES[alias] },
      });
      if (count > 0) changed[alias] = count;
    }
    if (Object.keys(changed).length > 0)
      this.logger.log(`Peran lama diubah ke nama kanonik: ${JSON.stringify(changed)}`);
    return changed;
  }
}
