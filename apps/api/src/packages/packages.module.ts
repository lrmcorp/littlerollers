import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FoundationModule } from '../foundation/foundation.module';
import { IdentityModule } from '../identity/identity.module';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import {
  ConfigGatedMalwareScanProvider,
  ConfigGatedObjectStorageProvider,
} from './proof-providers';

@Module({
  imports: [DatabaseModule, FoundationModule, IdentityModule],
  controllers: [PackagesController],
  providers: [PackagesService, ConfigGatedObjectStorageProvider, ConfigGatedMalwareScanProvider],
})
export class PackagesModule {}
