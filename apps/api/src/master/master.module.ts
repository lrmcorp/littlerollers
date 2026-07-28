import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { MasterController } from './master.controller';
import { MasterAccessService } from './master-access.service';
import { PublicProfileAdminService } from './public-profile-admin.service';
import { MasterCatalogService } from './master-catalog.service';
import { EffectiveSettingsService } from './effective-settings.service';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [MasterController],
  providers: [
    MasterAccessService,
    MasterCatalogService,
    EffectiveSettingsService,
    PublicProfileAdminService,
  ],
})
export class MasterModule {}
