import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PublicSiteConfigController } from './public-site-config.controller';
import { PublicSiteConfigService } from './public-site-config.service';
import {
  PublicPackageCatalogController,
  PublicProfileController,
  PublicScheduleCatalogController,
} from './public-catalog.controller';
import { PublicClassQueryService } from './public-class-query.service';
import { PublicPackageQueryService } from './public-package-query.service';
import { PublicScheduleQueryService } from './public-schedule-query.service';
import { PublicStudioQueryService } from './public-studio-query.service';
import { IdentityModule } from '../identity/identity.module';
import { PublicContentManagementController } from './public-content-management.controller';
import { PublicContentManagementService } from './public-content-management.service';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [
    PublicSiteConfigController,
    PublicPackageCatalogController,
    PublicScheduleCatalogController,
    PublicProfileController,
    PublicContentManagementController,
  ],
  providers: [
    PublicSiteConfigService,
    PublicPackageQueryService,
    PublicScheduleQueryService,
    PublicClassQueryService,
    PublicStudioQueryService,
    PublicContentManagementService,
  ],
})
export class PublicContentModule {}
