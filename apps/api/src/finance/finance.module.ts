import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { FoundationModule } from '../foundation/foundation.module';
import { FinanceCommandController } from './finance-command.controller';
import { FinanceCommandService } from './finance-command.service';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [IdentityModule, FoundationModule],
  controllers: [FinanceController, FinanceCommandController],
  providers: [FinanceService, FinanceCommandService],
})
export class FinanceModule {}
