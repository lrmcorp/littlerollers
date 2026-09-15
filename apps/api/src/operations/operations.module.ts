import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FoundationModule } from '../foundation/foundation.module';
import { IdentityModule } from '../identity/identity.module';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';

import { SupportCasesController } from './support-cases.controller';
import { SupportCasesService } from './support-cases.service';
import { MigrationsController } from './migrations.controller';
import { MigrationsService } from './migrations.service';

@Module({
  imports: [DatabaseModule, FoundationModule, IdentityModule],
  controllers: [
    OperationsController,
    SupportCasesController,
    MigrationsController,
  ],
  providers: [
    OperationsService,
    SupportCasesService,
    MigrationsService,
  ],
  exports: [
    OperationsService,
    SupportCasesService,
    MigrationsService,
  ],
})
export class OperationsModule {}
