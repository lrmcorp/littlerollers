import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FoundationModule } from '../foundation/foundation.module';
import { IdentityModule } from '../identity/identity.module';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { PublicPackageCatalogController } from './public-package-catalog.controller';
import { PublicPackageCatalogService } from './public-package-catalog.service';
import {
  ConfigGatedMalwareScanProvider,
  ConfigGatedObjectStorageProvider,
} from './proof-providers';

@Module({
  imports: [DatabaseModule, FoundationModule, IdentityModule],
  controllers: [PackagesController, PublicPackageCatalogController],
  providers: [
    PackagesService,
    PublicPackageCatalogService,
    ConfigGatedObjectStorageProvider,
    ConfigGatedMalwareScanProvider,
  ],
})
export class PackagesModule {}
