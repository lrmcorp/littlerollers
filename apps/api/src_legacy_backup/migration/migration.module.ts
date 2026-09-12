import { Global, Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';
import { PilotRollbackOutboxService } from './pilot-rollback-outbox.service';

@Global()
@Module({
  imports: [IdentityModule],
  controllers: [MigrationController],
  providers: [MigrationService, PilotRollbackOutboxService],
  exports: [PilotRollbackOutboxService],
})
export class MigrationModule {}
