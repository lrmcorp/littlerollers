import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { FoundationModule } from '../foundation/foundation.module';
import { FinanceCommandController } from './finance-command.controller';
import { FinanceCommandService } from './transaksi-keuangan.service';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FinancialAggregationService } from './agregasi-keuangan.service';

@Module({
  imports: [IdentityModule, FoundationModule],
  controllers: [FinanceController, FinanceCommandController],
  providers: [FinanceService, FinanceCommandService, FinancialAggregationService],
  exports: [FinancialAggregationService],
})
export class FinanceModule {}
