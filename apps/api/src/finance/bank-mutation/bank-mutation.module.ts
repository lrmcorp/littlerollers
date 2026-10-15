import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { IdentityModule } from '../../identity/identity.module';
import { BankMutationController } from './bank-mutation.controller';
import { BankMutationService } from './bank-mutation.service';
import { ReconciliationEngineService } from './reconciliation-engine.service';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [BankMutationController],
  providers: [BankMutationService, ReconciliationEngineService],
  exports: [BankMutationService, ReconciliationEngineService],
})
export class BankMutationModule {}
